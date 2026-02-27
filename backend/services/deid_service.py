import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig


# ----------------------------
# Setup Presidio (Load once)
# ----------------------------
configuration = {
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": "en", "model_name": "en_core_web_lg"}],
}

provider = NlpEngineProvider(nlp_configuration=configuration)
nlp_engine = provider.create_engine()

analyzer = AnalyzerEngine(nlp_engine=nlp_engine)
anonymizer = AnonymizerEngine()

mrn_pattern = Pattern(
    name="mrn_pattern",
    regex=r"\bMRN[:\s\-]*[A-Z0-9\-]+\b",
    score=0.85,
)

mrn_recognizer = PatternRecognizer(
    supported_entity="MEDICAL_RECORD_NUMBER",
    patterns=[mrn_pattern],
)

analyzer.registry.add_recognizer(mrn_recognizer)


# ----------------------------
# Helpers
# ----------------------------
def extract_text_auto(pdf_path, job):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)

        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

            job["progress"] = int((i + 1) / total_pages * 40)

    if len(text.strip()) < 50:
        job["logs"].append("OCR triggered")
        images = convert_from_path(pdf_path)
        for img in images:
            text += pytesseract.image_to_string(img)

    return text


def deidentify_text(text, job):
    results = analyzer.analyze(text=text, language="en", score_threshold=0.6)

    job["phi_removed"] = len(results)
    job["logs"].append(f"{len(results)} PHI entities detected")

    anonymized = anonymizer.anonymize(
        text=text,
        analyzer_results=results,
        operators={
            "PERSON": OperatorConfig("replace", {"new_value": "[NAME]"}),
            "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "[PHONE]"}),
            "DATE_TIME": OperatorConfig("replace", {"new_value": "[DATE]"}),
            "LOCATION": OperatorConfig("replace", {"new_value": "[LOCATION]"}),
            "ORGANIZATION": OperatorConfig("replace", {"new_value": "[HOSPITAL]"}),
            "MEDICAL_RECORD_NUMBER": OperatorConfig("replace", {"new_value": "[MRN]"}),
        },
    )

    job["progress"] = 80
    return anonymized.text


def save_pdf(text, output_path, job):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    y = height - 40

    for line in text.split("\n"):
        if y < 40:
            c.showPage()
            y = height - 40

        c.drawString(40, y, line[:110])
        y -= 15

    c.save()
    job["progress"] = 100


# ----------------------------
# Main Processor
# ----------------------------
def process_pdf_file(batch_id, file_id, input_path, output_path, jobs):

    file_job = next(
        f for f in jobs[batch_id]["files"]
        if f["file_id"] == file_id
    )

    try:
        text = extract_text_auto(input_path, file_job)
        clean_text = deidentify_text(text, file_job)
        save_pdf(clean_text, output_path, file_job)

        file_job["status"] = "completed"
        file_job["progress"] = 100
        file_job["logs"].append("Processing completed")

    except Exception as e:
        file_job["status"] = "error"
        file_job["logs"].append(str(e))

    # Update batch status
    all_done = all(
        f["status"] in ["completed", "error"]
        for f in jobs[batch_id]["files"]
    )

    if all_done:
        jobs[batch_id]["status"] = "completed"

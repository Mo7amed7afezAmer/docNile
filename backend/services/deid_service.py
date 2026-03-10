import os
import pdfplumber
import pytesseract
import pydicom
from pydicom.uid import generate_uid
from pydantic import BaseModel, create_model
from pdf2image import convert_from_path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PIL import Image

from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

from backend.services.radiology_analytics import generate_radiology_analytics, analyze_radiology_report


# ============================
# Setup Presidio (Load Once)
# ============================

configuration = {
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}],  # أخف من lg
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


# ============================
# TEXT EXTRACTION
# ============================

def extract_text_from_pdf(pdf_path, job):
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


def extract_text_from_image(image_path):
    img = Image.open(image_path)
    return pytesseract.image_to_string(img)


# ============================
# TEXT DE-IDENTIFICATION
# ============================

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


# ============================
# SAVE TEXT TO PDF
# ============================

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


# ============================
# DICOM DE-IDENTIFICATION
# ============================

def deidentify_dicom(input_path, output_path):
    ds = pydicom.dcmread(input_path)

    fields_to_clear = [
        "PatientName",
        "PatientID",
        "PatientBirthDate",
        "PatientSex",
        "OtherPatientIDs",
        "OtherPatientNames",
        "InstitutionName",
        "ReferringPhysicianName",
        "StudyID",
        "AccessionNumber",
    ]

    for field in fields_to_clear:
        if hasattr(ds, field):
            setattr(ds, field, "")

    # Regenerate UIDs
    ds.StudyInstanceUID = generate_uid()
    ds.SeriesInstanceUID = generate_uid()
    ds.SOPInstanceUID = generate_uid()

    ds.save_as(output_path)


# ============================
# MAIN UNIVERSAL PROCESSOR
# ============================

def process_medical_file(batch_id, file_id, input_path, output_path, jobs):

    file_job = next(
        f for f in jobs[batch_id]["files"]
        if f["file_id"] == file_id
    )

    try:
        ext = os.path.splitext(input_path)[1].lower()

        if ext == ".pdf":
            text = extract_text_from_pdf(input_path, file_job)
            clean_text = deidentify_text(text, file_job)
            save_pdf(clean_text, output_path.replace(ext, ".pdf"), file_job)

        elif ext in [".jpg", ".jpeg", ".png"]:
            text = extract_text_from_image(input_path)
            clean_text = deidentify_text(text, file_job)
            save_pdf(clean_text, output_path.replace(ext, ".pdf"), file_job)

        elif ext == ".dcm":
            deidentify_dicom(input_path, output_path.replace(ext, ".dcm"))

        else:
            raise ValueError("Unsupported file type")

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


# *********************** analytics
def analytics_medical_file(batch_id, file_id, input_path, output_path, jobs):

    file_job = next(
        f for f in jobs[batch_id]["files"]
        if f["file_id"] == file_id
    )

    try:
        ext = os.path.splitext(input_path)[1].lower()

        if ext == ".pdf":

            text = extract_text_from_pdf(input_path, file_job)

            # Radiology Analytics
            analytics = generate_radiology_analytics(text, file_job)

            # De-identification
            clean_text = deidentify_text(text, file_job)

            save_pdf(clean_text, output_path.replace(ext, ".pdf"), file_job)

        elif ext in [".jpg", ".jpeg", ".png"]:

            text = extract_text_from_image(input_path)
            
            # Radiology Analytics
            analytics = generate_radiology_analytics(text, file_job)

            clean_text = deidentify_text(text, file_job)
            save_pdf(clean_text, output_path.replace(ext, ".pdf"), file_job)

        else:
            raise ValueError("Unsupported file type")

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
import spacy
import re
from collections import defaultdict
from typing import Dict, List

# ==============================
# Load SciSpacy Model (once)
# ==============================

# nlp = spacy.load("en_core_sci_sm")
# nlp = spacy.load("en_ner_bionlp13cg_md")
nlp_anatomy = spacy.load("en_ner_bionlp13cg_md")
nlp_disease = spacy.load("en_ner_bc5cdr_md")

FINDING_PATTERNS = [
    r"\b\w+\s+cyst\b",
    r"\b\w+\s+lesion\b",
    r"\b\w+\s+mass\b",
    r"\bdilatation\b",
    r"\benhancement\b"
]

def extract_findings_regex(text):

    findings = set()

    for p in FINDING_PATTERNS:
        matches = re.findall(p, text.lower())
        findings.update(matches)

    return findings

# ==============================
# Entity Extraction
# ==============================

def extract_medical_entities(text: str) -> Dict[str, List[str]]:

    doc_anatomy = nlp_anatomy(text)
    doc_disease = nlp_disease(text)

    entities = defaultdict(set)

    # diseases
    for ent in doc_disease.ents:
        entities["diseases"].add(ent.text)

    # anatomy
    anatomy_labels = {"ORGAN", "TISSUE", "ANATOMICAL_SYSTEM"}

    for ent in doc_anatomy.ents:
        if ent.label_ in anatomy_labels:
            entities["anatomy"].add(ent.text)
        else:
            # entities["findings"].add(ent.text)
            entities["findings"].update(extract_findings_regex(text))

    return {
        "diseases": list(entities["diseases"]),
        "anatomy": list(entities["anatomy"]),
        "findings": list(entities["findings"])
    }
# def extract_medical_entities(text: str) -> Dict[str, List[str]]:
#     """
#     Extract medical entities from radiology report using SciSpacy
#     """

#     doc = nlp(text)

#     entities = defaultdict(set)

#     for ent in doc.ents:

#         label = ent.label_

#         if label in ["DISEASE"]:
#             entities["diseases"].add(ent.text)

#         elif label in ["ANATOMICAL_SYSTEM","ORGAN","TISSUE"]:
#             entities["anatomy"].add(ent.text)

#         else:
#             entities["findings"].add(ent.text)

#     # for debug
#     for ent in doc.ents:
#         print(ent.text, ent.label_)

#     return {
#         "diseases": list(entities["diseases"]),
#         "anatomy": list(entities["anatomy"]),
#         "findings": list(entities["findings"]),
#     }


# ==============================
# Negation Detection (Placeholder)
# ==============================

def detect_negations(text: str) -> List[str]:
    """
    Detect negated findings in the report
    (Replace later with NegBio)
    """

    negation_keywords = [
        "no evidence of",
        "no sign of",
        "without",
        "negative for",
        "absence of"
    ]

    sentences = text.split(".")
    # sentences = [sent.text for sent in nlp(text).sents]
    negated = []

    for s in sentences:
        for n in negation_keywords:
            if n in s.lower():
                negated.append(s.strip())
                break

    return negated


# ==============================
# RadGraph Relation Builder
# ==============================

def build_radgraph(entities: Dict[str, List[str]]) -> List[Dict]:
    """
    Build simple relations between anatomy and findings
    """

    relations = []

    for anatomy in entities.get("anatomy", []):
        for finding in entities.get("findings", []):
            relations.append({
                "anatomy": anatomy,
                "finding": finding
            })

    return relations


# ==============================
# Main Radiology Analyzer
# ==============================

def analyze_radiology_report(text: str) -> Dict:
    """
    Run full radiology analytics pipeline
    """

    entities = extract_medical_entities(text)

    negations = detect_negations(text)

    relations = build_radgraph(entities)

    return {
        "entities": entities,
        "negated_sentences": negations,
        "relations": relations,
        "total_findings": len(entities["findings"]),
        "total_diseases": len(entities["diseases"]),
    }


# ==============================
# Final Analytics Function
# ==============================

def generate_radiology_analytics(text: str, job=None) -> Dict:
    """
    Generate analytics for radiology report text
    """

    analytics = analyze_radiology_report(text)

    result = {
        "diseases": analytics["entities"]["diseases"],
        "anatomy": analytics["entities"]["anatomy"],
        "findings": analytics["entities"]["findings"],
        "relations": analytics["relations"],
        "negated_sentences": analytics["negated_sentences"],
        "statistics": {
            "total_findings": analytics["total_findings"],
            "total_diseases": analytics["total_diseases"],
        },
    }

    print(result)

    if job:
        job["analytics"] = result
        job["logs"].append("Radiology analytics generated")

    return result
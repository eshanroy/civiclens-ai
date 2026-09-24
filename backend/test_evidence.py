from app.services.document_extractor import extract_text_from_pdf
from app.services.evidence_service import find_evidence


pdf_path = "uploads/fir1.pdf"

extraction = extract_text_from_pdf(pdf_path)

text = extraction["text"]

phrases = [
    "FIR No: 120/2022",
    "Name of Injured: Mamata Naik",
    "complaint has been registered against the car owner"
]

print("\n========== CIVICLENS EVIDENCE ENGINE ==========\n")

for phrase in phrases:

    evidence = find_evidence(text, phrase)

    print(f"SEARCH: {phrase}")
    print(f"EVIDENCE: {evidence}")
    print("\n--------------------------------------------\n")
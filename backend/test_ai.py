from app.services.document_extractor import extract_text_from_pdf
from app.services.ai_service import analyze_document


pdf_path = "uploads/fir1.pdf"

print("\n========== CIVICLENS AI ANALYSIS ==========\n")

print("Step 1: Extracting document text...")

extraction = extract_text_from_pdf(pdf_path)

print(
    f"Extracted {extraction['characters_extracted']} "
    f"characters from {extraction['total_pages']} page(s)."
)

print("\nStep 2: Sending document to AI...")

analysis = analyze_document(extraction["text"])

print("\n========== AI RESULT ==========\n")

print(analysis)

print("\n================================\n")
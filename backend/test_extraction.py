from app.services.document_extractor import extract_text_from_pdf


pdf_path = "uploads/fir1.pdf"

result = extract_text_from_pdf(pdf_path)

print("\n========== CIVICLENS DOCUMENT EXTRACTION ==========\n")

print(f"Filename: {result['filename']}")
print(f"Total pages: {result['total_pages']}")
print(f"Native pages: {result['native_pages']}")
print(f"OCR pages: {result['ocr_pages']}")
print(f"Characters extracted: {result['characters_extracted']}")

print("\n========== EXTRACTED TEXT ==========\n")

print(result["text"])

print("\n===============================================\n")
from pathlib import Path
import os

import pymupdf
import pytesseract
from PIL import Image


tesseract_cmd = os.getenv(
    "TESSERACT_CMD",
    "tesseract"
)

pytesseract.pytesseract.tesseract_cmd = tesseract_cmd


def extract_text_from_pdf(file_path: str) -> dict:
    """
    Extract text from a PDF.

    Strategy:
    1. Try native PDF text extraction using PyMuPDF.
    2. If a page contains little/no text, use Tesseract OCR.
    """

    pdf_path = Path(file_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {file_path}")

    document = pymupdf.open(pdf_path)

    extracted_pages = []
    ocr_pages = 0
    native_pages = 0

    for page_number, page in enumerate(document, start=1):

        # Try normal text extraction first
        text = page.get_text("text").strip()

        if len(text) >= 50:
            native_pages += 1

            extracted_pages.append({
                "page": page_number,
                "method": "native",
                "text": text
            })

        else:
            # Render PDF page as an image
            pixmap = page.get_pixmap(
                matrix=pymupdf.Matrix(2, 2)
            )

            image = Image.frombytes(
                "RGB",
                [pixmap.width, pixmap.height],
                pixmap.samples
            )

            # OCR using Tesseract
            ocr_text = pytesseract.image_to_string(image).strip()

            ocr_pages += 1

            extracted_pages.append({
                "page": page_number,
                "method": "ocr",
                "text": ocr_text
            })

    document.close()

    combined_text = "\n\n".join(
        page["text"]
        for page in extracted_pages
        if page["text"]
    )

    return {
        "filename": pdf_path.name,
        "total_pages": len(extracted_pages),
        "native_pages": native_pages,
        "ocr_pages": ocr_pages,
        "characters_extracted": len(combined_text),
        "text": combined_text,
        "pages": extracted_pages
    }
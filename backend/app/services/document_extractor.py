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


def run_ocr(page, scale: float) -> str:
    """
    Render a PDF page at the requested scale and run Tesseract OCR.
    """

    pixmap = page.get_pixmap(
        matrix=pymupdf.Matrix(scale, scale)
    )

    image = Image.frombytes(
        "RGB",
        [pixmap.width, pixmap.height],
        pixmap.samples
    )

    text = pytesseract.image_to_string(
        image
    ).strip()

    return text


def extract_text_from_pdf(file_path: str) -> dict:
    """
    Extract text from a PDF.

    Strategy:
    1. Try native PDF text extraction using PyMuPDF.
    2. If a page contains little/no text, use Tesseract OCR.
    3. Start OCR at 1x resolution to reduce memory usage.
    4. If the result is too short, retry that page at 2x resolution.
    """

    pdf_path = Path(file_path)

    if not pdf_path.exists():
        raise FileNotFoundError(
            f"PDF not found: {file_path}"
        )

    document = pymupdf.open(pdf_path)

    extracted_pages = []
    ocr_pages = 0
    native_pages = 0

    for page_number, page in enumerate(
        document,
        start=1
    ):
        text = page.get_text("text").strip()

        if len(text) >= 50:
            native_pages += 1

            extracted_pages.append({
                "page": page_number,
                "method": "native",
                "text": text
            })

        else:
            ocr_text = run_ocr(
                page,
                scale=1.0
            )

            # If 1x OCR produced too little text,
            # retry at higher resolution.
            if len(ocr_text) < 300:
                ocr_text = run_ocr(
                    page,
                    scale=2.0
                )

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
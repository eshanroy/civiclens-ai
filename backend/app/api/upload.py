from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.document import Document
from app.services.document_service import process_document


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):
    """
    Upload a PDF document.
    """

    result = await process_document(file)

    return {
        "message": "Document uploaded and analyzed successfully",
        **result
    }


@router.post("/analyze")
async def analyze_document_endpoint(
    file: UploadFile = File(...)
):
    """
    Upload and fully analyze a civic document.

    Pipeline:
    PDF → OCR/Text → AI → Evidence
    """

    result = await process_document(file)

    return {
        "message": "Document analyzed successfully",
        **result
    }


@router.get("/history")
def get_document_history(
    db: Session = Depends(get_db)
):
    """
    Return previously analyzed documents.
    """

    documents = (
        db.query(Document)
        .order_by(Document.created_at.desc())
        .all()
    )

    return {
        "count": len(documents),
        "documents": [
            {
                "id": document.id,
                "filename": document.filename,
                "document_type": document.document_type,
                "summary": document.summary,
                "created_at": document.created_at.isoformat()
            }
            for document in documents
        ]
    }
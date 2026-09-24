import json
from pathlib import Path

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.document import Document

from app.services.document_extractor import extract_text_from_pdf
from app.services.ai_service import analyze_document
from app.services.evidence_service import find_evidence


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


async def process_document(file: UploadFile) -> dict:
    """
    Complete CivicLens document processing pipeline.

    Flow:
    1. Validate uploaded file
    2. Save PDF
    3. Extract text
    4. Analyze using AI
    5. Attach source evidence
    6. Create or update database record
    7. Return structured result
    """

    # ---------------------------------------------------------
    # STEP 1: Validate file
    # ---------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided"
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    # ---------------------------------------------------------
    # STEP 2: Save uploaded document
    # ---------------------------------------------------------

    file_path = UPLOAD_DIR / file.filename

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # ---------------------------------------------------------
    # STEP 3: Extract text
    # ---------------------------------------------------------

    extraction = extract_text_from_pdf(
        str(file_path)
    )

    extracted_text = extraction["text"]

    if not extracted_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text could be extracted from the document"
        )

    # ---------------------------------------------------------
    # STEP 4: AI analysis
    # ---------------------------------------------------------

    analysis = analyze_document(
        extracted_text
    )

    # ---------------------------------------------------------
    # STEP 5: Evidence grounding
    # ---------------------------------------------------------

    evidence_items = []

    # ---------------------------------------------------------
    # Important dates
    # ---------------------------------------------------------

    for item in analysis.get(
        "important_dates",
        []
    ):

        date = item.get(
            "date",
            ""
        )

        if date:

            evidence = find_evidence(
                extracted_text,
                date
            )

            evidence_items.append({
                "claim_type": "important_date",
                "claim": item,
                "evidence": evidence
            })

    # ---------------------------------------------------------
    # People
    # ---------------------------------------------------------

    for person in analysis.get(
        "people",
        []
    ):

        name = person.get(
            "name",
            ""
        )

        if name:

            evidence = find_evidence(
                extracted_text,
                name
            )

            evidence_items.append({
                "claim_type": "person",
                "claim": person,
                "evidence": evidence
            })

    # ---------------------------------------------------------
    # Organizations
    # ---------------------------------------------------------

    for organization in analysis.get(
        "organizations",
        []
    ):

        name = organization.get(
            "name",
            ""
        )

        if name:

            evidence = find_evidence(
                extracted_text,
                name
            )

            evidence_items.append({
                "claim_type": "organization",
                "claim": organization,
                "evidence": evidence
            })

    # ---------------------------------------------------------
    # Locations
    # ---------------------------------------------------------

    for location in analysis.get(
        "locations",
        []
    ):

        location_name = location.get(
            "location",
            ""
        )

        if location_name:

            evidence = find_evidence(
                extracted_text,
                location_name
            )

            evidence_items.append({
                "claim_type": "location",
                "claim": location,
                "evidence": evidence
            })

    # ---------------------------------------------------------
    # Reference numbers
    # ---------------------------------------------------------

    for reference in analysis.get(
        "reference_numbers",
        []
    ):

        value = reference.get(
            "value",
            ""
        )

        if value:

            evidence = find_evidence(
                extracted_text,
                value
            )

            evidence_items.append({
                "claim_type": "reference_number",
                "claim": reference,
                "evidence": evidence
            })

    # ---------------------------------------------------------
    # Amounts
    # ---------------------------------------------------------

    for amount in analysis.get(
        "amounts",
        []
    ):

        amount_value = amount.get(
            "amount",
            ""
        )

        if amount_value:

            evidence = find_evidence(
                extracted_text,
                amount_value
            )

            evidence_items.append({
                "claim_type": "amount",
                "claim": amount,
                "evidence": evidence
            })

    # ---------------------------------------------------------
    # Required actions
    # ---------------------------------------------------------

    for action in analysis.get(
        "required_actions",
        []
    ):

        action_text = action.get(
            "action",
            ""
        )

        deadline = action.get(
            "deadline",
            ""
        )

        evidence = None

        if action_text:

            evidence = find_evidence(
                extracted_text,
                action_text
            )

        if evidence is None and deadline:

            evidence = find_evidence(
                extracted_text,
                deadline
            )

        evidence_items.append({
            "claim_type": "required_action",
            "claim": action,
            "evidence": evidence
        })

    # ---------------------------------------------------------
    # Warnings
    # ---------------------------------------------------------

    for warning in analysis.get(
        "warnings",
        []
    ):

        warning_text = warning.get(
            "warning",
            ""
        )

        reason = warning.get(
            "reason",
            ""
        )

        evidence = None

        if warning_text:

            evidence = find_evidence(
                extracted_text,
                warning_text
            )

        if evidence is None and reason:

            evidence = find_evidence(
                extracted_text,
                reason
            )

        evidence_items.append({
            "claim_type": "warning",
            "claim": warning,
            "evidence": evidence
        })

    # ---------------------------------------------------------
    # Key facts
    # ---------------------------------------------------------

    for fact in analysis.get(
        "key_facts",
        []
    ):

        fact_name = fact.get(
            "fact",
            ""
        )

        fact_value = fact.get(
            "value",
            ""
        )

        evidence = None

        if (
            fact_value
            and fact_value.lower() not in {
                "yes",
                "no",
                "true",
                "false"
            }
        ):

            evidence = find_evidence(
                extracted_text,
                fact_value
            )

        if evidence is None and fact_name:

            evidence = find_evidence(
                extracted_text,
                fact_name
            )

        evidence_items.append({
            "claim_type": "key_fact",
            "claim": {
                "fact": fact_name,
                "value": fact_value
            },
            "evidence": evidence
        })

    # ---------------------------------------------------------
    # STEP 6: Save or update analysis
    # ---------------------------------------------------------

    db: Session = SessionLocal()

    try:

        existing_document = (
            db.query(Document)
            .filter(
                Document.filename == extraction["filename"]
            )
            .order_by(
                Document.created_at.desc()
            )
            .first()
        )

        if existing_document:

            existing_document.document_type = analysis.get(
                "document_type",
                "Unknown"
            )

            existing_document.summary = analysis.get(
                "summary",
                ""
            )

            existing_document.analysis_json = json.dumps(
                analysis,
                ensure_ascii=False
            )

            existing_document.evidence_json = json.dumps(
                evidence_items,
                ensure_ascii=False
            )

            db.commit()

            db.refresh(existing_document)

            document_id = existing_document.id

        else:

            document_record = Document(
                filename=extraction["filename"],
                document_type=analysis.get(
                    "document_type",
                    "Unknown"
                ),
                summary=analysis.get(
                    "summary",
                    ""
                ),
                analysis_json=json.dumps(
                    analysis,
                    ensure_ascii=False
                ),
                evidence_json=json.dumps(
                    evidence_items,
                    ensure_ascii=False
                )
            )

            db.add(document_record)

            db.commit()

            db.refresh(document_record)

            document_id = document_record.id

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()

    # ---------------------------------------------------------
    # STEP 7: Return complete CivicLens result
    # ---------------------------------------------------------

    return {
        "document": {
            "id": document_id,
            "filename": extraction["filename"],
            "total_pages": extraction["total_pages"],
            "native_pages": extraction["native_pages"],
            "ocr_pages": extraction["ocr_pages"],
            "characters_extracted": extraction[
                "characters_extracted"
            ]
        },

        "analysis": analysis,

        "evidence": evidence_items
    }
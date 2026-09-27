from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.deviation import Deviation

from app.ai.graph import run_deviation_ai, edit_deviation_with_ai
from app.services.pdf_parser import extract_text_from_pdf


router = APIRouter(
    prefix="/api/deviations",
    tags=["Deviations"]
)


# =========================
# Request models
# =========================

class DeviationInput(BaseModel):
    text: str

class DeviationEditInput(BaseModel):
    instruction: str
    current_data: dict

class DeviationCreate(BaseModel):
    site: str = ""
    date: str = ""
    title: str = ""
    source: str = ""
    product: str = ""
    batch: str = ""
    description: str = ""
    impact: str = ""
    severity: str = ""
    severity_reason: str = ""


# =========================
# AI TEXT EXTRACTION
# =========================

@router.post("/extract")
def extract_deviation(data: DeviationInput):

    if not data.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Deviation text cannot be empty."
        )

    try:
        result = run_deviation_ai(data.text)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        print("AI ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail="AI extraction failed. Check the backend terminal."
        )


# =========================
# AI PDF EXTRACTION
# =========================

@router.post("/extract-pdf")
async def extract_deviation_pdf(
    file: UploadFile = File(...)
):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    try:
        file_bytes = await file.read()

        extracted_text = extract_text_from_pdf(file_bytes)

        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the PDF."
            )

        result = run_deviation_ai(extracted_text)

        return {
            "success": True,
            "filename": file.filename,
            "data": result
        }

    except HTTPException:
        raise

    except Exception as e:
        print("PDF AI ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail="PDF processing failed. Check the backend terminal."
        )


# =========================
# SAVE DEVIATION TO DATABASE
# =========================

@router.post("")
def save_deviation(
    data: DeviationCreate,
    db: Session = Depends(get_db)
):

    try:

        deviation = Deviation(
            site=data.site,
            date=data.date,
            title=data.title,
            source=data.source,
            product=data.product,
            batch=data.batch,
            description=data.description,
            impact=data.impact,
            severity=data.severity,
            severity_reason=data.severity_reason,
        )

        db.add(deviation)

        db.commit()

        db.refresh(deviation)

        return {
            "success": True,
            "message": "Deviation saved successfully",
            "id": deviation.id
        }

    except Exception as e:

        db.rollback()

        print("DATABASE ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Could not save deviation."
        )
@router.get("")
def get_deviations(
    db: Session = Depends(get_db)
):
    try:
        deviations = (
            db.query(Deviation)
            .order_by(Deviation.id.desc())
            .all()
        )

        return {
            "success": True,
            "data": [
                {
                    "id": deviation.id,
                    "site": deviation.site,
                    "date": deviation.date,
                    "title": deviation.title,
                    "source": deviation.source,
                    "product": deviation.product,
                    "batch": deviation.batch,
                    "description": deviation.description,
                    "impact": deviation.impact,
                    "severity": deviation.severity,
                    "severity_reason": deviation.severity_reason,
                    "created_at": deviation.created_at,
                }
                for deviation in deviations
            ],
        }

    except Exception as e:
        print("DATABASE FETCH ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Could not fetch deviations."
        )
@router.post("/edit")
def edit_deviation(data: DeviationEditInput):
    try:
        updated_data = edit_deviation_with_ai(
            data.instruction,
            data.current_data
        )

        return {
            "success": True,
            "data": updated_data
        }

    except Exception as e:
        print("AI EDIT ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Could not process the edit request."
        )
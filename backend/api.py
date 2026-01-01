from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import List
from backend.security import get_api_key
from backend.rag import process_document, generate_quiz_from_doc

router = APIRouter()

@router.post("/upload/", tags=["Quiz Generation"])
async def upload_document(
    file: UploadFile = File(...),
    topic: str = Form(None),
    api_key: str = Depends(get_api_key),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    try:
        file_content = await file.read()
        vector_store = process_document(file_content, file.filename)
        # In a real app, you'd save the vector_store's ID/path for the user
        return {"message": "Document processed successfully. Ready to generate quiz."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@router.post("/generate-quiz/", tags=["Quiz Generation"])
async def generate_quiz(
    topic: str = Form(...),
    difficulty: str = Form("easy"),
    num_questions: int = Form(5),
    api_key: str = Depends(get_api_key)
):
    try:
        # This is a simplified approach. In a real app, you'd use the ID from the upload step.
        # For now, we assume the latest processed document is the one to use.
        quiz = generate_quiz_from_doc(topic, num_questions, difficulty)
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz could not be generated. Ensure a document has been uploaded and the topic is relevant.")
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

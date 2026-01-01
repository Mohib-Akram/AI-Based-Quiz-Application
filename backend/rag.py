import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
import tempfile
import google.generativeai as genai
import re
import json

# This will be our in-memory 'database' for the demo.
# In a real app, you would use a persistent vector store.
vector_store = None


def _extract_json(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    start_positions = [p for p in [cleaned.find("["), cleaned.find("{")] if p != -1]
    if not start_positions:
        return cleaned

    start = min(start_positions)
    end_bracket = cleaned.rfind("]")
    end_brace = cleaned.rfind("}")
    end = max(end_bracket, end_brace)
    if end != -1 and end >= start:
        return cleaned[start : end + 1]

    return cleaned[start:]

def process_document(file_content: bytes, filename: str):
    global vector_store
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(file_content)
        temp_file_path = temp_file.name

    loader = PyPDFLoader(temp_file_path)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.from_documents(docs, embeddings)

    os.remove(temp_file_path)
    print("Document processed and stored in-memory.")
    return vector_store

def generate_quiz_from_doc(topic: str, num_questions: int, difficulty: str):
    global vector_store
    if not vector_store:
        return None

    # Retrieve relevant documents
    retriever = vector_store.as_retriever()
    relevant_docs = retriever.invoke(topic)
    context = "\n".join([doc.page_content for doc in relevant_docs])

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: GOOGLE_API_KEY is not set")
        raise RuntimeError("GOOGLE_API_KEY is not set")

    print(f"Using API key: {api_key[:10]}...")  # Debug: show first 10 chars
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")

    example_json = json.dumps(
        [
            {
                "question": "What is the capital of France?",
                "options": ["London", "Berlin", "Paris", "Madrid"],
                "correctAnswer": 2,
                "explanation": "Paris is the capital of France.",
            }
        ],
        ensure_ascii=False,
    )

    prompt = f"""
Based on the following context, generate a quiz with {num_questions} questions about {topic}.
The difficulty should be {difficulty}.

Context:
{context}

Return ONLY valid JSON as a JSON array, where each object has:
- question: string
- options: array of 4 strings
- correctAnswer: 0-indexed integer of the correct option
- explanation: string (a brief explanation of the correct answer)

Example:
{example_json}
"""

    response = model.generate_content(prompt)
    text = getattr(response, "text", None) or ""
    
    try:
        payload = _extract_json(text)
        return json.loads(payload)
    except json.JSONDecodeError:
        print("Error: LLM did not return valid JSON.")
        return None

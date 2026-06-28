import os
import fitz  # PyMuPDF
import subprocess
import tempfile
import traceback
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Pitch Avatar Converter Service")

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SlideData(BaseModel):
    id: int
    text: str
    thumbnailUrl: str
    title: str

def get_supabase() -> Client:
    """Create Supabase client lazily at request time so env vars are always fresh."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise HTTPException(
            status_code=500,
            detail=f"Supabase credentials not configured. SUPABASE_URL={'set' if url else 'MISSING'}, SUPABASE_SERVICE_ROLE_KEY={'set' if key else 'MISSING'}"
        )
    return create_client(url, key)

def ensure_bucket(supabase: Client, bucket_name: str):
    """Create the bucket if it does not exist."""
    try:
        supabase.storage.create_bucket(bucket_name, options={"public": True})
    except Exception:
        pass  # Bucket already exists — ignore

@app.post("/convert", response_model=List[SlideData])
async def convert_presentation(file: UploadFile, project_id: str = Form(...)):
    try:
        supabase = get_supabase()
        bucket_name = "slides"
        ensure_bucket(supabase, bucket_name)

        file_ext = (file.filename or "file.pdf").split(".")[-1].lower()

        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, f"input.{file_ext}")
            with open(input_path, "wb") as f:
                f.write(await file.read())

            pdf_path = input_path

            # Convert PPTX to PDF if necessary
            if file_ext in ["ppt", "pptx"]:
                subprocess.run(
                    ["libreoffice", "--headless", "--convert-to", "pdf", input_path, "--outdir", tmpdir],
                    check=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=120,
                )
                pdf_path = os.path.join(tmpdir, "input.pdf")
                if not os.path.exists(pdf_path):
                    raise RuntimeError("LibreOffice did not produce a PDF file.")

            # Parse PDF pages to images and text
            doc = fitz.open(pdf_path)
            slides_data: List[SlideData] = []

            for i in range(len(doc)):
                page = doc.load_page(i)
                text = page.get_text("text").strip()

                mat = fitz.Matrix(2, 2)
                pix = page.get_pixmap(matrix=mat)
                img_bytes = pix.tobytes("jpeg")

                storage_path = f"{project_id}/slide_{i+1}.jpg"

                # Upload image to Supabase Storage
                supabase.storage.from_(bucket_name).upload(
                    storage_path,
                    img_bytes,
                    {"content-type": "image/jpeg", "upsert": "true"},
                )

                public_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)

                slides_data.append(SlideData(
                    id=i + 1,
                    text=text,
                    title=f"Slide {i + 1}",
                    thumbnailUrl=public_url,
                ))

            return slides_data

    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[convert] UNHANDLED ERROR:\n{tb}")
        raise HTTPException(status_code=500, detail=f"Conversion error: {type(e).__name__}: {str(e)}")

@app.get("/health")
def health_check():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    return {
        "status": "ok",
        "supabase_url": "set" if url else "MISSING",
        "supabase_key": "set" if key else "MISSING",
    }

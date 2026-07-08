import os
import fitz  # PyMuPDF
import subprocess
import tempfile
import traceback
import httpx
from supabase import create_client
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Pitch Avatar Converter Service")

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

def get_config():
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise HTTPException(
            status_code=500,
            detail=f"Supabase credentials missing. URL={'set' if url else 'MISSING'}, KEY={'set' if key else 'MISSING'}"
        )
    return url, key

def get_auth_token(url: str, key: str) -> str:
    """Get a valid JWT from the supabase SDK (handles new key formats)."""
    try:
        client = create_client(url, key)
        # The SDK stores the service role key as access token
        session = client.auth.get_session()
        if session and session.access_token:
            return session.access_token
    except Exception:
        pass
    # Fallback: use the key directly (works if it's already a JWT)
    return key

def upload_to_supabase(supabase_url: str, auth_token: str, bucket: str, path: str, data: bytes) -> str:
    """Upload bytes directly via Supabase Storage REST API."""
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "apikey": auth_token,
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
    }
    endpoint = f"{supabase_url}/storage/v1/object/{bucket}/{path}"
    with httpx.Client(timeout=30) as client:
        r = client.post(endpoint, content=data, headers=headers)
        if r.status_code not in (200, 201):
            raise RuntimeError(f"Supabase upload failed [{r.status_code}]: {r.text}")
    return f"{supabase_url}/storage/v1/object/public/{bucket}/{path}"

def ensure_bucket(supabase_url: str, auth_token: str, bucket: str):
    """Create public bucket via REST API if it does not exist yet."""
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "apikey": auth_token,
        "Content-Type": "application/json",
    }
    payload = {"id": bucket, "name": bucket, "public": True}
    endpoint = f"{supabase_url}/storage/v1/bucket"
    with httpx.Client(timeout=10) as client:
        client.post(endpoint, json=payload, headers=headers)  # ignore errors — bucket may already exist

@app.post("/convert", response_model=List[SlideData])
async def convert_presentation(file: UploadFile, project_id: str = Form(...)):
    try:
        supabase_url, service_key = get_config()
        auth_token = get_auth_token(supabase_url, service_key)
        bucket = "slides"
        ensure_bucket(supabase_url, auth_token, bucket)

        file_ext = (file.filename or "file.pdf").split(".")[-1].lower()

        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, f"input.{file_ext}")
            with open(input_path, "wb") as f:
                f.write(await file.read())

            pdf_path = input_path

            if file_ext in ["ppt", "pptx"]:
                subprocess.run(
                    ["libreoffice", "--headless", "--convert-to", "pdf", input_path, "--outdir", tmpdir],
                    check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=120,
                )
                pdf_path = os.path.join(tmpdir, "input.pdf")
                if not os.path.exists(pdf_path):
                    raise RuntimeError("LibreOffice did not produce a PDF file.")

            doc = fitz.open(pdf_path)
            slides_data: List[SlideData] = []

            for i in range(len(doc)):
                page = doc.load_page(i)
                text = page.get_text("text").strip()
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img_bytes = pix.tobytes("jpeg")

                storage_path = f"{project_id}/slide_{i+1}.jpg"
                public_url = upload_to_supabase(supabase_url, auth_token, bucket, storage_path, img_bytes)

                slides_data.append(SlideData(
                    id=i + 1,
                    text=text,
                    title=f"Slide {i + 1}",
                    thumbnailUrl=public_url,
                ))

            # ── Save slides directly to Supabase projects table ──
            slides_payload = [s.model_dump() for s in slides_data]
            patch_headers = {
                "Authorization": f"Bearer {auth_token}",
                "apikey": auth_token,
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            }
            patch_url = f"{supabase_url}/rest/v1/projects?id=eq.{project_id}"
            with httpx.Client(timeout=30) as client:
                r = client.patch(
                    patch_url,
                    json={"slides": slides_payload, "slides_count": len(slides_payload), "status": "ready"},
                    headers=patch_headers,
                )
                if r.status_code not in (200, 204):
                    print(f"[convert] WARNING: failed to update projects table: {r.status_code} {r.text}")

            return slides_data

    except HTTPException:
        raise
    except Exception as e:
        print(f"[convert] ERROR:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Conversion error: {type(e).__name__}: {e}")


@app.get("/health")
def health_check():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    return {
        "status": "ok",
        "supabase_url": "set" if url else "MISSING",
        "supabase_key": "set" if key else "MISSING",
    }

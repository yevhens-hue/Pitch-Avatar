import os
import fitz  # PyMuPDF
import subprocess
import tempfile
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

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class SlideData(BaseModel):
    id: int
    text: str
    thumbnailUrl: str
    title: str

@app.post("/convert", response_model=List[SlideData])
async def convert_presentation(file: UploadFile, project_id: str = Form(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase credentials not configured in Python service")

    file_ext = file.filename.split(".")[-1].lower()
    
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, f"input.{file_ext}")
        with open(input_path, "wb") as f:
            f.write(await file.read())
            
        pdf_path = input_path
        
        # Convert PPTX to PDF if necessary
        if file_ext in ["ppt", "pptx"]:
            try:
                # Use LibreOffice headless to convert to PDF
                subprocess.run(
                    ["libreoffice", "--headless", "--convert-to", "pdf", input_path, "--outdir", tmpdir],
                    check=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                pdf_path = os.path.join(tmpdir, "input.pdf")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"PPTX conversion failed. Ensure LibreOffice is installed. Error: {str(e)}")

        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="PDF file was not generated.")
            
        # Parse PDF to images and text
        try:
            doc = fitz.open(pdf_path)
            slides_data = []
            
            for i in range(len(doc)):
                page = doc.load_page(i)
                text = page.get_text("text").strip()
                
                # Render to image (scale up for better quality)
                mat = fitz.Matrix(2, 2)
                pix = page.get_pixmap(matrix=mat)
                img_bytes = pix.tobytes("jpeg")
                
                # Upload to Supabase Storage
                # We assume a bucket named 'projects' or 'assets' exists. We will use 'projects'
                bucket_name = "projects"
                storage_path = f"{project_id}/slides/slide_{i+1}.jpg"
                
                res = supabase.storage.from_(bucket_name).upload(
                    storage_path,
                    img_bytes,
                    {"content-type": "image/jpeg"}
                )
                
                # Get public URL
                public_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)
                
                slides_data.append(SlideData(
                    id=i+1,
                    text=text,
                    title=f"Slide {i+1}",
                    thumbnailUrl=public_url
                ))
                
            return slides_data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF parsing failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "ok"}

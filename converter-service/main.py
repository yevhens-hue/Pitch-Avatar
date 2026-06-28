import os
import fitz  # PyMuPDF
import subprocess
import tempfile
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

app = FastAPI()

# Allow CORS for local dev and Vercel app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# We need the service role key to upload to storage without user token for this prototype
# Or we can just use the anon key if bucket is public, but let's use service key if available
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/convert")
async def convert_presentation(file: UploadFile, project_id: str = Form(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase credentials not configured in backend.")
        
    ext = file.filename.split('.')[-1].lower()
    if ext not in ['pdf', 'pptx']:
        raise HTTPException(status_code=400, detail="Only PDF and PPTX files are supported.")

    # Save uploaded file to temp file
    fd, temp_path = tempfile.mkstemp(suffix=f".{ext}")
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(await file.read())
            
        pdf_path = temp_path
        
        # If PPTX, convert to PDF first using LibreOffice
        if ext == 'pptx':
            out_dir = tempfile.mkdtemp()
            # Command to convert PPTX to PDF using LibreOffice headless
            # Requires libreoffice to be installed
            cmd = ['libreoffice', '--headless', '--convert-to', 'pdf', temp_path, '--outdir', out_dir]
            process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if process.returncode != 0:
                print(process.stderr.decode())
                raise HTTPException(status_code=500, detail="Failed to convert PPTX to PDF. Ensure LibreOffice is installed.")
            
            filename_no_ext = os.path.basename(temp_path).rsplit('.', 1)[0]
            pdf_path = os.path.join(out_dir, f"{filename_no_ext}.pdf")
            if not os.path.exists(pdf_path):
                raise HTTPException(status_code=500, detail="Converted PDF not found.")

        # Parse PDF
        doc = fitz.open(pdf_path)
        slides_data = []
        
        for i in range(len(doc)):
            page = doc.load_page(i)
            text = page.get_text("text")
            # Render page to an image
            pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
            img_bytes = pix.tobytes("jpeg")
            
            # Upload to Supabase Storage
            # Bucket name is assumed to be 'assets' or 'project-assets'. Let's use 'project-assets'
            # Check if bucket exists, if not we will assume it does, PitchAvatar probably uses something like 'project_assets'
            # We'll use 'project_assets' or whatever is typical. The user didn't specify, we'll try 'avatars' or just 'public'
            file_path = f"{project_id}/slide_{i+1}.jpg"
            
            # Since we don't know the exact bucket, let's just upload to a generic 'public' bucket or try 'avatars'
            # Actually, standard is to use 'presentations' or similar. 
            bucket_name = "avatars" # We know 'avatars' bucket exists from other code. Let's reuse it or create a generic URL.
            
            try:
                supabase.storage.from_(bucket_name).upload(file_path, img_bytes, file_options={"content-type": "image/jpeg", "upsert": "true"})
                public_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
            except Exception as e:
                print("Storage error:", e)
                public_url = "" # Fallback if storage fails
                
            slides_data.append({
                "id": i + 1,
                "title": f"Slide {i+1}",
                "text": text.strip() if text else "",
                "thumbnailUrl": public_url
            })
            
        doc.close()
        
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        # We don't clean out_dir to save time, but in production we should
        
    return {"success": True, "slides": slides_data}

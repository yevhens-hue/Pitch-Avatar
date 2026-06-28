# Pitch Avatar - Converter Service

This is a Python microservice designed to parse PDF and PPTX presentations, extract slide images and text, and upload them to Supabase Storage, similar to how the production Pitch Avatar application works.

## Requirements
- Python 3.10+
- LibreOffice (for PPTX support)

## Local Development
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set environment variables (or rely on the ones passed by the process):
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
4. Run the server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Docker Deployment
To run in Docker (which includes LibreOffice out of the box):
```bash
docker build -t pitch-avatar-converter .
docker run -p 8000:8000 \
  -e NEXT_PUBLIC_SUPABASE_URL="..." \
  -e SUPABASE_SERVICE_ROLE_KEY="..." \
  pitch-avatar-converter
```

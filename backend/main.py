# ==========================================
# FastAPI Medical PDF De-identification API
# ==========================================

import os
import uuid
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from typing import Dict,List
from services.deid_service import process_pdf_file
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Medical De-Identification API")

# CORS settings
origins = [
    "http://localhost:3000",   # React / Next.js
    "http://127.0.0.1:3000",
    "http://localhost:5173",   # Vite
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # أو ["*"] للتجربة فقط
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INPUT_FOLDER = "storage/input"
OUTPUT_FOLDER = "storage/output"

os.makedirs(INPUT_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# In-memory tracking (replace with Redis later)
jobs: Dict[str, dict] = {}


# ---------------------------------
# Upload & Start Processing
# ---------------------------------
@app.post("/upload")
async def upload_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    batch_id = str(uuid.uuid4())

    jobs[batch_id] = {
        "status": "processing",
        "files": [],
    }

    for file in files:
        file_id = str(uuid.uuid4())

        input_path = os.path.join(INPUT_FOLDER, f"{file_id}.pdf")
        output_path = os.path.join(OUTPUT_FOLDER, f"{file_id}.pdf")

        with open(input_path, "wb") as f:
            f.write(await file.read())

        file_job = {
            "file_id": file_id,
            "filename": file.filename,
            "status": "processing",
            "progress": 0,
            "phi_removed": 0,
            "logs": [],
            "output_path": output_path,
        }

        jobs[batch_id]["files"].append(file_job)

        background_tasks.add_task(
            process_pdf_file,
            batch_id,
            file_id,
            input_path,
            output_path,
            jobs,
        )

    return {
        "batch_id": batch_id,
        "total_files": len(files)
    }

# ---------------------------------
# Get Job Status
# ---------------------------------
@app.get("/status/{batch_id}")
def get_status(batch_id: str):
    return jobs.get(batch_id, {"error": "Not found"})


# ---------------------------------
# Download Redacted File
# ---------------------------------
@app.get("/download/{batch_id}/{file_id}")
def download_file(batch_id: str, file_id: str):

    file_job = next(
        (f for f in jobs[batch_id]["files"] if f["file_id"] == file_id),
        None
    )

    if not file_job or file_job["status"] != "completed":
        return {"error": "File not ready"}

    return FileResponse(file_job["output_path"], media_type="application/pdf")

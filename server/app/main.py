from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .db import init_db
from .routes import auth, reports
from .storage import UPLOADS_DIR

app = FastAPI(title="Gymstallations Reports API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(reports.router)

# Serve user-uploaded photos. They live alongside the DB in `data/uploads/`
# and are referenced from reports as `/uploads/{report_id}/{uuid}.jpg`.
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Serve the built React SPA from frontend/dist if present. Anything not
# matched by an API route above falls through to the SPA's index.html so
# client-side routing keeps working on hard refreshes.
DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

if DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str) -> FileResponse:
        candidate = DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(DIST / "index.html")

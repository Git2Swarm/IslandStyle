from datetime import datetime

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl

app = FastAPI(title="Island Style AI Try-On")


class TryOnRequest(BaseModel):
    portrait_id: str
    wig_asset_url: HttpUrl
    favorite_id: str


class TryOnResponse(BaseModel):
    job_id: str
    output_url: HttpUrl
    processed_at: datetime


def _generate_placeholder_url(favorite_id: str) -> str:
    return f"https://cdn.islandstylewigs.com/demo-results/{favorite_id}.jpg"


@app.post("/generate", response_model=TryOnResponse)
async def generate(request: TryOnRequest) -> TryOnResponse:
    if not request.portrait_id:
        raise HTTPException(status_code=400, detail="portrait_id is required")

    placeholder = _generate_placeholder_url(request.favorite_id)
    return TryOnResponse(
        job_id=f"demo-{request.favorite_id}-{int(datetime.utcnow().timestamp())}",
        output_url=placeholder,
        processed_at=datetime.utcnow(),
    )


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}

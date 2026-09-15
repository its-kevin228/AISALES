from fastapi import APIRouter, Request, HTTPException, status, Query, BackgroundTasks, Response
from app.core.config import settings
from app.core.security import verify_meta_signature

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])

@router.get("/webhook")
async def verify_webhook(
    mode: str = Query(..., alias="hub.mode"),
    token: str = Query(..., alias="hub.verify_token"),
    challenge: str = Query(..., alias="hub.challenge"),
):
    if mode == "subscribe" and token == settings.META_VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token de vérification invalide")

@router.post("/webhook")
async def receive_webhook(request: Request, background_tasks: BackgroundTasks):
    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")
    
    if not verify_meta_signature(body, signature, settings.META_APP_SECRET):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Signature cryptographique X-Hub-Signature-256 invalide"
        )
        
    payload = await request.json()
    # Queue processing to background task to respond 200 OK immediately
    # background_tasks.add_task(process_webhook_payload, payload)
    return {"status": "received"}

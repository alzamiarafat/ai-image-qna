import os
import asyncio
from typing import Any, Dict

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

async def ask_ai_openai(detections: Dict[str, Any], question: str) -> str:
    # Minimal example using OpenAI REST API (Chat Completions v1). Replace with your preferred SDK.
    import aiohttp
    if not OPENAI_API_KEY:
        return "OpenAI API key not configured. Set OPENAI_API_KEY in env."
    prompt = f"Detections:\n{detections}\n\nQuestion: {question}\nAnswer concisely."
    url = 'https://api.openai.com/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {OPENAI_API_KEY}',
        'Content-Type': 'application/json'
    }
    payload = {
        'model': 'gpt-4o-mini',
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': 256,
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as resp:
            if resp.status != 200:
                txt = await resp.text()
                return f'AI provider error: {resp.status} - {txt}'
            data = await resp.json()
            try:
                return data['choices'][0]['message']['content']
            except Exception:
                return str(data)

async def ask_ai(detections: Dict[str, Any], question: str) -> str:
    # Choose provider - currently only OpenAI implemented
    return await ask_ai_openai(detections, question)

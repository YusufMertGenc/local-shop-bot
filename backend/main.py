from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClothingRequest(BaseModel):
    product: str
    country: str
    # city: str
    budget_min: int
    budget_max: int
    currency: str
    lang: str  

@app.post("/sustainable-fashion-advice")
def advise_clothing_choice(data: ClothingRequest):
    prompt = (
    f"Hello, I live in {data.country}. I need to buy a {data.product}. "
    f"My goal is to reduce my carbon footprint by choosing local and sustainable brands. "
    f"Can you suggest brands available in my location that match this goal?\n\n"
    f"Also, could you briefly tell me how much water is typically used to produce a {data.product}? "
    f"I want to make an informed, environmentally conscious choice."
    f"Please give your answer in {data.lang}"
    )

    response = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        headers={"Content-Type": "application/json"},
        params={"key": GEMINI_API_KEY},
        json={"contents": [{"parts": [{"text": prompt}]}]}
    )

    result = response.json()
    try:
        return {
            "advice": result["candidates"][0]["content"]["parts"][0]["text"]
        }
    except:
        return {
            "error": "Something went wrong.",
            "raw_response": result
        }

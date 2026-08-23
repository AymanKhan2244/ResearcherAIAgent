# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from workflow import * 
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    message: str


@app.post("/chat")
def chat(query: Query):

    response = graph.invoke({
        "query": query.message,
        "messages": query.message
    })

    if response.get("response"):
        final_message = response["response"]
    else:
        try:
            final_message = response["messages"][-1].content
        except:
            final_message = str(response)

    import re
    final_message = re.sub(r'<think>.*?</think>', '', final_message, flags=re.DOTALL).strip()

    return {
        "response": final_message
    }
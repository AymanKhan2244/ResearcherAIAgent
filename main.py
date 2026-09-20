# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from workflow import * 
from dotenv import load_dotenv
import database

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
    chat_id: str

class RenameChat(BaseModel):
    title: str

@app.get("/chats")
def get_chats():
    return database.get_all_chats()

@app.post("/chats")
def create_chat():
    return database.create_chat()

@app.get("/chats/{chat_id}")
def get_chat(chat_id: str):
    return database.get_chat(chat_id)

@app.put("/chats/{chat_id}")
def rename_chat_endpoint(chat_id: str, rename: RenameChat):
    success = database.rename_chat(chat_id, rename.title)
    return {"success": success}

@app.delete("/chats/{chat_id}")
def delete_chat_endpoint(chat_id: str):
    success = database.delete_chat(chat_id)
    return {"success": success}


@app.post("/chat")
def chat(query: Query):
    database.add_message(query.chat_id, "user", query.message)

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

    database.add_message(query.chat_id, "assistant", final_message)

    return {
        "response": final_message
    }
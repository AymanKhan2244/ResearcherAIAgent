from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from workflow import graph
import os 


os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_PROJECT"] = "Researcher_Agent"
os.environ["LANGSMITH_TRACING"] = "true"




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
        "messages": query.message
    })

    try:
        final_message = response["messages"][-1].content
    except:
        final_message = str(response)

    return {
        "response": final_message
    }
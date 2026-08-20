from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os 

load_dotenv()




llm = ChatGroq(
    model="openai/gpt-oss-120b",
    max_tokens=1024
)



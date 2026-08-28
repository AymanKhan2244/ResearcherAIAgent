import os
from dotenv import load_dotenv
load_dotenv()

from langchain_groq import ChatGroq

try:
    llm = ChatGroq(
        model="openai/gpt-oss-120b",
        max_tokens=1024
    )
    res = llm.invoke("Hello, respond with hello.")
    print("Success:", res.content)
except Exception as e:
    print("Error:", e)

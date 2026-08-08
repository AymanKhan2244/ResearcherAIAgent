from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os 

load_dotenv()


os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    max_tokens=1024
)



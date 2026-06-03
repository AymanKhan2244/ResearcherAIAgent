from typing import TypedDict,Annotated
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph,START,END
from langgraph.prebuilt import ToolNode
from model import *
from langgraph.prebuilt import tools_condition



class State(TypedDict):
    messages:Annotated[list,add_messages]


builder = StateGraph(State)

from langchain_community.tools.tavily_search import TavilySearchResults 
tavily_api_key = "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"


web_search = TavilySearchResults(max_results=5, tavily_api_key="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")

from langgraph.prebuilt import ToolNode


tools = [web_search]

tool_node = ToolNode(tools)


llm_with_tools = llm.bind_tools(tools)




def tool_calling_llm(state :dict):
    return {"messages":[llm_with_tools.invoke(state["messages"])]}


def llm_node(query:dict)-> dict:
    response = llm.invoke(query)
    return  response

#def final_response(state: dict):

    messages = state["messages"]

    prompt = f"""
    You are a professional AI research assistant.

    Analyze the search results properly and provide:
    - Give it in a list format or in points
    -Give  5 results only  
    Search Results:
    {messages}

    Give a professional response.
    """

    response = llm.invoke(prompt)

    return {
        "messages": [response]
    }


def final_response(state: dict):

    messages = state["messages"]

    prompt = f"""
    You are a professional AI news researcher.

    Based on the search results, generate EXACTLY 5 major news points.

    STRICT RULES:
    - MUST generate 5 points
    - DO NOT generate less than 5
    - Each point must have:
        1.Head Line
        2. 2-3 line explanation
    - DO NOT stop early
    - DO NOT summarize into one paragraph
    - DO NOT return raw JSON
    - DO NOT mention search results
    - Format cleanly
    - Give the  head line more content
    FORMAT:

    1. Head Line
  

    2. HEad Line
    Explanation

    Continue until all 5 points are completed.

    Search Results:
    {messages}
    """

    response = llm.invoke(prompt)

    return {
        "messages": [response]
    }
builder.add_node("llm",tool_calling_llm)
builder.add_node("tools",ToolNode(tools))
builder.add_node("final_llm",final_response)



builder.add_edge(START,"llm")
builder.add_conditional_edges("llm",tools_condition)
builder.add_edge("tools","final_llm")
builder.add_edge("final_llm",END)



graph = builder.compile()



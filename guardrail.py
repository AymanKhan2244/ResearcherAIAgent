from nemoguardrails import LLMRails, RailsConfig
from model import llm

config = RailsConfig.from_path("./guardrials")

rails = LLMRails(config, llm=llm)


def validate_query(query: str):
    # Pass an empty dictionary as state to keep this query evaluation stateless
    response = rails.generate(
        messages=[
            {
                "role": "user",
                "content": query
            }
        ],
        state={}
    )

    if isinstance(response, dict):
        return response["content"]
    elif hasattr(response, "response") and len(response.response) > 0:
        return response.response[0]["content"]
    elif hasattr(response, "content"):
        return response.content

    return str(response)

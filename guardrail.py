from nemoguardrails import LLMRails, RailsConfig
from model import llm

config = RailsConfig.from_path("./guardrials")

rails = LLMRails(config, llm=llm)


def validate_query(query: str):

    response = rails.generate(
        messages=[
            {
                "role": "user",
                "content": query
            }
        ]
    )

    return response["content"]
from guardrail import validate_query

queries = [
    "What is Machine Learning?",
    "Teach me Python",
    "Write Java code",
    "Explain recursion",
    "Tell me a joke",
    "Who are you?",
    "Write an essay",
    "What is 2+2?",
    "Explain photosynthesis",
    "Latest AI breakthroughs 2026",
    "Climate research updates",
    "Quantum computing synthesis",
]

for q in queries:
    res = validate_query(q)
    is_allowed = "ALLOWED" in res # note: the logic in workflow.py checks '"ALLOWED" not in response'
    print(f"Query: {q}")
    print(f"Response: {res}")
    print(f"Allowed: {is_allowed}")
    print("-" * 50)

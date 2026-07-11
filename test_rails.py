from guardrail import validate_query

r1 = validate_query("What is Machine Learning?")
print(f"Off-topic response: {r1}")

r2 = validate_query("What are the latest AI news?")
print(f"Valid response: {r2}")

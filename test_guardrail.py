import sys
from guardrail import validate_query

q = sys.argv[1]
print(f"Query: {q}")
response = validate_query(q)
print(f"Response: {response}")

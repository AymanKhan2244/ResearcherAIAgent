import os
import sys
sys.path.append(os.getcwd())

from guardrail import validate_query

res = validate_query("What is Machine Learning?")
print(f"Type: {type(res)}")
print(f"Repr: {repr(res)}")
print(f"Is ALLOWED in res: {'ALLOWED' in res}")

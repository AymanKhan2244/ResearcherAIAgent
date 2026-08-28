import os
import sys
sys.path.append(os.getcwd())

from guardrail import rails

r = rails.generate(messages=[{"role": "user", "content": "What is Machine Learning?"}], state={})
print("Type of response:", type(r))
print("Attributes of response:", dir(r))
if hasattr(r, "content"):
    print("Content attr:", r.content)
if hasattr(r, "response"):
    print("Response attr:", r.response)

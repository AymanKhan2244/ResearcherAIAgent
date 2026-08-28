import os
import sys
sys.path.append(os.getcwd())

from guardrail import rails

def test_without_session():
    print("=== Testing WITHOUT session_id ===")
    r1 = rails.generate(messages=[{"role": "user", "content": "What is Machine Learning?"}])
    print("Q1 (Off-topic):", r1["content"])
    
    r2 = rails.generate(messages=[{"role": "user", "content": "What are the latest AI news?"}])
    print("Q2 (On-topic):", r2["content"])

def test_with_session():
    import uuid
    print("\n=== Testing WITH unique session_id ===")
    uid1 = str(uuid.uuid4())
    r1 = rails.generate(messages=[{"role": "user", "content": "What is Machine Learning?"}], session_id=uid1)
    print("Q1 (Off-topic):", r1["content"])
    
    uid2 = str(uuid.uuid4())
    r2 = rails.generate(messages=[{"role": "user", "content": "What are the latest AI news?"}], session_id=uid2)
    print("Q2 (On-topic):", r2["content"])

try:
    test_without_session()
except Exception as e:
    print("Err without session:", e)

try:
    test_with_session()
except Exception as e:
    print("Err with session:", e)

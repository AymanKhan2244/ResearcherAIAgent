import os
import sys
sys.path.append(os.getcwd())

from guardrail import rails

def test_empty_state():
    print("=== Testing with state={} ===")
    state1 = {}
    r1 = rails.generate(messages=[{"role": "user", "content": "What is Machine Learning?"}], state=state1)
    print("Q1 (Off-topic):", r1["content"])
    print("State after Q1:", list(state1.keys()) if state1 else "empty")
    
    state2 = {}
    r2 = rails.generate(messages=[{"role": "user", "content": "What are the latest AI news?"}], state=state2)
    print("Q2 (On-topic):", r2["content"])
    print("State after Q2:", list(state2.keys()) if state2 else "empty")

def test_same_state_vs_diff_state():
    print("\n=== Testing with same state vs new state ===")
    shared_state = {}
    r1 = rails.generate(messages=[{"role": "user", "content": "What is Machine Learning?"}], state=shared_state)
    print("Q1 (Off-topic, shared state):", r1["content"])
    
    r2 = rails.generate(messages=[{"role": "user", "content": "What are the latest AI news?"}], state=shared_state)
    print("Q2 (On-topic, shared state):", r2["content"])

try:
    test_empty_state()
except Exception as e:
    print("Err empty state:", e)

try:
    test_same_state_vs_diff_state()
except Exception as e:
    print("Err shared state:", e)

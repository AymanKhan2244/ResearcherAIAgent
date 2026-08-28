import requests
import json
import time

url = "http://127.0.0.1:8000/chat"

print("Waiting for server to fully initialize...")
time.sleep(2)

print("\n=== Testing Off-topic request ===")
payload = {"message": "What is Machine Learning?"}
res1 = requests.post(url, json=payload)
print("Status Code:", res1.status_code)
print("Response:", res1.json())

print("\n=== Testing On-topic request ===")
payload = {"message": "What are the latest AI news?"}
res2 = requests.post(url, json=payload)
print("Status Code:", res2.status_code)
print("Response:", res2.json())

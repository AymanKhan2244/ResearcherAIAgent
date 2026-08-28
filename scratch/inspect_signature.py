import inspect
from nemoguardrails.rails.llm.llmrails import LLMRails

sig = inspect.signature(LLMRails.generate)
print("generate signature:", sig)

sig_async = inspect.signature(LLMRails.generate_async)
print("generate_async signature:", sig_async)

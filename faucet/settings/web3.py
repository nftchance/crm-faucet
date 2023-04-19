import os

DEFAULT_SHROOM_KEY = "7736f412-5e7b-4c43-8360-3e2231a24e69"
SHROOM_KEY = os.getenv("SHROOM_KEY", DEFAULT_SHROOM_KEY)

if not SHROOM_KEY:
    raise ValueError("SHROOM_KEY is not set")

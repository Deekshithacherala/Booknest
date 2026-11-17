import os
import requests

response = requests.post(
    "http://127.0.0.1:5000/login",
    json={
        "email": os.getenv("ADMIN_EMAIL"),
        "password": os.getenv("ADMIN_PASSWORD")
    }
)

print("Status code:", response.status_code)
print("Response:", response.json())
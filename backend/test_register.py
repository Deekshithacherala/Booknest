import os
import requests

url = "http://127.0.0.1:5000/register"

data = {
    "name": "Test Customer",
    "email": "customer1@booknest.com",
    "password": os.getenv("TEST_USER_PASSWORD")
}

response = requests.post(url, json=data)

print("Status code:", response.status_code)
print("Response:", response.json())
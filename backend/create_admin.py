import os
import mysql.connector
from werkzeug.security import generate_password_hash

connection = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME", "booknest")
)

cursor = connection.cursor()

name = "BookNest Admin"
email = os.getenv("ADMIN_EMAIL", "admin@booknest.com")
password = os.getenv("ADMIN_PASSWORD")

if not password:
    raise ValueError("Please configure ADMIN_PASSWORD before creating admin.")

password_hash = generate_password_hash(password)

cursor.execute(
    """
    INSERT INTO users (name, email, password_hash, role)
    VALUES (%s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        role = VALUES(role)
    """,
    (name, email, password_hash, "admin")
)

connection.commit()

print("Admin account created successfully!")
print("Email:", email)

cursor.close()
connection.close()
from flask import Flask, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "booknest")
    )


@app.route("/")
def home():
    return jsonify({"message": "BookNest backend is running!"})


@app.route("/test-db")
def test_db():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SHOW TABLES")
        tables = [row[0] for row in cursor.fetchall()]

        cursor.close()
        connection.close()

        return jsonify({
            "message": "MySQL connected successfully!",
            "tables": tables
        })

    except mysql.connector.Error as error:
        return jsonify({"error": str(error)}), 500

    



@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing login details"}), 400

    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT user_id, name, email, password_hash, role "
            "FROM users WHERE email = %s",
            (email,)
        )

        user = cursor.fetchone()

        if user and check_password_hash(user["password_hash"], password):
            return jsonify({
                "message": "Login successful!",
                "user": {
                    "user_id": user["user_id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"]
                }
            }), 200

        return jsonify({"error": "Invalid email or password"}), 401

    except mysql.connector.Error:
        app.logger.exception("Database error during login")
        return jsonify({"error": "Unable to process login right now"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing registration details"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "error": "Name, email, and password are required"
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must be at least 8 characters"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT user_id FROM users WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            return jsonify({
                "error": "An account with this email already exists"
            }), 409

        password_hash = generate_password_hash(password)

        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role) "
            "VALUES (%s, %s, %s, %s)",
            (name, email, password_hash, "customer")
        )

        connection.commit()

        return jsonify({
            "message": "Registration successful! You can now log in."
        }), 201

    except mysql.connector.Error:
        app.logger.exception("Database error during registration")
        if connection and connection.is_connected():
            connection.rollback()

        return jsonify({
            "error": "Unable to register right now"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.route("/admin/books", methods=["GET"])
def get_admin_books():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT book_id, title, author, price, cost_price,
                   category, stock, description, image_url
            FROM books
            ORDER BY book_id
        """)

        books = cursor.fetchall()
        return jsonify(books), 200

    except mysql.connector.Error:
        app.logger.exception("Database error while loading books")
        return jsonify({"error": "Could not load books"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

@app.route("/admin/books", methods=["POST"])
def add_admin_book():
    data = request.get_json(silent=True) or {}

    title = str(data.get("title", "")).strip()
    author = str(data.get("author", "")).strip()
    category = str(data.get("category", "")).strip()

    try:
        price = float(data.get("price", 0))
        stock = int(data.get("stock", -1))
    except (ValueError, TypeError):
        return jsonify({"error": "Enter a valid price and stock."}), 400

    if not title or not author or not category:
        return jsonify({"error": "Fill in all five book fields."}), 400

    if price <= 0 or stock < 0:
        return jsonify({"error": "Price must be positive and stock cannot be negative."}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO books (title, author, price, category, stock)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (title, author, price, category, stock)
        )

        connection.commit()
        return jsonify({"message": "Book added successfully!"}), 201

    except mysql.connector.Error:
        app.logger.exception("Error adding book")
        if connection and connection.is_connected():
            connection.rollback()
        return jsonify({"error": "Could not save the book."}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
@app.route("/books", methods=["GET"])
def get_books():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT book_id, title, author, price, category, stock,
                   description, image_url
            FROM books
            ORDER BY book_id DESC
        """)

        books = cursor.fetchall()
        return jsonify(books), 200

    except mysql.connector.Error:
        app.logger.exception("Error loading customer books")
        return jsonify({"error": "Could not load books"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

@app.route("/admin/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM books WHERE book_id = %s",
            (book_id,)
        )

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({"error": "Book not found"}), 404

        connection.commit()

        return jsonify({
            "message": "Book deleted successfully"
        }), 200

    except mysql.connector.Error:
        if connection:
            connection.rollback()

        app.logger.exception("Error deleting book")
        return jsonify({"error": "Could not delete book"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

@app.route("/orders", methods=["POST"])
def place_order():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    customer_name = str(data.get("customer_name", "")).strip()
    customer_email = str(data.get("customer_email", "")).strip()
    delivery_address = str(data.get("delivery_address", "")).strip()
    items = data.get("items", [])

    if not all([user_id, customer_name, customer_email, delivery_address]):
        return jsonify({"error": "Please provide all customer and delivery details."}), 400

    if not isinstance(items, list) or not items:
        return jsonify({"error": "Your cart is empty."}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        # Verify that the customer exists and has a customer account.
        cursor.execute(
            "SELECT user_id FROM users WHERE user_id = %s AND role = 'customer'",
            (user_id,)
        )
        if not cursor.fetchone():
            connection.rollback()
            return jsonify({"error": "Customer account not found."}), 403

        total_amount = 0
        order_items = []

        # Get real prices and check stock from the database.
        for item in items:
            try:
                book_id = int(item["book_id"])
                quantity = int(item["quantity"])
            except (KeyError, TypeError, ValueError):
                connection.rollback()
                return jsonify({"error": "Invalid book or quantity."}), 400

            if book_id <= 0 or quantity <= 0:
                connection.rollback()
                return jsonify({"error": "Invalid book or quantity."}), 400

            cursor.execute(
                """
                SELECT book_id, title, price, stock
                FROM books
                WHERE book_id = %s
                FOR UPDATE
                """,
                (book_id,)
            )
            book = cursor.fetchone()

            if not book:
                connection.rollback()
                return jsonify({"error": f"Book ID {book_id} was not found."}), 400

            if book["stock"] < quantity:
                connection.rollback()
                return jsonify({
                    "error": f"Not enough stock for '{book['title']}'."
                }), 400

            price = float(book["price"])
            total_amount += price * quantity

            order_items.append({
                "book_id": book["book_id"],
                "quantity": quantity,
                "price": price,
            })

        # Save the main order.
        cursor.execute(
            """
            INSERT INTO orders
                (user_id, customer_name, customer_email,
                 delivery_address, total_amount,
                 order_status, payment_status)
            VALUES (%s, %s, %s, %s, %s, 'Pending', 'Pending')
            """,
            (
                user_id,
                customer_name,
                customer_email,
                delivery_address,
                round(total_amount, 2),
            )
        )

        order_id = cursor.lastrowid

        # Save each book and reduce its available stock.
        for item in order_items:
            cursor.execute(
                """
                INSERT INTO order_items (order_id, book_id, quantity, price)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    order_id,
                    item["book_id"],
                    item["quantity"],
                    item["price"],
                )
            )

            cursor.execute(
                """
                UPDATE books
                SET stock = stock - %s
                WHERE book_id = %s
                """,
                (item["quantity"], item["book_id"])
            )

        connection.commit()

        return jsonify({
            "message": "Order placed successfully!",
            "order_id": order_id,
            "total_amount": round(total_amount, 2),
        }), 201

    except (mysql.connector.Error, KeyError, TypeError, ValueError):
        if connection and connection.is_connected():
            connection.rollback()

        app.logger.exception("Error placing order")
        return jsonify({"error": "Could not save your order. Please try again."}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


@app.route("/my-orders/<int:user_id>", methods=["GET"])
def get_my_orders(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                o.order_id,
                o.customer_name,
                o.total_amount,
                o.order_status,
                o.payment_status,
                o.order_date,
                oi.book_id,
                b.title AS book_title,
                oi.quantity,
                oi.price
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN books b ON oi.book_id = b.book_id
            WHERE o.user_id = %s
            ORDER BY o.order_date DESC
        """, (user_id,))

        rows = cursor.fetchall()

        orders = {}

        for row in rows:
            order_id = row["order_id"]

            if order_id not in orders:
                orders[order_id] = {
                    "order_id": order_id,
                    "customer_name": row["customer_name"],
                    "total_amount": float(row["total_amount"]),
                    "order_status": row["order_status"],
                    "payment_status": row["payment_status"],
                    "order_date": str(row["order_date"]),
                    "items": []
                }

            orders[order_id]["items"].append({
                "book_id": row["book_id"],
                "book_title": row["book_title"],
                "quantity": row["quantity"],
                "price": float(row["price"])
            })

        return jsonify(list(orders.values()))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/admin/orders", methods=["GET"])
def get_admin_orders():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                o.order_id,
                o.user_id,
                o.customer_name,
                o.customer_email,
                o.delivery_address,
                o.total_amount,
                o.order_status,
                o.payment_status,
                o.order_date,
                oi.book_id,
                b.title AS book_title,
                oi.quantity,
                oi.price
            FROM orders o
            LEFT JOIN order_items oi
                ON o.order_id = oi.order_id
            LEFT JOIN books b
                ON oi.book_id = b.book_id
            ORDER BY o.order_date DESC, o.order_id DESC
        """)

        rows = cursor.fetchall()
        orders = {}

        for row in rows:
            order_id = row["order_id"]

            if order_id not in orders:
                orders[order_id] = {
                    "order_id": order_id,
                    "user_id": row["user_id"],
                    "customer_name": row["customer_name"],
                    "customer_email": row["customer_email"],
                    "delivery_address": row["delivery_address"],
                    "total_amount": float(row["total_amount"] or 0),
                    "order_status": row["order_status"],
                    "payment_status": row["payment_status"],
                    "order_date": str(row["order_date"]),
                    "items": []
                }

            if row["book_id"] is not None:
                orders[order_id]["items"].append({
                    "book_id": row["book_id"],
                    "book_title": row["book_title"] or "Book unavailable",
                    "quantity": row["quantity"],
                    "price": float(row["price"] or 0)
                })

        return jsonify(list(orders.values()))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/customer/orders/<int:user_id>", methods=["GET"])
def get_customer_orders(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                o.order_id,
                o.user_id,
                o.customer_name,
                o.total_amount,
                o.order_status,
                o.payment_status,
                o.order_date,
                oi.book_id,
                b.title AS book_title,
                oi.quantity,
                oi.price
            FROM orders o
            LEFT JOIN order_items oi
                ON o.order_id = oi.order_id
            LEFT JOIN books b
                ON oi.book_id = b.book_id
            WHERE o.user_id = %s
            ORDER BY o.order_date DESC, o.order_id DESC
        """, (user_id,))

        rows = cursor.fetchall()
        orders = {}

        for row in rows:
            order_id = row["order_id"]

            if order_id not in orders:
                orders[order_id] = {
                    "order_id": order_id,
                    "user_id": row["user_id"],
                    "customer_name": row["customer_name"],
                    "total_amount": float(row["total_amount"] or 0),
                    "order_status": row["order_status"],
                    "payment_status": row["payment_status"],
                    "order_date": str(row["order_date"]),
                    "items": []
                }

            if row["book_id"] is not None:
                orders[order_id]["items"].append({
                    "book_id": row["book_id"],
                    "book_title": row["book_title"] or "Book unavailable",
                    "quantity": row["quantity"],
                    "price": float(row["price"] or 0)
                })

        return jsonify(list(orders.values()))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/admin/customers", methods=["GET"])
def get_admin_customers():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                u.user_id,
                u.name,
                u.email,
                COUNT(DISTINCT o.order_id) AS total_orders,
                COALESCE(SUM(o.total_amount), 0) AS total_spent
            FROM users u
            LEFT JOIN orders o ON u.user_id = o.user_id
            WHERE u.role = 'customer'
            GROUP BY u.user_id, u.name, u.email
            ORDER BY u.name
        """)

        customers = cursor.fetchall()

        for customer in customers:
            customer["total_orders"] = int(customer["total_orders"])
            customer["total_spent"] = float(customer["total_spent"])

        return jsonify(customers), 200

    except mysql.connector.Error:
        app.logger.exception("Error loading customers")
        return jsonify({"error": "Could not load customers"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

@app.route("/admin/sales-summary", methods=["GET"])
def get_sales_summary():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                (SELECT COUNT(*) FROM orders) AS total_orders,
                (SELECT COALESCE(SUM(total_amount), 0)
                 FROM orders) AS total_revenue,
                (SELECT COALESCE(SUM(quantity), 0)
                 FROM order_items) AS books_sold,
                (SELECT COALESCE(
                    SUM(
                        (oi.price - COALESCE(b.cost_price, 0))
                        * oi.quantity
                    ), 0
                )
                 FROM order_items oi
                 LEFT JOIN books b ON oi.book_id = b.book_id)
                AS gross_profit
        """)

        summary = cursor.fetchone()

        summary["total_orders"] = int(summary["total_orders"])
        summary["total_revenue"] = float(summary["total_revenue"])
        summary["books_sold"] = int(summary["books_sold"])
        summary["gross_profit"] = float(summary["gross_profit"])

        return jsonify(summary), 200

    except mysql.connector.Error:
        app.logger.exception("Error loading sales summary")
        return jsonify({"error": "Could not load sales summary"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# ==========================================
# SELLER FEATURES
# ==========================================

@app.route("/seller/enable", methods=["POST"])
def enable_seller():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE users
            SET is_seller = TRUE
            WHERE user_id = %s AND role = 'customer'
            """,
            (user_id,)
        )

        if cursor.rowcount == 0:
            cursor.execute(
                "SELECT user_id, is_seller FROM users WHERE user_id = %s",
                (user_id,)
            )
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "User not found."}), 404

            if not user[1]:
                return jsonify({"error": "Seller access could not be enabled."}), 400

        connection.commit()

        return jsonify({
            "message": "Seller access enabled successfully!"
        }), 200

    except mysql.connector.Error:
        if connection and connection.is_connected():
            connection.rollback()

        app.logger.exception("Error enabling seller access")
        return jsonify({"error": "Could not enable seller access."}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


@app.route("/seller/requests", methods=["POST"])
def submit_seller_book():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    title = str(data.get("title", "")).strip()
    author = str(data.get("author", "")).strip()
    category = str(data.get("category", "")).strip()
    description = str(data.get("description", "")).strip()
    image_url = str(data.get("image_url", "")).strip()

    try:
        price = float(data.get("price", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Enter a valid book price."}), 400

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "A valid user ID is required."}), 400

    if not title or not author:
        return jsonify({"error": "Book title and author are required."}), 400

    if price <= 0:
        return jsonify({"error": "Price must be greater than zero."}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Only registered customers with seller access can submit books.
        cursor.execute(
            """
            SELECT user_id
            FROM users
            WHERE user_id = %s
              AND role = 'customer'
              AND is_seller = TRUE
            """,
            (user_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "error": "Enable seller access before submitting a book."
            }), 403

        # New submissions remain pending until an admin approves them.
        cursor.execute(
            """
            INSERT INTO seller_book_requests
                (seller_id, title, author, category, price,
                 description, image_url, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
            """,
            (
                user_id,
                title,
                author,
                category or None,
                price,
                description or None,
                image_url or None
            )
        )

        request_id = cursor.lastrowid
        connection.commit()

        return jsonify({
            "message": "Book submitted for admin approval!",
            "request_id": request_id,
            "status": "pending"
        }), 201

    except mysql.connector.Error:
        if connection and connection.is_connected():
            connection.rollback()

        app.logger.exception("Error submitting seller book")
        return jsonify({"error": "Could not submit the book."}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


@app.route("/seller/requests/<int:user_id>", methods=["GET"])
def get_seller_requests(user_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # A user can retrieve only their own submitted requests.
        # Authentication must be added before production use.
        cursor.execute(
            """
            SELECT request_id, title, author, category, price,
                   description, image_url, status, admin_note,
                   submitted_at
            FROM seller_book_requests
            WHERE seller_id = %s
            ORDER BY submitted_at DESC
            """,
            (user_id,)
        )

        requests_list = cursor.fetchall()

        for item in requests_list:
            item["price"] = float(item["price"])
            item["submitted_at"] = str(item["submitted_at"])

        return jsonify(requests_list), 200

    except mysql.connector.Error:
        app.logger.exception("Error loading seller requests")
        return jsonify({"error": "Could not load seller requests."}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# ==========================================
# ADMIN SELLER BOOK APPROVAL
# ==========================================

# Get all seller book requests
@app.route("/admin/seller-requests", methods=["GET"])
def get_admin_seller_requests():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                r.request_id,
                r.seller_id,
                u.name AS seller_name,
                u.email AS seller_email,
                r.title,
                r.author,
                r.category,
                r.price,
                r.description,
                r.image_url,
                r.status,
                r.admin_note,
                r.submitted_at
            FROM seller_book_requests r
            JOIN users u ON r.seller_id = u.user_id
            WHERE r.status = 'pending'
            ORDER BY r.submitted_at DESC
        """)

        requests_list = cursor.fetchall()

        for item in requests_list:
            item["price"] = float(item["price"])
            item["submitted_at"] = str(item["submitted_at"])

        return jsonify(requests_list), 200

    except mysql.connector.Error:
        app.logger.exception("Error loading seller book requests")
        return jsonify({
            "error": "Could not load seller book requests."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Approve or reject a seller's book
@app.route(
    "/admin/seller-requests/<int:request_id>/decision",
    methods=["POST"]
)
def decide_seller_request(request_id):
    data = request.get_json(silent=True) or {}

    decision = str(data.get("status", "")).strip().lower()
    admin_note = str(data.get("admin_note", "")).strip()

    if decision not in ("approved", "rejected"):
        return jsonify({
            "error": "Status must be approved or rejected."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        # Find the request and lock it while processing.
        cursor.execute("""
            SELECT *
            FROM seller_book_requests
            WHERE request_id = %s
            FOR UPDATE
        """, (request_id,))

        book_request = cursor.fetchone()

        if not book_request:
            connection.rollback()
            return jsonify({
                "error": "Seller book request not found."
            }), 404

        if book_request["status"] != "pending":
            connection.rollback()
            return jsonify({
                "error": "This request has already been reviewed."
            }), 409

        # If approved, add the book to the customer books table.
        if decision == "approved":
            cursor.execute("""
                INSERT INTO books
                    (title, author, price, category, stock,
                     description, image_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                book_request["title"],
                book_request["author"],
                book_request["price"],
                book_request["category"] or "",
                1,
                book_request["description"],
                book_request["image_url"]
            ))

        # Save the decision.
        cursor.execute("""
            UPDATE seller_book_requests
            SET status = %s,
                admin_note = %s
            WHERE request_id = %s
        """, (decision, admin_note or None, request_id))

        connection.commit()

        message = (
            "Book approved and added to the store."
            if decision == "approved"
            else "Book request rejected."
        )

        return jsonify({
            "message": message,
            "request_id": request_id,
            "status": decision
        }), 200

    except mysql.connector.Error:
        if connection and connection.is_connected():
            connection.rollback()

        app.logger.exception("Error processing seller book decision")

        return jsonify({
            "error": "Could not process the book request."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()
            
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=5000)
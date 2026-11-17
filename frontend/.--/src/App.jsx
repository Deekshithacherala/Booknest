import { useState, useEffect }
 from "react";
import "./App.css";
const sellerTableHeader = {
  padding: "12px",
  textAlign: "left",
  background: "#f5e9e2",
  color: "#5c4033",
  borderBottom: "1px solid #eadfd8",
};

const sellerTableCell = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #eadfd8",
};
function App(){
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
const [showCart, setShowCart] = useState(false);
const [showCheckout, setShowCheckout] = useState(false);
const [orderPlaced, setOrderPlaced] = useState(false);
const [isPlacingOrder, setIsPlacingOrder] = useState(false);
const [orderError, setOrderError] = useState("");
const [showLogin, setShowLogin] = useState(true);
const [currentUser, setCurrentUser] = useState(null);
const [myOrders, setMyOrders] = useState([]);
// Seller's submitted books
const [sellerRequests, setSellerRequests] = useState([]);
const [sellerRequestsLoading, setSellerRequestsLoading] = useState(false);
const [sellerRequestsError, setSellerRequestsError] = useState("");
const [showSubmittedBooks, setShowSubmittedBooks] = useState(false);
// Seller features
const [isSeller, setIsSeller] = useState(false);
const [showSellerForm, setShowSellerForm] = useState(false);
const [sellerLoading, setSellerLoading] = useState(false);
const [sellerMessage, setSellerMessage] = useState("");
const [sellerError, setSellerError] = useState("");

const [sellerBook, setSellerBook] = useState({
  title: "",
  author: "",
  category: "",
  price: "",
  description: "",
  image_url: "",
});
const [ordersLoading, setOrdersLoading] = useState(false);
const [ordersError, setOrdersError] = useState("");
const [showMyOrders, setShowMyOrders] = useState(false);
const [adminSection, setAdminSection] = useState("dashboard");
const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");
const [loginError, setLoginError] = useState("");
const [isLoggingIn, setIsLoggingIn] = useState(false);
const [isRegistering, setIsRegistering] = useState(false);
const [registerName, setRegisterName] = useState("");
const [registerEmail, setRegisterEmail] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
const [registerError, setRegisterError] = useState("");
const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
const [showAddBookForm, setShowAddBookForm] = useState(false);
const [newBook, setNewBook] = useState({
title: "",

author: "",
price: "",
cost_price: "",
category: "",
stock: "",
description: "",
image_url: "",
});
const [addBookError, setAddBookError] = useState("");
const [addBookMessage, setAddBookMessage] = useState("");
const [isAddingBook, setIsAddingBook] = useState(false);

const [adminBooks, setAdminBooks] = useState([]);
const [adminOrders, setAdminOrders] = useState([]);

// Admin seller book requests
const [adminSellerRequests, setAdminSellerRequests] = useState([]);
const [sellerAdminLoading, setSellerAdminLoading] = useState(false);
const [sellerAdminError, setSellerAdminError] = useState("");
const [sellerDecisionLoading, setSellerDecisionLoading] = useState(null);
const [sellerAdminNote, setSellerAdminNote] = useState({});
const handleSellerDecision = async (requestId, status) => {
  const action = status === "approved" ? "accept" : "reject";

  const confirmed = window.confirm(
    `Are you sure you want to ${action} this book request?`
  );

  if (!confirmed) return;

  setSellerDecisionLoading(requestId);
  setSellerAdminError("");

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/admin/seller-requests/${requestId}/decision`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          admin_note: sellerAdminNote[requestId] || "",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || `Failed to ${action} the book request.`
      );
    }

    // Update the request status on the page
    setAdminSellerRequests((previousRequests) =>
  status === "rejected"
    ? previousRequests.filter(
        (request) => request.request_id !== requestId
      )
    : previousRequests.map((request) =>
        request.request_id === requestId
          ? { ...request, status: "approved" }
          : request
      )
);

    window.alert(
      status === "approved"
        ? "Book request approved successfully!"
        : "Book request rejected successfully!"
    );
  } catch (error) {
    setSellerAdminError(
      error.message || "Unable to process the book request."
    );
  } finally {
    setSellerDecisionLoading(null);
  }
};



// Sales summary loading
const [salesLoading, setSalesLoading] = useState(false);
const [salesError, setSalesError] = useState("");
const [salesSummary, setSalesSummary] = useState(null);
const [adminCustomers, setAdminCustomers] = useState([]);
const [customersLoading, setCustomersLoading] = useState(false);
const [customersError, setCustomersError] = useState("");



const [booksLoading, setBooksLoading] = useState(false);
const [booksError, setBooksError] = useState("");
const [customerBooks, setCustomerBooks] = useState([]);
const [restockQuantities, setRestockQuantities] = useState({});
const [restockLoadingId, setRestockLoadingId] = useState(null);
useEffect(() => {
  const loadCustomerBooks = async () => {
    setBooksLoading(true);
    setBooksError("");


    try {
      const response = await fetch("http://127.0.0.1:5000/books");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load books.");
      }

      const formattedBooks = data.map((book) => ({
        ...book,
        id: book.book_id,
        color: "cover1",
      }));

      setCustomerBooks(formattedBooks);
    } catch (error) {
      setBooksError(error.message || "Unable to load books.");
    } finally {
      setBooksLoading(false);
    }
  };

  loadCustomerBooks();
}, [showLogin]);
useEffect(() => {
  if (adminSection !== "books" || currentUser?.role !== "admin") {
    return;
  }

  const loadAdminBooks = async () => {
    setBooksLoading(true);
    setBooksError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/admin/books"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load books.");
      }

      setAdminBooks(data);
    } catch (error) {
      setBooksError(error.message || "Could not load books.");
    } finally {
      setBooksLoading(false);
    }
  };

  loadAdminBooks();
}, [adminSection, currentUser]);


useEffect(() => {
  if (adminSection !== "orders" || currentUser?.role !== "admin") {
    return;
  }

  const loadAdminOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/admin/orders"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load orders.");
      }

      setAdminOrders(data);
    } catch (error) {
      setOrdersError(error.message || "Unable to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  loadAdminOrders();
}, [adminSection, currentUser]);


useEffect(() => {
  if (!currentUser || currentUser.role !== "customer") {
    setMyOrders([]);
    return;
  }

  const fetchMyOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/my-orders/${currentUser.user_id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load your orders.");
      }

      setMyOrders(data);
    } catch (error) {
      setOrdersError(error.message || "Unable to load your orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  fetchMyOrders();
}, [currentUser]);

useEffect(() => {
    if (adminSection !== "customers") return;

    const fetchCustomers = async () => {
        setCustomersLoading(true);
        setCustomersError("");

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/admin/customers"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to load customers."
                );
            }

            setAdminCustomers(data);
        } catch (error) {
            setCustomersError(error.message);
        } finally {
            setCustomersLoading(false);
        }
    };

    fetchCustomers();
}, [adminSection]);


useEffect(() => {
  if (adminSection !== "profit" || currentUser?.role !== "admin") {
    return;
  }

  const loadSalesSummary = async () => {
    setSalesLoading(true);
    setSalesError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/admin/sales-summary"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load sales data.");
      }

      setSalesSummary(data);
    } catch (error) {
      setSalesError(error.message || "Unable to load sales data.");
    } finally {
      setSalesLoading(false);
    }
  };

  loadSalesSummary();
}, [adminSection, currentUser]);

useEffect(() => {
  if (
    adminSection !== "seller-requests" ||
    currentUser?.role !== "admin"
  ) {
    return;
  }

  const loadSellerRequests = async () => {
    setSellerAdminLoading(true);
    setSellerAdminError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/admin/seller-requests"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load seller requests."
        );
      }

      setAdminSellerRequests(
        Array.isArray(data) ? data : data.requests || []
      );
    } catch (error) {
      setSellerAdminError(
        error.message || "Unable to load seller requests."
      );
    } finally {
      setSellerAdminLoading(false);
    }
  };

  loadSellerRequests();
}, [adminSection, currentUser]);






const handlePlaceOrder = async (event) => {
  event.preventDefault();

  setOrderError("");

  if (!currentUser || currentUser.role !== "customer") {
    setOrderError("Please log in with a customer account.");
    return;
  }

  if (cart.length === 0) {
    setOrderError("Your cart is empty.");
    return;
  }

  const formData = new FormData(event.currentTarget);

  const orderData = {
    user_id: currentUser.user_id,
    customer_name: formData.get("customer_name").trim(),
    customer_email: formData.get("customer_email").trim(),
    delivery_address: formData.get("delivery_address").trim(),
    items: cart.map((book) => ({
      book_id: book.id,
      quantity: book.quantity,
    })),
  };

  setIsPlacingOrder(true);

  try {
    const response = await fetch("http://127.0.0.1:5000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not place your order.");
    }

    setOrderPlaced(true);
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
  } catch (error) {
    setOrderError(error.message || "Unable to place your order.");
  } finally {
    setIsPlacingOrder(false);
  }
};

// Enable seller access
const handleEnableSeller = async () => {
  setSellerLoading(true);
  setSellerError("");
  setSellerMessage("");

  try {
    const response = await fetch(
      "http://127.0.0.1:5000/seller/enable",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.user_id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Could not enable seller access."
      );
    }

    setIsSeller(true);
  } catch (error) {
    setSellerError(
      error.message || "Something went wrong."
    );
  } finally {
    setSellerLoading(false);
  }
};


// Submit a book for admin approval
const handleSubmitSellerBook = async (event) => {
  console.log("SUBMIT BUTTON CLICKED!");
  event.preventDefault();

  setSellerError("");
  setSellerMessage("");
  setSellerLoading(true);

  try {
    const response = await fetch(
      "http://127.0.0.1:5000/seller/requests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          ...sellerBook,
          price: Number(sellerBook.price),
        }),
      }
    );


    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Could not submit the book."
      );
    }

alert("📚 Your book has been submitted successfully!\n\n⏳ Your book is waiting for admin approval.");

    setSellerBook({
      title: "",
      author: "",
      category: "",
      price: "",
      description: "",
      image_url: "",
    });
    await loadSellerRequests();
    setShowSellerForm(false);
  } catch (error) {
    setSellerError(
      error.message || "Unable to submit the book."
    );
  } finally {
    setSellerLoading(false);
  }
};
  
// Load the seller's submitted books
const loadSellerRequests = async () => {
  if (!currentUser?.user_id) return;

  setSellerRequestsLoading(true);
  setSellerRequestsError("");

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/seller/requests/${currentUser.user_id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Could not load your submitted books."
      );
    }

    setSellerRequests(data);
  } catch (error) {
    setSellerRequestsError(
      error.message || "Unable to load submitted books."
    );
  } finally {
    setSellerRequestsLoading(false);
  }
};
const books = customerBooks;
const deleteBook = async (bookId) => {
  const confirmed = window.confirm("Are you sure you want to delete this book?");

  if (!confirmed) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/admin/books/${bookId}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not delete book.");
    }

    setAdminBooks((previousBooks) =>
      previousBooks.filter((book) => book.book_id !== bookId)
    );
  } catch (error) {
    setBooksError(error.message || "Could not delete book.");
  }
};
const handleRestockBook = async (bookId) => {
  const quantity = Number(restockQuantities[bookId]);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    alert("Please enter a quantity greater than 0.");
    return;
  }

  try {
    setRestockLoadingId(bookId);

    const response = await fetch(
      `http://127.0.0.1:5000/admin/books/${bookId}/restock`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to restore stock.");
    }

    const booksResponse = await fetch("http://127.0.0.1:5000/admin/books");
    const booksData = await booksResponse.json();

    if (!booksResponse.ok) {
      throw new Error("Could not refresh the book list.");
    }

    setAdminBooks(booksData);

    setRestockQuantities((prev) => ({
      ...prev,
      [bookId]: "",
    }));

    alert(`${quantity} copies added successfully!`);
  } catch (error) {
    alert(error.message);
  } finally {
    setRestockLoadingId(null);
  }
};



  const addToCart = (book) => {
  setCart((previousCart) => {
    const existingBook = previousCart.find(
      (item) => item.id === book.id
    );

    if (existingBook) {
      return previousCart.map((item) =>
        item.id === book.id
          ? { ...item, quantity: (item.quantity || 0) + 1 }
          : item
      );
    }

    return [...previousCart, { ...book, quantity: 1 }];
  });

  setShowCart(true);
};

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  return (

  <div className="app">
  {showLogin ? (
    <section className="login-section">
      <div className="login-card">
        <h2>Welcome to BookNest 📚</h2>
        <p>Log in to continue your reading journey.</p>

{!isRegistering && (   
<form
  className="login-form"
  onSubmit={async (event) => {
    event.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || "Login failed.");
        return;
      }

      setLoginEmail("");
      setLoginPassword("");
      setCurrentUser(data.user);
      setShowLogin(false);
      setCart([]);

      setLoginError("");
    } catch (error) {
      setLoginError(
        "Cannot connect to the server. Please try again."
      );
    } finally {
      setIsLoggingIn(false);
    }
  }}


>
  <input
    type="email"
    placeholder="Email Address"
    value={loginEmail}
    onChange={(event) => setLoginEmail(event.target.value)}
    required
  />

  <input
    type="password"
    placeholder="Password"
    value={loginPassword}
    onChange={(event) => setLoginPassword(event.target.value)}
    required
  />

  {loginError && <p className="login-error">{loginError}</p>}

  <button
    type="submit"
    className="checkout-btn"
    disabled={isLoggingIn}
  >
    {isLoggingIn ? "Logging in..." : "Login"}
  </button>
</form>
)}

{isRegistering && (
  <form
    className="login-form"
    onSubmit={async (event) => {
      event.preventDefault();
      setRegisterError("");
      setIsSubmittingRegistration(true);

      try {
        const response = await fetch(
          "http://127.0.0.1:5000/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: registerName,
              email: registerEmail,
              password: registerPassword,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setRegisterError(data.error || "Registration failed.");
          return;
        }

        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setIsRegistering(false);
        setLoginError("");

        alert("Account created successfully! Please log in.");
      } catch (error) {
        setRegisterError(
          "Cannot connect to the server. Please try again."
        );
      } finally {
        setIsSubmittingRegistration(false);
      }
    }}
  >
    <input
      type="text"
      placeholder="Full Name"
      value={registerName}
      onChange={(event) => setRegisterName(event.target.value)}
      required
    />

    <input
      type="email"
      placeholder="Email Address"
      value={registerEmail}
      onChange={(event) => setRegisterEmail(event.target.value)}
      required
    />

    <input
      type="password"
      placeholder="Password (minimum 8 characters)"
      value={registerPassword}
      onChange={(event) => setRegisterPassword(event.target.value)}
      minLength={8}
      required
    />

    {registerError && (
      <p className="login-error">{registerError}</p>
    )}

    <button
      type="submit"
      className="checkout-btn"
      disabled={isSubmittingRegistration}
    >
      {isSubmittingRegistration
        ? "Creating Account..."
        : "Create Account"}
    </button>
  </form>
)}


<button
  type="button"
  className="checkout-btn"
  onClick={() => {
    setIsRegistering(!isRegistering);
    setRegisterError("");
    setLoginError("");
  }}
>
  {isRegistering
    ? "Already have an account? Login"
    : "New to BookNest? Create Account"}
</button>





        <p className="signup-text">
          New to BookNest? Create an account soon!
        </p>
      </div>
    </section>

) : currentUser?.role === "admin" ? (
  <section className="admin-section">
  <h1 className="admin-title">📚 BookNest Admin Dashboard</h1>
  <p className="admin-welcome">
    Welcome, {currentUser.name || "Admin"}!
  </p>
    {adminSection === "dashboard" ? (
      <>
        <h2 style={{ marginTop: "30px" }}>Management Center</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <button
            className="book-card"
            style={{ padding: "25px", cursor: "pointer" }}
            onClick={() => {
                setAdminSection("books");
            }}
          >
            <h3>📚 Manage Books</h3>
            <p>Add, edit, and remove books.</p>
          </button>

          <button
            className="book-card"
            style={{ padding: "25px", cursor: "pointer" }}
            onClick={() => {
              setAdminSection("orders");
            }}
          >
            <h3>📦 Orders</h3>
            <p>View customer purchases and order status.</p>
          </button>

          <button
            className="book-card"
            style={{ padding: "25px", cursor: "pointer" }}
            onClick={() => setAdminSection("customers")}
          >
            <h3>👥 Customers</h3>
            <p>View registered customers.</p>
          </button>

          <button
  className="book-card"
  style={{ padding: "25px", cursor: "pointer" }}
  onClick={() => setAdminSection("profit")}
>
  <h3>💰 Sales & Profit</h3>
  <p>Monitor revenue, costs, and gross profit.</p>
</button>



{/* Seller Requests */}
<button
  className="book-card"
  style={{ padding: "25px", cursor: "pointer" }}
  onClick={() => setAdminSection("seller-requests")}
>
  <h3>📚 Seller Requests</h3>
  <p>Review, approve, or reject books submitted by sellers.</p>
</button>
        </div>
      </>
    ) : (
      <>
        <button
          className="checkout-btn"
          style={{ marginTop: "25px", maxWidth: "220px" }}
          onClick={() => setAdminSection("dashboard")}
        >
          ← Back to Dashboard
        </button>

       {adminSection === "books" && (

  <div className="manage-books-section">
  <h2>📚 Manage Books</h2>
  <p>View the books currently stored in your database.</p>

 <div className="books-actions">
    <button
type="button"
className="checkout-btn"
style={{ marginBottom: "15px", maxWidth: "200px" }}
onClick={() => {
setShowAddBookForm(!showAddBookForm);
setAddBookError("");
setAddBookMessage("");
}}

>

{showAddBookForm ? "Cancel" : "➕ Add Book"} </button>

{showAddBookForm && (

  <form
    onSubmit={async (event) => {
      event.preventDefault();
      setAddBookError("");
      setIsAddingBook(true);


  try {
    const response = await fetch("http://127.0.0.1:5000/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newBook.title,
        author: newBook.author,
        category: newBook.category,
        price: Number(newBook.price),
        stock: Number(newBook.stock),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not save book.");
    }

    const booksResponse = await fetch("http://127.0.0.1:5000/admin/books");
    const booksData = await booksResponse.json();

    if (!booksResponse.ok) {
      throw new Error("Book saved, but the table could not refresh.");
    }

    setAdminBooks(booksData);
    setNewBook({
      title: "",
      author: "",
      price: "",
      cost_price: "",
      category: "",
      stock: "",
      description: "",
      image_url: "",
    });
    setShowAddBookForm(false);
  } catch (error) {
    setAddBookError(error.message || "Unable to connect to the server.");
  } finally {
    setIsAddingBook(false);
  }
}}
style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  maxWidth: "700px",
  padding: "20px",
  margin: "15px 0 25px",
  border: "1px solid #ddd",
  borderRadius: "12px",
}}


>


<h3 style={{ gridColumn: "1 / -1" }}>Add a New Book 📚</h3>

<input
  type="text"
  placeholder="Book Title"
  value={newBook.title}
  onChange={(event) =>
    setNewBook({ ...newBook, title: event.target.value })
  }
  required
/>

<input
  type="text"
  placeholder="Author"
  value={newBook.author}
  onChange={(event) =>
    setNewBook({ ...newBook, author: event.target.value })
  }
  required
/>

<input
  type="text"
  placeholder="Category"
  value={newBook.category}
  onChange={(event) =>
    setNewBook({ ...newBook, category: event.target.value })
  }
  required
/>

<input
  type="number"
  placeholder="Price (₹)"
  min="0.01"
  step="0.01"
  value={newBook.price}
  onChange={(event) =>
    setNewBook({ ...newBook, price: event.target.value })
  }
  required
/>

<input
  type="number"
  placeholder="Stock Quantity"
  min="0"
  step="1"
  value={newBook.stock}
  onChange={(event) =>
    setNewBook({ ...newBook, stock: event.target.value })
  }
  required
/>

{addBookError && (
  <p style={{ color: "red", gridColumn: "1 / -1" }}>
    {addBookError}
  </p>
)}

<button
  type="submit"
  className="checkout-btn"
  disabled={isAddingBook}
  style={{ maxWidth: "200px" }}
>
  {isAddingBook ? "Saving..." : "Save Book"}
</button>


  </form>
)}

</div>

{booksError && (

  <p style={{ color: "red" }}>{booksError}</p>
)}

{adminBooks.length > 0 ? (

  <div style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left"
      }}
    >
      <thead>
        <tr>
          {["ID", "Title", "Author", "Category", "Price", "Cost Price", "Stock", "Action"].map(
            (heading) => (
              <th
                key={heading}
                style={{
                  padding: "12px",
                  borderBottom: "2px solid #ddd"
                }}
              >
                {heading}
              </th>
            )
          )}
        </tr>
      </thead>

      <tbody>
        {adminBooks.map((book) => (
          <tr key={book.book_id}>
            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              {book.book_id}
            </td>
            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              {book.title}
            </td>
            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              {book.author}
            </td>
            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              {book.category}
            </td>
            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              ₹{Number(book.price).toFixed(2)}
            </td>
            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              ₹{Number(book.cost_price ?? 0).toFixed(2)}
            </td>
            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              {book.stock}
            </td>
          <td style={{ padding: "12px", borderBottom: "1px solid #ddd", minWidth: "300px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "nowrap" }}>
    <input
      type="number"
      min="1"
      placeholder="Qty"
      value={restockQuantities[book.book_id] ?? ""}
      onChange={(e) =>
        setRestockQuantities((prev) => ({
          ...prev,
          [book.book_id]: e.target.value,
        }))
      }
      style={{ width: "65px", padding: "8px" }}
    />

    <button
      type="button"
      onClick={() => handleRestockBook(book.book_id)}
      disabled={restockLoadingId === book.book_id}
      style={{
        backgroundColor: "#27845c",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "9px 12px",
        cursor: "pointer",
      }}
    >
      {restockLoadingId === book.book_id ? "Updating..." : "↻ Restock"}
    </button>

    <button
      type="button"
      onClick={() => deleteBook(book.book_id)}
      style={{
        backgroundColor: "#b74747",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "9px 12px",
        cursor: "pointer",
      }}
    >
      ➖ Delete
    </button>
  </div>
</td> 
          </tr>
        ))}
     
  </tbody>
</table>


  </div>
) : (

  <p>No books found. Click Manage Books to view available books.</p>
)}
</div>
)}


{adminSection === "orders" && (
  <div style={{ marginTop: "25px" }}>
    <h2>📦 Customer Orders</h2>
    <p>View customer purchases, quantities, totals, and order status.</p>

    {ordersLoading && <p>Loading orders...</p>}

    {ordersError && (
      <p style={{ color: "red" }}>{ordersError}</p>
    )}

    {!ordersLoading && !ordersError && adminOrders.length === 0 && (
      <p>No orders found in the database.</p>
    )}

    {!ordersLoading && adminOrders.length > 0 && (
      <div style={{ overflowX: "auto", marginTop: "20px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left"
          }}
        >
          <thead>
            <tr>
              {[
                "Order ID",
                "Customer",
                "Email",
                "Books",
                "Total",
                "Payment",
                "Status",
                "Order Date"
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    padding: "12px",
                    borderBottom: "2px solid #ddd"
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {adminOrders.map((order) => (
              <tr key={order.order_id}>
                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  #{order.order_id}
                </td>

                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  {order.customer_name}
                </td>

                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  {order.customer_email}
                </td>

                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  {order.items.map((item) => (
                    <div key={item.book_id}>
                      {item.book_title} × {item.quantity}
                    </div>
                  ))}
                </td>

                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  ₹{Number(order.total_amount).toFixed(2)}
                </td>

                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  {order.payment_status || "Pending"}
                </td>

                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  {order.order_status || "Pending"}
                </td>

                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  {order.order_date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

{adminSection === "customers" && (

  <div style={{ marginTop: "25px" }}>
    <h2>👥 Customer Management</h2>
    <p>View registered customers and their purchase histories.</p>


<div style={{ overflowX: "auto", marginTop: "20px" }}>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "left",
    }}
  >
    <thead>
      <tr>
        {["Customer Name", "Email", "Orders", "Total Spent"].map(
          (heading) => (
            <th
              key={heading}
              style={{
                padding: "12px",
                borderBottom: "2px solid #ddd",
              }}
            >
              {heading}
            </th>
          )
        )}
      </tr>
    </thead>

    <tbody>
  {customersLoading ? (
    <tr>
      <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
        Loading customers...
      </td>
    </tr>
  ) : customersError ? (
    <tr>
      <td colSpan="4" style={{ padding: "20px", color: "red" }}>
        {customersError}
      </td>
    </tr>
  ) : adminCustomers.length > 0 ? (
    adminCustomers.map((customer) => (
      <tr key={customer.user_id}>
        <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
          {customer.name}
        </td>

        <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
          {customer.email}
        </td>

        <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
          {customer.total_orders}
        </td>

        <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
          ₹{Number(customer.total_spent).toLocaleString("en-IN")}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
        No customers found.
      </td>
    </tr>
  )}
</tbody>
  </table>
</div>


  </div>
)}


       

      {adminSection === "profit" && (
  <div style={{ marginTop: "25px" }} className="sales-summary">
    <h2>💰 Sales & Profit</h2>

    {salesLoading && <p>Loading sales data...</p>}

    {salesError && (
      <p style={{ color: "red" }}>{salesError}</p>
    )}

    {salesSummary && !salesLoading && (
      <div className="sales-cards">
        <div className="sales-card">
          <h3>Total Orders</h3>
          <p>{salesSummary.total_orders}</p>
        </div>

        <div className="sales-card">
          <h3>Total Revenue</h3>
          <p>
            ₹{Number(salesSummary.total_revenue).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="sales-card">
          <h3>Books Sold</h3>
          <p>{salesSummary.books_sold}</p>
        </div>

        <div className="sales-card">
          <h3>Estimated Gross Profit</h3>
          <p>
            ₹{Number(salesSummary.gross_profit).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    )}
  </div>
)}

{/* Admin Seller Requests */}
{adminSection === "seller-requests" && (
  <div className="sales-summary" style={{ marginTop: "25px" }}>
    <h2>📚 Seller Requests</h2>

    {sellerAdminLoading && <p>Loading seller requests...</p>}

    {sellerAdminError && (
      <p style={{ color: "red" }}>{sellerAdminError}</p>
    )}

    {!sellerAdminLoading &&
      !sellerAdminError &&
      adminSellerRequests.length === 0 && (
        <p>No seller requests found.</p>
      )}

    {!sellerAdminLoading && adminSellerRequests.length > 0 && (
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead>
            <tr>
              <th style={sellerTableHeader}>Book</th>
              <th style={sellerTableHeader}>Author</th>
              <th style={sellerTableHeader}>Seller</th>
              <th style={sellerTableHeader}>Price</th>
              <th style={sellerTableHeader}>Status</th>
              <th style={sellerTableHeader}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {adminSellerRequests.map((request) => (
             <tr key={request.request_id}>
                <td style={sellerTableCell}>
                  {request.title || request.book_title || "Untitled"}
                </td>

                <td style={sellerTableCell}>
                  {request.author || "—"}
                </td>

                <td style={sellerTableCell}>
                  {request.seller_name || request.seller_email || "—"}
                </td>

                <td style={sellerTableCell}>
                  ₹{Number(request.price || 0).toLocaleString("en-IN")}
                </td>

                <td style={sellerTableCell}>
  {request.status || "Pending"}
</td>

<td style={sellerTableCell}>
  {request.status?.toLowerCase() === "pending" ? (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={() => handleSellerDecision(request.request_id, "approved")}
        disabled={sellerDecisionLoading === request.id}
        style={{
          padding: "8px 12px",
          background: "#2e7d32",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {sellerDecisionLoading === request.id ? "Processing..." : "Accept"}
      </button>

      <button
            onClick={() => handleSellerDecision(request.request_id, "rejected")}
              disabled={sellerDecisionLoading === request.id}
        style={{
          padding: "8px 12px",
          background: "#c62828",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Reject
      </button>
    </div>
  ) : (
    "—"
  )}
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
      </>
    )}

    <button
      className="checkout-btn"
      style={{ marginTop: "30px" }}
      onClick={() => {
        setCurrentUser(null);
        setAdminSection("dashboard");
        setShowLogin(true);
      }}
    >
      Logout
    </button>
  </section>


  ) : (
    <>

      {/* NAVBAR */}
    
  <nav className="navbar">
    <h1 className="logo">BookNest<span>.</span></h1>

    <div className="nav-links">
      <a href="#home">Home</a>
      <a href="#books">Books</a>
      <a href="#about">About</a>
    </div>

    <div className="nav-actions">
      <button
        className="cart-btn"
        onClick={() => setShowCart(!showCart)}
      >
        🛒 Cart ({cart.reduce((total, book) => total + book.quantity, 0)})
      </button>

      {currentUser?.role === "customer" && (
  <button
    className="login-btn"
    onClick={() => {
  const willOpen = !showSellerForm;

  setShowSellerForm(willOpen);
  setSellerMessage("");
  setSellerError("");

  if (willOpen && isSeller) {
    loadSellerRequests();
  }
}}
  >
    🏷️ Sell Your Books
  </button>
)}

    <button
className="login-btn"
onClick={async () => {
setShowMyOrders(true);
setShowCart(false);
setShowCheckout(false);
setOrderPlaced(false);

if (!currentUser || currentUser.role !== "customer") {
return;
}

setOrdersLoading(true);
setOrdersError("");

try {
const response = await fetch(
`http://127.0.0.1:5000/my-orders/${currentUser.user_id}`
);


const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || "Could not load your orders.");
}

setMyOrders(data);


} catch (error) {
setOrdersError(error.message || "Unable to load your orders.");
} finally {
setOrdersLoading(false);
}

setTimeout(() => {
document.getElementById("my-orders-section")?.scrollIntoView({
behavior: "smooth",
block: "start",
});
}, 100);
}}


>

📦 My Orders </button>

     
      <button
        className="login-btn"
        onClick={() => {
          setShowLogin(true);
          setShowCart(false);
          setShowCheckout(false);
          setOrderPlaced(false);
        }}
      >
        Login
      </button>

    </div>
  </nav>

{/* SELLER SECTION */}

{showSellerForm && currentUser?.role === "customer" && (
  <section className="seller-section">
    <h2>🏷️ Sell Your Books</h2>
    <p>Submit your book details for admin approval.</p>

    {!isSeller ? (
      <>
        <p>Enable seller access before submitting your books.</p>

        <button
          type="button"
          className="checkout-btn"
          onClick={handleEnableSeller}
          disabled={sellerLoading}
        >
          {sellerLoading ? "Enabling..." : "Become a Seller"}
        </button>

        {sellerError && (
          <p style={{ color: "red" }}>{sellerError}</p>
        )}

       {sellerMessage && (
  <p className="seller-success-message">
    {sellerMessage}
  </p>
)}
      </>
    ) : (
      <>
        <form
          className="seller-form"
          onSubmit={handleSubmitSellerBook}
        >
          <input
            type="text"
            placeholder="Book Title"
            value={sellerBook.title}
            onChange={(event) =>
              setSellerBook({
                ...sellerBook,
                title: event.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Author"
            value={sellerBook.author}
            onChange={(event) =>
              setSellerBook({
                ...sellerBook,
                author: event.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={sellerBook.category}
            onChange={(event) =>
              setSellerBook({
                ...sellerBook,
                category: event.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Price (₹)"
            min="0.01"
            step="0.01"
            value={sellerBook.price}
            onChange={(event) =>
              setSellerBook({
                ...sellerBook,
                price: event.target.value,
              })
            }
            required
          />

          <textarea
            placeholder="Book Description"
            value={sellerBook.description}
            onChange={(event) =>
              setSellerBook({
                ...sellerBook,
                description: event.target.value,
              })
            }
          />

          <input
            type="url"
            placeholder="Book Cover Image URL (optional)"
            value={sellerBook.image_url}
            onChange={(event) =>
              setSellerBook({
                ...sellerBook,
                image_url: event.target.value,
              })
            }
          />

          {sellerError && (
            <p style={{ color: "red" }}>{sellerError}</p>
          )}

          {sellerMessage && (
            <p style={{ color: "green" }}>{sellerMessage}</p>
          )}

          <button
            type="submit"
            className="checkout-btn"
            disabled={sellerLoading}
          >
            {sellerLoading ? "Submitting..." : "Submit for Approval"}
          </button>
        </form>

       {/* MY SUBMITTED BOOKS BUTTON */}

<button
  type="button"
  className="my-submitted-books-btn"
  onClick={() => {
    const nextState = !showSubmittedBooks;

    setShowSubmittedBooks(nextState);

    if (nextState) {
      loadSellerRequests();
    }
  }}
>
  {showSubmittedBooks
    ? "✖ Hide My Submitted Books"
    : "📚 My Submitted Books"}
</button>

{/* SELLER BOOK TRACKER */}

{showSubmittedBooks && (
  <div className="seller-tracker">
    <h3>📚 My Submitted Books</h3>

    {sellerRequestsLoading && (
      <p>Loading your submitted books...</p>
    )}

    {sellerRequestsError && (
      <p style={{ color: "red" }}>
        {sellerRequestsError}
      </p>
    )}

    {!sellerRequestsLoading &&
      !sellerRequestsError &&
      sellerRequests.length === 0 && (
        <p>You haven't submitted any books yet.</p>
      )}

    {sellerRequests.map((book) => (
      <div
        className="seller-book-card"
        key={book.request_id}
      >
        <h4>{book.title}</h4>

        <p>Author: {book.author}</p>

        <p>
          Category: {book.category || "Not specified"}
        </p>

        <p>
          Price: ₹{Number(book.price).toFixed(2)}
        </p>

        <p>
          Status:{" "}
          <strong
            className={`seller-status ${book.status}`}
          >
            {book.status?.toUpperCase()}
          </strong>
        </p>

        {book.admin_note && (
          <p>Admin note: {book.admin_note}</p>
        )}
      </div>
    ))}
  </div>
)}

        </>
      )}
  </section>
)}
    
      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">YOUR NEXT CHAPTER STARTS HERE</p>

          <h2>
            Find Your Next
            <br />
            <span>Favourite Book.</span>
          </h2>

          <p className="hero-text">
            Explore stories, discover new ideas and find books
            that inspire your imagination.
          </p>

          <a href="#books" className="explore-btn">
            Explore Books →
          </a>
        </div>

        <div className="hero-image">
          <div className="book-stack">
            📚
          </div>
          <p>Discover. Explore. Read.</p>
        </div>
      </section>

      {/* BOOK SECTION */}
      <section className="books-section" id="books">
        <div className="section-heading">
          <div>
            <p className="small-heading">OUR COLLECTION</p>
            <h2>Featured Books</h2>
          </div>

          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box"
          />
        </div>

        <div className="book-container">
  {filteredBooks.length > 0 ? (
    filteredBooks.map((book) => (
      <div className="book-card" key={book.id}>
        <div className={`book-cover ${book.color}`}>
          <p>{book.category}</p>
          <h3>{book.title}</h3>
          <span>{book.author}</span>
        </div>

        <div className="book-info">
          <h3>{book.title}</h3>
          <p>{book.author}</p>

          <div className="book-bottom">
  <h4>₹{book.price}</h4>

  {Number(book.stock) <= 0 ? (
    <button disabled className="out-of-stock-btn">
      Out of Stock
    </button>
  ) : (
    <button onClick={() => addToCart(book)}>
      🛒 Add to Cart
    </button>
  )}
</div>
        </div>
      </div>
    ))
  ) : (
    <p className="no-books">No books found!</p>
  )}
</div>
</section>


{/* CUSTOMER ORDER HISTORY */}

{showMyOrders && (
  <section
    className="orders-section"
    id="my-orders-section"
  >
    <h2>📦 My Orders</h2>
    <p>All your BookNest purchases in one place.</p>

    <button
      className="checkout-btn"
      onClick={() => setShowMyOrders(false)}
    >
      ← Continue Shopping
    </button>

    {ordersLoading && <p>Loading your orders...</p>}

    {ordersError && (
      <p style={{ color: "red" }}>{ordersError}</p>
    )}

    {!ordersLoading &&
      !ordersError &&
      myOrders.length === 0 && (
        <p>You haven't placed any orders yet.</p>
      )}

    {!ordersLoading &&
      !ordersError &&
      myOrders.length > 0 && (
        <div className="customer-orders-list">
          {myOrders.map((order) => (
            <div
              className="customer-order-card"
              key={order.order_id}
            >
              {/* Order heading */}
              <div className="customer-order-header">
                <div>
                  <span className="order-label">
                    ORDER DETAILS
                  </span>
                  <h3>Order #{order.order_id}</h3>
                </div>

                <span
                  className={`order-status ${
                    (order.order_status || "Pending").toLowerCase()
                  }`}
                >
                  {order.order_status || "Pending"}
                </span>
              </div>

              {/* Order date */}
              <div className="customer-order-date">
                <span>📅</span>
                <div>
                  <small>Order date</small>
                  <p>{order.order_date}</p>
                </div>
              </div>

              {/* Purchased books */}
              <div className="customer-order-items">
                {order.items.map((item) => (
                  <div
                    className="customer-order-item"
                    key={item.book_id}
                  >
                    <div className="order-book-info">
                      <h4>{item.book_title}</h4>
                      <p>
                        {item.quantity} × ₹
                        {Number(item.price).toFixed(2)}
                      </p>
                    </div>

                    <strong className="order-item-total">
                      ₹
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Payment and total */}
              <div className="customer-order-footer">
                <div className="order-payment-info">
                  <span>Payment status</span>
                  <strong>
                    {order.payment_status || "Pending"}
                  </strong>
                </div>

                <div className="order-total">
                  <span>Total amount</span>
                  <h3>
                    ₹{Number(order.total_amount).toFixed(2)}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
  </section>
)}


      {/* CART SECTION */}
{showCart && (
  <section className="cart-section">
    <h2>Your Shopping Cart 🛒</h2>

    {cart.length === 0 ? (
      <p>Your cart is empty.</p>
    ) : (
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((book) => (
            <div className="cart-item" key={book.id}>
              <h3>{book.title}</h3>
              <p>Author: {book.author}</p>
              <p>Price: ₹{book.price}</p>
              <p>Quantity: {book.quantity}</p>
              <p>
                Subtotal: ₹{book.price * book.quantity}
              </p>

              <button
                onClick={() =>
                  setCart((previousCart) =>
                    previousCart.filter(
                      (item) => item.id !== book.id
                    )
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>

          <p>
            Total Items:{" "}
            {cart.reduce(
              (total, book) => total + book.quantity,
              0
            )}
          </p>

          <h3>
            Total: ₹
            {cart.reduce(
              (total, book) =>
                total + book.price * book.quantity,
              0
            )}
          </h3>

          <button
            className="checkout-btn"
            disabled={cart.length === 0}
            onClick={() => {
              setShowCart(false);
              setShowCheckout(true);
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    )}
  </section>
)} 

        

        





      {showCheckout && (
  <section className="checkout-section">
    <h2>Checkout</h2>
    <p>Almost yours! Complete your details to place the order.</p>

    <form className="checkout-form" onSubmit={handlePlaceOrder}>
      <input
  type="text"
  name="customer_name"
  placeholder="Full Name"
  defaultValue={currentUser?.name || ""}
  required
/>

<input
  type="email"
  name="customer_email"
  placeholder="Email Address"
  defaultValue={currentUser?.email || ""}
  required
/>

<textarea
  name="delivery_address"
  placeholder="Delivery Address"
  required
/>

    
<h3>
  Final Amount: ₹
  {cart.reduce(
    (total, book) => total + book.price * book.quantity,
    0
  )}
</h3>

{orderError && (
  <p style={{ color: "red" }}>{orderError}</p>
)}

<button
  type="submit"
  className="checkout-btn"
  disabled={isPlacingOrder}
>
  {isPlacingOrder ? "Placing Order..." : "Place Order"}
</button>


    </form>
  </section>
)}

{orderPlaced && (
  <section className="success-section">
    <h2>🎉 Order Placed Successfully!</h2>
    <p>Thank you for shopping with BookNest.</p>
    <p>Your order has been confirmed.</p>

    <button
      className="checkout-btn"
      onClick={() => setOrderPlaced(false)}
    >
      Continue Shopping
    </button>
  </section>
)}


      {/* FOOTER */}
      <footer id="about">
        <h2>BookNest.</h2>
        <p>Discover. Explore. Read.</p>
        <p>© 2026 BookNest. All rights reserved.</p>
       </footer>
      </>
    )}
  </div>
  );
}



export default App;
# 🍔 Foodingo Backend API

A fast, secure, and scalable backend for a food delivery platform built with **Node.js, Express, MongoDB, and JWT authentication**.

This backend powers:

* User authentication
* Restaurant & item management
* Cart system
* Categories & offers
* Admin panel
* Secure role-based access

Designed for production scalability and real-world traffic.

---

## 🚀 Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB + Mongoose**
* **JWT Authentication**
* **Cloudinary (image hosting)**
* **Helmet (security)**
* **Rate Limiting**
* **Compression**
* **Role-based access control (RBAC)**

---

## 🔐 Features

### Authentication

* Email + password login
* JWT-based authentication
* Role-based access (customer, owner, admin)
* Banned user protection
* Secure password hashing (bcrypt)

### Restaurants

* Owner-managed restaurants
* Indexed queries for fast browsing
* Rating & delivery time support

### Items

* Category-based browsing
* Restaurant-based filtering
* Offer price auto-calculation
* Veg/Non-veg filtering
* Cloudinary image support

### Cart System

* Atomic add/remove operations
* No duplicate items
* Quantity increment/decrement
* Indexed for fast access
* Scales to large carts

### Categories & Offers

* Admin-controlled creation
* Indexed queries
* Active/inactive offers
* Sorted responses

### Security

* Helmet protection
* Rate limiting
* Request size limits
* JWT verification
* CORS protection
* Role-based authorization

---

## 📁 Project Structure

```
backend/
│
├── db.js
├── index.js
├── package.json
│
├── models/
│   ├── user.js
│   ├── restaurant.js
│   ├── item.js
│   ├── cart.js
│   ├── categories.js
│   └── offer.js
│
├── routes/
│   ├── users.js
│   ├── restaurants.js
│   ├── items.js
│   ├── cartItems.js
│   ├── category.js
│   ├── offers.js
│   └── adminRoutes.js
│
├── middleware/
│   ├── authenticate.js
│   └── isAdmin.js
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📦 Installation

```bash
git clone https://github.com/ritikch027/foodingo.git
cd foodingo
npm install
```

---

## ▶️ Run the Server

```bash
npm start
```

Server will run on:

```
http://localhost:3000
```

Health check:

```
GET /health
```

---

## 🔑 Authentication

All protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🛒 API Overview

### Auth

```
POST   /api/register
POST   /api/login-user
GET    /api/userdata
```

### Cart

```
GET    /api/cart
POST   /api/cart/add
POST   /api/cart/increment
POST   /api/cart/decrement
```

### Categories

```
GET    /api/categories
POST   /api/categories        (Admin only)
```

### Items

```
GET    /api/items/category/:categoryName
GET    /api/items/restaurant/:restaurantId
POST   /api/items/:restaurantId      (Owner only)
DELETE /api/items/:restaurantId/:productId (Owner only)
```

### Restaurants

```
POST   /api/restaurants
GET    /api/restaurants
```

### Offers

```
GET    /api/offers
POST   /api/offers            (Admin only)
```

---

## 🧠 Performance Optimizations

* MongoDB indexes on all high-traffic collections
* Atomic cart updates
* Connection pooling
* Gzip compression
* Lean queries
* Role-based authorization via JWT
* Optimized payload sizes

---

## 🛡 Security

* Password hashing with bcrypt
* JWT token expiration
* Rate limiting on APIs
* Helmet security headers
* Request size limits
* Role-based access
* Admin-only protected routes

---

## 📈 Scalability

This backend is built to scale to:

* A large number of users
* Lots of cart operations
* High traffic browsing
* Cloud deployment (Render)

---

## 🧑‍💻 Author

Built by **Ritik Chauhan**
Designed for real-world food delivery platforms.

---

## ⭐ Final Notes

This backend is production-ready and follows modern backend engineering standards.

If you're building a food delivery app, this gives you:

* Speed
* Security
* Stability
* Clean architecture

---

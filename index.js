const express = require("express");
const connectDB = require("./db");
const orders = require("./routes/customer/orders");
const categories = require("./routes/admin/category");
const offers = require("./routes/admin/offers");
const items = require("./routes/owner/items");
const users = require("./routes/customer/users");
const restaurants = require("./routes/owner/restaurants");
const cart = require("./routes/customer/cartItems");
const admin = require("./routes/admin/adminRoutes");

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Trust proxy (important for cloud deployment)
app.set("trust proxy", 1);

// ---------- Security ----------
app.use(helmet());

// Lock CORS (change to your frontend domain)
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

// ---------- Performance ----------
app.use(compression());
app.use(express.json({ limit: "1mb" }));

// ---------- Rate limiting (DDoS & bruteforce protection) ----------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // per IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// ---------- Database ----------
connectDB({
  maxPoolSize: 20,
  minPoolSize: 5,
});

// ---------- Routes ----------
app.use("/api", offers);
app.use("/api", users);
app.use("/api", categories);
app.use("/api", items);
app.use("/api", cart);
app.use("/api", admin);
app.use("/api", restaurants);
app.use("/api", orders);

// ---------- Health Check ----------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ---------- Root ----------
app.get("/", (req, res) => {
  res.send("Foodingo backend running 🚀");
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log("🟢 Backend running");
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

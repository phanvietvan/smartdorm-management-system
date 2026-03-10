require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const userRoutes = require("./routes/users");
const billRoutes = require("./routes/bills");
const paymentRoutes = require("./routes/payments");
const maintenanceRoutes = require("./routes/maintenance");
const visitorRoutes = require("./routes/visitors");
const messageRoutes = require("./routes/messages");
const areaRoutes = require("./routes/areas");
const dashboardRoutes = require("./routes/dashboard");
const serviceRoutes = require("./routes/services");
const notificationRoutes = require("./routes/notifications");
const uploadRoutes = require("./routes/upload");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- MongoDB Connection ---
const DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartdorm";

mongoose.connect(DB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:");
    console.error(err);
    process.exit(1);
  });

// --- Routes ---
app.get("/", (req, res) => {
  res.send("SmartDorm API Running");
});

app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/users", userRoutes);
app.use("/bills", billRoutes);
app.use("/payments", paymentRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/visitors", visitorRoutes);
app.use("/messages", messageRoutes);
app.use("/areas", areaRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/services", serviceRoutes);
app.use("/notifications", notificationRoutes);
app.use("/upload", uploadRoutes);

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
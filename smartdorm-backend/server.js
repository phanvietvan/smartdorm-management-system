require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const path = require("path");
const socketUtil = require("./utils/socket");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
const server = http.createServer(app);

// 1. CORS PHẢI Ở TRÊN CÙNG
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://localhost:3001",
  "https://smartdorm-management-system-sooty.vercel.app",
  "https://lenard-subentire-acknowledgingly.ngrok-free.app",
  "https://lenard-subentire-acknowledgingly.ngrok-free.dev"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS Blocked for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
}));

// 2. Middleware cơ bản
app.use(express.json({ limit: '10mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register models
require("./models/User");
require("./models/Room");
require("./models/Area");
require("./models/Bill");
require("./models/Service");
require("./models/Payment");
require("./models/MaintenanceRequest");
require("./models/Notification");
require("./models/Message");
require("./models/Visitor");
require("./models/RentalRequest");
require("./models/FaceData");
require("./models/CheckinLog");

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
const rentalRequestRoutes = require("./routes/rentalRequests");
const aiRoutes = require("./routes/aiRoutes");
const faceRoutes = require("./routes/faceRoutes");

// Initialize Socket.io
socketUtil.init(server);

// --- MongoDB Connection ---
const DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartdorm";
mongoose.connect(DB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// --- Swagger ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.get("/", (req, res) => res.send("SmartDorm API Running"));
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
app.use("/rental-requests", rentalRequestRoutes);
app.use("/ai", aiRoutes);
app.use("/face", faceRoutes);

// --- Push Route ---
app.post("/push/subscribe", require("./middleware/auth").authenticate, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ message: "Subscription is required" });
    const User = require("./models/User");
    const user = await User.findById(req.user._id);
    const exists = user.pushSubscriptions.some(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
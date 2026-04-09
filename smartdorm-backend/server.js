require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const path = require("path");
const socketUtil = require("./utils/socket");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

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

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketUtil.init(server);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// --- Push Route --- (New)
app.post("/push/subscribe", require("./middleware/auth").authenticate, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ message: "Subscription is required" });
    
    // Add to user's pushSubscriptions if not already exists
    const User = require("./models/User");
    const user = await User.findById(req.user._id);
    
    // Simple deduplication based on endpoint
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

app.delete("/push/unsubscribe", require("./middleware/auth").authenticate, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const User = require("./models/User");
    const user = await User.findById(req.user._id);
    user.pushSubscriptions = user.pushSubscriptions.filter(s => s.endpoint !== endpoint);
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
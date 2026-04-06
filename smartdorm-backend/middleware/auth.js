const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "smartdorm-secret-key-change-in-production";

/**
 * Middleware: Xác thực JWT, gắn user vào req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.query?.token;

    if (!token) {
      return res.status(401).json({ message: "Chưa đăng nhập. Vui lòng cung cấp token." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("+password").populate("roomId");

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ." });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn." });
    }
    return res.status(500).json({ message: "Lỗi xác thực." });
  }
}

/**
 * Middleware: Tùy chọn - nếu có token thì gắn user, không thì next
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.query?.token;

    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).populate("roomId");

    if (user && user.isActive) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
}

/**
 * Tạo JWT token cho user
 */
function generateToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

module.exports = {
  authenticate,
  optionalAuth,
  generateToken,
  JWT_SECRET,
};

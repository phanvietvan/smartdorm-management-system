const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const { ROLES } = require("../config/roles");
const { notifyUser } = require("../utils/notifyUser");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const formatUser = (user) => {
  if (!user) return null;
  return {
    id: user._id || user.id,
    _id: user._id || user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status || "approved",
    roomId: user.roomId,
    managedAreaId: user.managedAreaId,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    idCardNumber: user.idCardNumber,
    address: user.address,
  };
};

exports.formatUser = formatUser;

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "Thiếu email, password hoặc fullName" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });
    // Đăng ký qua email/password: coi như đã được duyệt
    const user = new User({
      email,
      password,
      fullName,
      phone,
      role: ROLES.GUEST,
      status: "approved",
      isActive: true,
    });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Thiếu email hoặc password" });
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    const token = generateToken(user);
    res.json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    console.log("=== Google Login Request ===");
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);
    console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
    
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Thiếu credential từ Google" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) return res.status(400).json({ message: "Google không cung cấp email" });

    let user = await User.findOne({ $or: [{ email }, { googleId }] }).select("+password");
    if (!user) {
      user = new User({
        email,
        fullName: name || email.split("@")[0],
        googleId,
        role: ROLES.GUEST,
        status: "approved",
        isActive: true,
        avatarUrl: picture,
      });
      await user.save();
      const token = generateToken(user);
      return res.status(201).json({
        message: "Đăng ký thành công",
        token,
        user: formatUser(user),
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (picture && !user.avatarUrl) user.avatarUrl = picture;
      await user.save({ validateBeforeSave: false });
    }

    // Kiểm tra trạng thái tài khoản trước khi cấp token
    if (user.status === "pending") {
      return res.status(403).json({
        message: "Tài khoản Google của bạn đang chờ quản trị viên duyệt.",
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        message: "Tài khoản Google của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa.",
      });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error("Google login error:", err);
    // Trả về chi tiết lỗi để dễ debug (chỉ dùng trong dev/local)
    res.status(401).json({
      message: "Đăng nhập Google thất bại",
      error: err.message || err.toString(),
    });
  }
};

exports.me = (req, res) => {
  res.json(formatUser(req.user));
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });

    const valid = await user.comparePassword(oldPassword);
    if (!valid) return res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác" });

    user.password = newPassword;
    await user.save();
    await notifyUser(user._id, "Mật khẩu đã thay đổi", "Mật khẩu tài khoản của bạn đã được thay đổi thành công. Nếu không phải bạn, vui lòng liên hệ quản trị.", "system");
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "Tài khoản không tồn tại" });
    
    // Giả lập gửi OTP/link reset qua email
    const resetToken = user._id; // Trả về ID tạm thời để test UI
    res.json({ success: true, message: "Đã gửi hướng dẫn khôi phục mật khẩu vào email của bạn", resetToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: "Thiếu token hoặc mật khẩu mới" });
    
    const user = await User.findById(token);
    if (!user) return res.status(400).json({ success: false, message: "Token không hợp lệ" });
    
    user.password = newPassword;
    await user.save();
    await notifyUser(user._id, "Mật khẩu đã đặt lại", "Mật khẩu tài khoản của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.", "system");
    res.json({ success: true, message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

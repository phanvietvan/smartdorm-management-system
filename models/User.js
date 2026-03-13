const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { ROLES } = require("../config/roles");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Không bắt buộc nếu đăng nhập Google
      },
      minlength: 6,
      select: false, // Không trả password khi query mặc định
    },
    googleId: {
      type: String,
      sparse: true,
      default: null,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.GUEST,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Cho Landlord/Manager: quản lý khu nhà nào
    managedAreaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      default: null,
    },
    // Cho Tenant: phòng đang thuê
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password trước khi save (bỏ qua nếu không có password - user Google)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// So sánh password (user Google không có password)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

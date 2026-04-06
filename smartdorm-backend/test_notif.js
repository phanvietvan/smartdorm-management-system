const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartdorm';

async function test() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const { notifyUser } = require('./utils/notificationService');
  const User = require('./models/User');
  const Notification = require('./models/Notification');

  // Lấy một tenant bất kỳ
  const tenant = await User.findOne({ role: 'tenant' });
  if (!tenant) {
    console.log("No tenant found to test!");
    return;
  }

  console.log(`Sending notification to Tenant: ${tenant.email}`);
  
  await notifyUser(
    tenant._id,
    "Test Thông Báo Admin [Real-time]",
    "Đây là thông báo gửi cho tenant nhưng Admin cũng phải nhận được.",
    "system"
  );

  console.log("Notification sent. Checking DB...");

  // Kiểm tra xem có bao nhiêu thông báo đã được tạo với tiêu đề này
  const created = await Notification.find({ title: "Test Thông Báo Admin [Real-time]" });
  console.log(`Notifications created in DB: ${created.length}`);
  created.forEach(n => {
    console.log(`- ID: ${n._id}, UserID: ${n.userId}, Read: ${n.isRead}`);
  });

  await mongoose.connection.close();
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});

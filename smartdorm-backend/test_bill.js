require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');
const User = require('./models/User');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/smartdorm');
  console.log("Connected to DB.");

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log("No admin found!");
    process.exit(1);
  }
  
  console.log("Admin User:", admin.email, "Role:", admin.role);
  
  const token = jwt.sign({ userId: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
  console.log("Generated Token.");

  try {
    const res = await fetch('http://localhost:5000/bills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        roomId: new mongoose.Types.ObjectId(),
        tenantId: new mongoose.Types.ObjectId(),
        month: 3,
        year: 2026,
      })
    });
    const text = await res.text();
    console.log("Response status:", res.status);
    console.log("Response body:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }

  process.exit(0);
}

test();

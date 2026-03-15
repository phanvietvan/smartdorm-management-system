const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartdorm');
    const users = await User.find({}, 'email fullName status role');
    console.log('--- USER STATUS LIST ---');
    console.log(JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();

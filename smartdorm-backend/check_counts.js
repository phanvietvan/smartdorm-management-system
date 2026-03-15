const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartdorm');
    
    const statuses = await User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('--- STATUS COUNTS ---');
    console.log(JSON.stringify(statuses, null, 2));

    const pendingSamples = await User.find({ status: 'pending' }, 'email fullName status').limit(5);
    console.log('\n--- PENDING SAMPLES ---');
    console.log(JSON.stringify(pendingSamples, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();

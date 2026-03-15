require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Area = require('./models/Area');
const User = require('./models/User');

const DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartdorm";

async function test() {
  await mongoose.connect(DB_URI);
  console.log("Connected to MongoDB");

  try {
    const tenants = await User.find({ role: 'tenant', roomId: { $ne: null } }).limit(5);
    console.log(`Found ${tenants.length} tenants with rooms.`);

    for (const tenant of tenants) {
      console.log(`\nTesting for tenant: ${tenant.fullName} (${tenant._id})`);
      console.log(`RoomID from user doc: ${tenant.roomId} (Type: ${typeof tenant.roomId})`);

      try {
        const room = await Room.findById(tenant.roomId).populate("areaId", "name address");
        if (room) {
          console.log(`✅ Room found: ${room.name} in area: ${room.areaId?.name || 'N/A'}`);
        } else {
          console.log(`❌ Room NOT found for ID: ${tenant.roomId}`);
        }
      } catch (err) {
        console.error(`💥 ERROR finding room: ${err.message}`);
      }
    }

  } catch (err) {
    console.error("Diagnostic failed:", err);
  } finally {
    await mongoose.connection.close();
  }
}

test();

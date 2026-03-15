require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("./models/Room");

const DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartdorm";

async function test() {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");
    
    const count = await Room.countDocuments();
    console.log("Room count:", count);
    
    const oneRoom = await Room.findOne();
    if (oneRoom) {
      console.log("Found a room:", oneRoom.name);
      const foundById = await Room.findById(oneRoom._id).populate("areaId");
      console.log("Found by ID with population:", foundById.name, "Area:", foundById.areaId?.name);
    } else {
      console.log("No rooms found in DB");
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

test();

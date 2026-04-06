const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Room = require('./models/Room');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms`);

    const defaultAmenities = ['Wifi 5G', 'Ban công', 'Tủ lạnh', 'Máy lạnh', 'WC riêng'];

    for (const room of rooms) {
      if (!room.amenities || room.amenities.length === 0) {
        room.amenities = defaultAmenities;
        await room.save();
        console.log(`Updated room ${room.name} with amenities`);
      }
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();

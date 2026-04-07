require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('Error: MONGO_URI not found in .env file');
  process.exit(1);
}

// Import models
const Canteen = require('./models/Canteen');
const User = require('./models/user');

async function debugMunchCorner() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Query Canteens collection for "Munch Corner"
    console.log('📍 Searching for canteen with name "Munch Corner"...');
    const canteen = await Canteen.findOne({ canteenName: 'Munch Corner' });
    
    if (canteen) {
      console.log('\n✅ Found Canteen:');
      console.log(JSON.stringify(canteen, null, 2));
    } else {
      console.log('❌ No canteen found with name "Munch Corner"');
    }

    // Query Users collection for a user with canteenName "Munch Corner"
    console.log('\n\n📍 Searching for user with canteenName "Munch Corner"...');
    const user = await User.findOne({ name: 'Munch Corner' });
    
    if (user) {
      console.log('\n✅ Found User:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ No user found with name "Munch Corner"');
      
      // Also try searching by email or other fields that might reference Munch Corner
      console.log('\n📍 Searching for any users with "Munch" in name...');
      const munchUsers = await User.find({ name: /Munch/i });
      if (munchUsers.length > 0) {
        console.log(`Found ${munchUsers.length} user(s) with "Munch" in name:`);
        console.log(JSON.stringify(munchUsers, null, 2));
      } else {
        console.log('No users found with "Munch" in name');
      }
    }

    console.log('\n✅ Debug complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    // Close connection
    console.log('\n🔌 Closing MongoDB connection...');
    await mongoose.disconnect();
    console.log('✅ Connection closed');
    process.exit(0);
  }
}

debugMunchCorner();

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const updateMunchCorner = async () => {
  await connectDB();
  
  try {
    const db = mongoose.connection.db;
    const canteensCollection = db.collection('canteens');
    
    // Find Munch Corner canteen
    const munchCorner = await canteensCollection.findOne({
      $or: [
        { canteenName: 'Munch Corner' },
        { name: 'Munch Corner' }
      ]
    });
    
    if (!munchCorner) {
      console.log('Munch Corner canteen not found');
      process.exit(0);
    }
    
    console.log('Found Munch Corner:', munchCorner.canteenName);
    console.log('Current image:', munchCorner.image);
    
    // Assign a nice image from uploads
    const imageAssignments = {
      '69aac230df75a9778e441db5': '/uploads/canteens/canteen_69aac230df75a9778e441db5_1774348263080.jpeg',
      '69c254b8189ff6fb98d70d58': '/uploads/canteens/canteen_69c254b8189ff6fb98d70d58_1775582419804.jpeg',
      '69c253f6189ff6fb98d70d52': '/uploads/canteens/canteen_69c253f6189ff6fb98d70d52_1775555536435.jpeg',
      '69c2545d189ff6fb98d70d55': '/uploads/canteens/canteen_69c2545d189ff6fb98d70d55_1775554910368.jpeg',
    };
    
    // Try to assign an image - pick the first available good one
    const newImage = '/uploads/canteens/canteen_69aac230df75a9778e441db5_1774348263080.jpeg';
    
    const result = await canteensCollection.updateOne(
      { _id: munchCorner._id },
      { 
        $set: { 
          image: newImage,
          updatedAt: new Date()
        }
      }
    );
    
    console.log('✅ Updated Munch Corner with image:', newImage);
    console.log('Modified count:', result.modifiedCount);
    
  } catch (error) {
    console.error('Error updating Munch Corner:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

updateMunchCorner();

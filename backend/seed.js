const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Canteen = require('./models/canteen');
const Meal = require('./models/Meal');
const User = require('./models/user');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear old data
  await Canteen.deleteMany({});
  await Meal.deleteMany({});
  await User.deleteMany({});

  // Create a temp student user
  const student = await User.create({
    _id: new mongoose.Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d1'),
    name: 'Test Student',
    email: 'student@test.com',
    password: '123456',
    role: 'student',
    studentId: 'STU001',
  });
  console.log('✅ Student created:', student.name);

  // Create canteens
  const canteen1 = await Canteen.create({
    name: 'Mama Kitchen',
    description: 'Homestyle Malaysian food with daily specials',
    operatingHours: '7:30AM - 4:00PM',
    location: 'Block A, Ground Floor',
    isApproved: true,
    isActive: true,
  });

  const canteen2 = await Canteen.create({
    name: 'Noodle House',
    description: 'Fresh noodles and soups made daily',
    operatingHours: '8:00AM - 3:00PM',
    location: 'Block B, Ground Floor',
    isApproved: true,
    isActive: true,
  });

  const canteen3 = await Canteen.create({
    name: 'Grill & Chill',
    description: 'Western and local fusion grills',
    operatingHours: '10:00AM - 5:00PM',
    location: 'Block C, Level 1',
    isApproved: true,
    isActive: true,
  });

  console.log('✅ Canteens created');

  // Create meals for Mama Kitchen
  await Meal.insertMany([
    { name: 'Nasi Lemak', description: 'Classic coconut rice with sambal, egg and anchovies', price: 4.50, category: 'Rice', isAvailable: true, canteen: canteen1._id },
    { name: 'Nasi Goreng Kampung', description: 'Village style fried rice with anchovies and vegetables', price: 5.00, category: 'Rice', isAvailable: true, canteen: canteen1._id },
    { name: 'Teh Tarik', description: 'Creamy pulled milk tea', price: 1.80, category: 'Drinks', isAvailable: true, canteen: canteen1._id },
    { name: 'Milo Ais', description: 'Iced Milo drink', price: 2.00, category: 'Drinks', isAvailable: true, canteen: canteen1._id },
    { name: 'Kuih Lapis', description: 'Layered steamed cake', price: 1.50, category: 'Desserts', isAvailable: true, canteen: canteen1._id },
  ]);

  // Create meals for Noodle House
  await Meal.insertMany([
    { name: 'Mee Goreng', description: 'Spicy stir fried yellow noodles', price: 4.50, category: 'Noodles', isAvailable: true, canteen: canteen2._id },
    { name: 'Char Kway Teow', description: 'Stir fried flat rice noodles with prawns', price: 6.00, category: 'Noodles', isAvailable: true, canteen: canteen2._id },
    { name: 'Laksa', description: 'Spicy coconut milk noodle soup', price: 5.50, category: 'Noodles', isAvailable: true, canteen: canteen2._id },
    { name: 'Cendol', description: 'Iced dessert with pandan jelly and coconut milk', price: 3.00, category: 'Desserts', isAvailable: true, canteen: canteen2._id },
  ]);

  // Create meals for Grill & Chill
  await Meal.insertMany([
    { name: 'Chicken Chop', description: 'Grilled chicken with black pepper sauce and fries', price: 8.50, category: 'Other', isAvailable: true, canteen: canteen3._id },
    { name: 'Beef Burger', description: 'Juicy beef patty with lettuce, tomato and cheese', price: 7.00, category: 'Other', isAvailable: true, canteen: canteen3._id },
    { name: 'Nuggets & Fries', description: 'Crispy chicken nuggets with seasoned fries', price: 5.50, category: 'Snacks', isAvailable: true, canteen: canteen3._id },
    { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 3.50, category: 'Drinks', isAvailable: true, canteen: canteen3._id },
  ]);

  console.log('✅ Meals created');
  console.log('🎉 Seed complete! You can now test all student pages.');
  mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
});
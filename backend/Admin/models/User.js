const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');




// ── Temporary User schema until Member 1 pushes their model ──────────────────
let User;
try {
  User = mongoose.model('User'); // use existing if already registered
} catch {
  const userSchema = new mongoose.Schema({
    name:           { type: String, required: true },
    email:          { type: String, required: true, unique: true },
    password:       { type: String, required: true, select: false },
    role:           { type: String, enum: ['admin', 'user', 'canteen'], default: 'admin' },
    phone:          { type: String },
    nic:            { type: String },
    profilePicture: { type: String },
  }, { timestamps: true });
  User = mongoose.model('User', userSchema);
}

const UserModel = () => User;
const express = require('express');
const path = require('path');
const connectDB = require('./config/db'); // import the db function
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// CORS configuration (allow frontend URL)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Auth routes ---
const authRoutes = require('./Auth/routes/authRoutes');
app.use('/api/auth', authRoutes);

// --- Student routes ---
const studentRoutes = require('./Student/routes/studentRoutes');
app.use('/api/student', studentRoutes);

// --- Canteen routes ---
const canteenRoutes = require('./Canteen/routes/canteenRoutes');
app.use('/api/canteen', canteenRoutes);

// --- Admin routes ---
const adminRoutes = require('./Admin/routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// --- Health / root ---
app.get('/', (_req, res) => res.send('Hello from the backend!'));
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// --- Start server ---
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');  // ← moved to top

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// ✅ Middleware FIRST
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Static files — BEFORE routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes AFTER middleware
const dashboardRoutes    = require('./Admin/routes/dashboardRoutes');
const adminProfileRoutes = require('./Admin/routes/Adminprofileroutes');
const Canteenroutes      = require('./Admin/routes/Canteenroutes');
const userRoutes = require('./Admin/routes/userRoutes');
const analyticsRoutes = require('./Admin/routes/analyticsRoutes');
require('./Admin/models/User');

app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin', adminProfileRoutes);
app.use('/api/admin', Canteenroutes);
app.use('/api/admin', userRoutes);
app.use('/api/admin', analyticsRoutes);

// Health check
app.get('/', (_req, res) => res.send('SmartMess backend running!'));
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
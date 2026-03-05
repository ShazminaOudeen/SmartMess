const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const dns = require('node:dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth routes
const authRoutes = require('./Auth/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Admin routes
const dashboardRoutes    = require('./Admin/routes/dashboardRoutes');
const adminProfileRoutes = require('./Admin/routes/Adminprofileroutes');
const Canteenroutes      = require('./Admin/routes/Canteenroutes');
const userRoutes         = require('./Admin/routes/userRoutes');
const analyticsRoutes    = require('./Admin/routes/analyticsRoutes');
const complaintRoutes    = require('./Admin/routes/complaintRoutes');
require('./Admin/models/User');

app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin', adminProfileRoutes);
app.use('/api/admin', Canteenroutes);
app.use('/api/admin', userRoutes);
app.use('/api/admin', analyticsRoutes);
app.use('/api/admin', complaintRoutes);

// Health
app.get('/', (_req, res) => res.send('SmartMess backend running!'));
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
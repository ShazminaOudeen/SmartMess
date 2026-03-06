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

// ✅ CORS - allows ALL localhost ports automatically
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

//Canteen module routes
const canteenProfileRoutes = require('./Canteen/routes/canteenProfileRoutes');
const mealRoutes = require('./Canteen/routes/mealRoutes');

app.use('/api/canteen/meals', mealRoutes);        
app.use('/api/canteen', canteenProfileRoutes);


// Student Module Routes
app.use('/api/student/canteens', require('./routes/canteenBrowseRoutes'));
app.use('/api/student/cart',     require('./routes/cartRoutes'));
app.use('/api/student/orders',   require('./routes/orderRoutes'));
app.use('/api/student/payment',  require('./routes/paymentRoutes'));
app.use('/api/student/tracking', require('./routes/studentTrackingRoutes'));

// Health check
app.get('/', (_req, res) => res.send('SmartMess backend running!'));
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
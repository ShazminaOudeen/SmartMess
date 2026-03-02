const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// ✅ CORS configuration - allows ALL localhost ports automatically
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

// --- Health / root ---
app.get('/', (_req, res) => res.send('Hello from the backend!'));
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// --- Student Module Routes ---
app.use('/api/student/canteens', require('./routes/canteenBrowseRoutes'));
app.use('/api/student/cart', require('./routes/cartRoutes'));
app.use('/api/student/orders', require('./routes/orderRoutes'));
app.use('/api/student/payment', require('./routes/paymentRoutes'));
app.use('/api/student/tracking', require('./routes/studentTrackingRoutes'));

// --- Start server ---
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
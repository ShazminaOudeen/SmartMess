const express = require('express');
const connectDB = require('./config/db'); // import the db function
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// ✅ CORS configuration (allow frontend URL)
app.use(cors({
  origin: 'http://localhost:5173',  // 👈 your frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Auth routes ---
const authRoutes = require('./Auth/routes/authRoutes');
app.use('/api/auth', authRoutes);

// --- Health / root ---
app.get('/', (_req, res) => res.send('Hello from the backend!'));
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// --- Start server ---
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
}); 
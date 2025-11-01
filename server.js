const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI not set in environment variables!');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully!'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

// Order Schema
const Order = mongoose.model('Order', new mongoose.Schema({
  method: String,
  cart: Array,
  total: Number,
  bkashTxnId: String,
  nagadTxnId: String,
  codAddress: String,
  codPhone: String,
  createdAt: { type: Date, default: Date.now }
}));

// Routes
import { API_BASE } from "./config";

async function signup(email, password) {
  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Signup failed");
    }

    const data = await res.text();
    console.log("Signup successful:", data);
    return data;
  } catch (err) {
    console.error("Signup error:", err.message);
    alert("Error connecting to server: " + err.message);
  }
}


import { API_BASE } from "./config";

async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Login failed");
    }

    const data = await res.text();
    console.log("Login successful:", data);
    return data;
  } catch (err) {
    console.error("Login error:", err.message);
    alert("Error connecting to server: " + err.message);
  }
}


app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).send('Server error');
  }
});

// Fallback for frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


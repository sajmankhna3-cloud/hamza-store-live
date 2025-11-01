const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Atlas connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hamkra-users';

mongoose.connect(mongoUri)
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

// Signup Route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send('User already exists');

    const user = new User({ email, password });
    await user.save();
    res.send('Signup successful');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Server error');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) res.send('Login successful');
    else res.status(401).send('Invalid credentials');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// Save Order Route
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(200).send({ message: 'Order saved' });
  } catch (err) {
    console.error('Order save error:', err);
    res.status(500).send('Server error');
  }
});

// View Orders Route (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).send('Server error');
  }
});

// Catch-all route (Express v4 compatible)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Listen on Render-assigned port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});




const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Knowledge Sharing System API is running...');
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);

module.exports = app;

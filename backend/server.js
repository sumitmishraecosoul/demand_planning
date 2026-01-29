const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/files', require('./routes/file.routes'));
app.use('/api/workflow', require('./routes/workflow.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Demand Planning API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

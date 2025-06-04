require('dotenv').config(); // default cari file .env di root
// Ensure dotenv is loaded before any other imports that might use environment variables
// Import necessary modules

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const certificateRoutes = require('./routes/certificates');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded certificates)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/certificates', certificateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Certificate Verification API is running',
    timestamp: new Date().toISOString(),
    contract: process.env.CONTRACT_ADDRESS || 'Not configured'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Certificate Verification API',
    endpoints: {
      health: '/health',
      issue: 'POST /api/certificates/issue',
      verify: 'GET /api/certificates/verify/:hash',
      verifyById: 'GET /api/certificates/verify-id/:id',
      list: 'GET /api/certificates/list'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} not found`
  });
});

// Debug: List all registered routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log('Registered route:', r.route.path);
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Certificate Verification API running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Contract Address: ${process.env.CONTRACT_ADDRESS || 'Not configured'}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/\n`);
});
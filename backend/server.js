const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const solutionsRoutes = require('./routes/solutions');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for API requests
const corsOptions = {
  origin: true, // Reflects the request origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS for API routes only
app.use('/api', cors(corsOptions));
app.use(express.json());

// Routes - API endpoints
app.use('/api', solutionsRoutes);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

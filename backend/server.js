const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { repositoryFactory } = require('./repositories');

// Import routes
const solutionsRoutes = require('./routes/solutions');
const statusRoutes = require('./routes/status');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
(async () => {
  try {
    // Initialize repository factory (which initializes the database connection)
    await repositoryFactory.initialize();
    console.log(`Database connection initialized (type: ${process.env.DB_TYPE || 'mongodb'})`);
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await repositoryFactory.close();
    console.log('Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Routes
app.use('/api', solutionsRoutes);
app.use('/api/status', statusRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

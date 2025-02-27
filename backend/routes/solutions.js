const express = require('express');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const router = express.Router();

// In-memory storage for user data (in a real app, this would be a database)
// This is just for demonstration purposes - in production, use a proper database
let userDataStore = {
  favorites: {},
  annotations: {},
  ratings: {},
  filterHistory: []
};

// Helper function to save user data to a JSON file
const saveUserData = () => {
  try {
    const dataPath = path.join(__dirname, '../data/userData.json');
    fs.writeFileSync(dataPath, JSON.stringify(userDataStore, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Helper function to load user data from a JSON file
const loadUserData = () => {
  try {
    const dataPath = path.join(__dirname, '../data/userData.json');
    if (fs.existsSync(dataPath)) {
      const userData = fs.readFileSync(dataPath, 'utf8');
      userDataStore = JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
};

// Load user data on server start
loadUserData();

// Helper function to load use cases data
const loadUseCases = () => {
  try {
    const dataPath = path.join(__dirname, '../data/useCases.json');
    const useCasesData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(useCasesData);
  } catch (error) {
    console.error('Error loading use cases data:', error);
    return [];
  }
};

// Helper function to extract SAP module from Use Case ID
const extractModule = (useCaseId) => {
  const modulePrefix = useCaseId.split('_')[0];
  return modulePrefix;
};

// GET /api/solutions - Get filtered solutions
router.get('/solutions', (req, res) => {
  try {
    const useCases = loadUseCases();
    
    // Extract query parameters
    const { role, module, keyword } = req.query;
    
    // Apply filters
    let filteredUseCases = useCases;
    
    // Filter by user role
    if (role) {
      filteredUseCases = filteredUseCases.filter(useCase => 
        useCase['User Role'].toLowerCase().includes(role.toLowerCase())
      );
    }
    
    // Filter by SAP module (extracted from Use Case ID)
    if (module) {
      filteredUseCases = filteredUseCases.filter(useCase => 
        extractModule(useCase['Use Case ID']).toLowerCase() === module.toLowerCase()
      );
    }
    
    // Filter by keyword (searches across multiple fields)
    if (keyword) {
      filteredUseCases = filteredUseCases.filter(useCase => 
        useCase['Use Case Name'].toLowerCase().includes(keyword.toLowerCase()) ||
        useCase['Challenge'].toLowerCase().includes(keyword.toLowerCase()) ||
        useCase['Key Benefits'].toLowerCase().includes(keyword.toLowerCase()) ||
        useCase['Mapped Solution'].toLowerCase().includes(keyword.toLowerCase())
      );
    }
    
    res.json(filteredUseCases);
  } catch (error) {
    console.error('Error processing solutions request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/metrics - Get metrics for dashboard
router.get('/metrics', (req, res) => {
  try {
    const useCases = loadUseCases();
    
    // Calculate metrics
    const moduleDistribution = {};
    const roleDistribution = {};
    
    useCases.forEach(useCase => {
      // Module distribution
      const module = extractModule(useCase['Use Case ID']);
      moduleDistribution[module] = (moduleDistribution[module] || 0) + 1;
      
      // Role distribution
      const role = useCase['User Role'];
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });
    
    res.json({
      totalUseCases: useCases.length,
      moduleDistribution,
      roleDistribution
    });
  } catch (error) {
    console.error('Error processing metrics request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/export - Export filtered solutions as CSV
router.get('/export', (req, res) => {
  try {
    const useCases = loadUseCases();
    
    // Apply the same filters as in /api/solutions
    const { role, module, keyword } = req.query;
    
    let filteredUseCases = useCases;
    
    if (role) {
      filteredUseCases = filteredUseCases.filter(useCase => 
        useCase['User Role'].toLowerCase().includes(role.toLowerCase())
      );
    }
    
    if (module) {
      filteredUseCases = filteredUseCases.filter(useCase => 
        extractModule(useCase['Use Case ID']).toLowerCase() === module.toLowerCase()
      );
    }
    
    if (keyword) {
      filteredUseCases = filteredUseCases.filter(useCase => 
        useCase['Use Case Name'].toLowerCase().includes(keyword.toLowerCase()) ||
        useCase['Challenge'].toLowerCase().includes(keyword.toLowerCase()) ||
        useCase['Key Benefits'].toLowerCase().includes(keyword.toLowerCase()) ||
        useCase['Mapped Solution'].toLowerCase().includes(keyword.toLowerCase())
      );
    }
    
    // Convert to CSV
    const fields = Object.keys(useCases[0]);
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(filteredUseCases);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sap-solutions.csv');
    
    res.send(csv);
  } catch (error) {
    console.error('Error processing export request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// FAVORITES ENDPOINTS

// GET /api/favorites - Get all favorites
router.get('/favorites', (req, res) => {
  try {
    // In a real app, you would get favorites for the authenticated user
    // For now, we'll return all favorites
    res.json(userDataStore.favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/favorites - Add a solution to favorites
router.post('/favorites', express.json(), (req, res) => {
  try {
    const { useCaseId, userId = 'default' } = req.body;
    
    if (!useCaseId) {
      return res.status(400).json({ message: 'Use case ID is required' });
    }
    
    // Initialize user's favorites if they don't exist
    if (!userDataStore.favorites[userId]) {
      userDataStore.favorites[userId] = [];
    }
    
    // Check if the solution is already in favorites
    if (!userDataStore.favorites[userId].includes(useCaseId)) {
      userDataStore.favorites[userId].push(useCaseId);
      saveUserData();
    }
    
    res.json({ success: true, favorites: userDataStore.favorites[userId] });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/favorites/:id - Remove a solution from favorites
router.delete('/favorites/:id', (req, res) => {
  try {
    const useCaseId = req.params.id;
    const { userId = 'default' } = req.query;
    
    if (!userDataStore.favorites[userId]) {
      return res.status(404).json({ message: 'No favorites found for this user' });
    }
    
    // Remove the solution from favorites
    userDataStore.favorites[userId] = userDataStore.favorites[userId].filter(id => id !== useCaseId);
    saveUserData();
    
    res.json({ success: true, favorites: userDataStore.favorites[userId] });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ANNOTATIONS ENDPOINTS

// GET /api/annotations - Get all annotations
router.get('/annotations', (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    
    // Return annotations for the specified user
    res.json(userDataStore.annotations[userId] || {});
  } catch (error) {
    console.error('Error getting annotations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/annotations - Add or update an annotation
router.post('/annotations', express.json(), (req, res) => {
  try {
    const { useCaseId, text, userId = 'default' } = req.body;
    
    if (!useCaseId || text === undefined) {
      return res.status(400).json({ message: 'Use case ID and text are required' });
    }
    
    // Initialize user's annotations if they don't exist
    if (!userDataStore.annotations[userId]) {
      userDataStore.annotations[userId] = {};
    }
    
    // Add or update the annotation
    userDataStore.annotations[userId][useCaseId] = text;
    saveUserData();
    
    res.json({ success: true, annotations: userDataStore.annotations[userId] });
  } catch (error) {
    console.error('Error adding annotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/annotations/:id - Remove an annotation
router.delete('/annotations/:id', (req, res) => {
  try {
    const useCaseId = req.params.id;
    const { userId = 'default' } = req.query;
    
    if (!userDataStore.annotations[userId] || !userDataStore.annotations[userId][useCaseId]) {
      return res.status(404).json({ message: 'Annotation not found' });
    }
    
    // Remove the annotation
    delete userDataStore.annotations[userId][useCaseId];
    saveUserData();
    
    res.json({ success: true, annotations: userDataStore.annotations[userId] });
  } catch (error) {
    console.error('Error removing annotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// RATINGS ENDPOINTS

// GET /api/ratings - Get all ratings
router.get('/ratings', (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    
    // Return ratings for the specified user
    res.json(userDataStore.ratings[userId] || {});
  } catch (error) {
    console.error('Error getting ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ratings - Add or update a rating
router.post('/ratings', express.json(), (req, res) => {
  try {
    const { useCaseId, rating, feedback = '', userId = 'default' } = req.body;
    
    if (!useCaseId || rating === undefined) {
      return res.status(400).json({ message: 'Use case ID and rating are required' });
    }
    
    // Initialize user's ratings if they don't exist
    if (!userDataStore.ratings[userId]) {
      userDataStore.ratings[userId] = {};
    }
    
    // Add or update the rating
    userDataStore.ratings[userId][useCaseId] = { rating, feedback, timestamp: new Date().toISOString() };
    saveUserData();
    
    res.json({ success: true, ratings: userDataStore.ratings[userId] });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ratings/summary - Get aggregated ratings
router.get('/ratings/summary', (req, res) => {
  try {
    const summary = {};
    
    // Calculate average ratings for each use case
    Object.values(userDataStore.ratings).forEach(userRatings => {
      Object.entries(userRatings).forEach(([useCaseId, data]) => {
        if (!summary[useCaseId]) {
          summary[useCaseId] = { total: 0, count: 0, average: 0, feedback: [] };
        }
        
        summary[useCaseId].total += data.rating;
        summary[useCaseId].count += 1;
        summary[useCaseId].average = summary[useCaseId].total / summary[useCaseId].count;
        
        if (data.feedback) {
          summary[useCaseId].feedback.push(data.feedback);
        }
      });
    });
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting ratings summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// FILTER HISTORY ENDPOINTS

// GET /api/filter-history - Get filter history
router.get('/filter-history', (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    
    // Return filter history for the specified user
    const userHistory = userDataStore.filterHistory.filter(item => item.userId === userId);
    res.json(userHistory);
  } catch (error) {
    console.error('Error getting filter history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/filter-history - Add a filter to history
router.post('/filter-history', express.json(), (req, res) => {
  try {
    const { filters, name = '', userId = 'default' } = req.body;
    
    if (!filters) {
      return res.status(400).json({ message: 'Filters are required' });
    }
    
    // Add the filter to history
    const historyItem = {
      id: Date.now().toString(),
      userId,
      filters,
      name,
      timestamp: new Date().toISOString()
    };
    
    // Limit history to 10 items per user
    const userHistory = userDataStore.filterHistory.filter(item => item.userId === userId);
    if (userHistory.length >= 10) {
      // Remove the oldest item
      const oldestIndex = userDataStore.filterHistory.findIndex(item => item.userId === userId);
      if (oldestIndex !== -1) {
        userDataStore.filterHistory.splice(oldestIndex, 1);
      }
    }
    
    userDataStore.filterHistory.push(historyItem);
    saveUserData();
    
    res.json({ success: true, history: userDataStore.filterHistory.filter(item => item.userId === userId) });
  } catch (error) {
    console.error('Error adding filter history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

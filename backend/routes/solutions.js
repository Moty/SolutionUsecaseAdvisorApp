const express = require('express');
const path = require('path');
const multer = require('multer');
const { matchPdfToUseCase, getUserConfiguredWeights, saveUserConfiguredWeights, DEFAULT_WEIGHTS } = require('../pdfMatcher');
const solutionsService = require('../services/solutionsService');

// Set up multer for file uploads
const upload = multer({ 
  dest: path.join(__dirname, '../uploads/'),
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

const router = express.Router();

// GET /api/solutions - Get filtered solutions
router.get('/solutions', async (req, res) => {
  try {
    // Extract query parameters
    const { role, module, keyword } = req.query;
    
    // Create filters object
    const filters = {};
    if (role) filters.role = role;
    if (module) filters.module = module;
    if (keyword) filters.keyword = keyword;
    
    console.log('Backend received request for solutions with filters:', filters);
    
    // Get solutions from service
    const solutions = await solutionsService.getSolutions(filters);
    
    console.log(`Backend returning ${solutions ? solutions.length : 0} solutions`);
    console.log('First solution sample:', solutions && solutions.length > 0 ? solutions[0] : 'No solutions found');
    
    res.json(solutions);
  } catch (error) {
    console.error('Error processing solutions request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/metrics - Get metrics for dashboard
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await solutionsService.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error processing metrics request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/export - Export filtered solutions as CSV
router.get('/export', async (req, res) => {
  try {
    // Extract query parameters
    const { role, module, keyword } = req.query;
    
    // Create filters object
    const filters = {};
    if (role) filters.role = role;
    if (module) filters.module = module;
    if (keyword) filters.keyword = keyword;
    
    // Get CSV from service
    const csv = await solutionsService.exportToCsv(filters);
    
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
router.get('/favorites', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    const favorites = await solutionsService.getFavorites(userId);
    res.json(favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/favorites - Add a solution to favorites
router.post('/favorites', express.json(), async (req, res) => {
  try {
    const { useCaseId, userId = 'default' } = req.body;
    
    if (!useCaseId) {
      return res.status(400).json({ message: 'Use case ID is required' });
    }
    
    const favorites = await solutionsService.addFavorite(useCaseId, userId);
    res.json({ success: true, favorites });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/favorites/:id - Remove a solution from favorites
router.delete('/favorites/:id', async (req, res) => {
  try {
    const useCaseId = req.params.id;
    const { userId = 'default' } = req.query;
    
    const favorites = await solutionsService.removeFavorite(useCaseId, userId);
    res.json({ success: true, favorites });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ANNOTATIONS ENDPOINTS

// GET /api/annotations - Get all annotations
router.get('/annotations', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    const annotations = await solutionsService.getAnnotations(userId);
    res.json(annotations);
  } catch (error) {
    console.error('Error getting annotations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/annotations - Add or update an annotation
router.post('/annotations', express.json(), async (req, res) => {
  try {
    const { useCaseId, text, userId = 'default' } = req.body;
    
    if (!useCaseId || text === undefined) {
      return res.status(400).json({ message: 'Use case ID and text are required' });
    }
    
    const annotations = await solutionsService.addAnnotation(useCaseId, text, userId);
    res.json({ success: true, annotations });
  } catch (error) {
    console.error('Error adding annotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/annotations/:id - Remove an annotation
router.delete('/annotations/:id', async (req, res) => {
  try {
    const useCaseId = req.params.id;
    const { userId = 'default' } = req.query;
    
    const annotations = await solutionsService.removeAnnotation(useCaseId, userId);
    res.json({ success: true, annotations });
  } catch (error) {
    console.error('Error removing annotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// RATINGS ENDPOINTS

// GET /api/ratings - Get all ratings
router.get('/ratings', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    const ratings = await solutionsService.getRatings(userId);
    res.json(ratings);
  } catch (error) {
    console.error('Error getting ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ratings - Add or update a rating
router.post('/ratings', express.json(), async (req, res) => {
  try {
    const { useCaseId, rating, feedback = '', userId = 'default' } = req.body;
    
    if (!useCaseId || rating === undefined) {
      return res.status(400).json({ message: 'Use case ID and rating are required' });
    }
    
    const ratings = await solutionsService.addRating(useCaseId, rating, feedback, userId);
    res.json({ success: true, ratings });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ratings/summary - Get aggregated ratings
router.get('/ratings/summary', async (req, res) => {
  try {
    const summary = await solutionsService.getRatingsSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting ratings summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// FILTER HISTORY ENDPOINTS

// GET /api/filter-history - Get filter history
router.get('/filter-history', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    const history = await solutionsService.getFilterHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('Error getting filter history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/filter-history - Add a filter to history
router.post('/filter-history', express.json(), async (req, res) => {
  try {
    const { filters, name = '', userId = 'default' } = req.body;
    
    if (!filters) {
      return res.status(400).json({ message: 'Filters are required' });
    }
    
    const history = await solutionsService.addFilterHistory(filters, name, userId);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error adding filter history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// SIMILARITY WEIGHTS ENDPOINTS

/**
 * GET /api/similarity-weights - Get current similarity weights
 * 
 * Returns the currently configured weights used for similarity calculations.
 * If no custom weights are set, returns the default weights.
 */
router.get('/similarity-weights', async (req, res) => {
  try {
    const weights = getUserConfiguredWeights();
    res.json({ 
      weights,
      isDefault: JSON.stringify(weights) === JSON.stringify(DEFAULT_WEIGHTS)
    });
  } catch (error) {
    console.error('Error getting similarity weights:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/similarity-weights - Save new similarity weights
 * 
 * Updates the weights used for similarity calculations.
 * Expects a JSON body with weights for each field.
 */
router.post('/similarity-weights', express.json(), async (req, res) => {
  try {
    const { weights } = req.body;
    
    if (!weights || typeof weights !== 'object') {
      return res.status(400).json({ message: 'Invalid weights format' });
    }
    
    // Validate weights (must have all required fields and sum to 1.0)
    const requiredFields = ['focusArea', 'process', 'affected', 'improvement', 'howToImprove'];
    const missingFields = requiredFields.filter(field => weights[field] === undefined);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required weight fields', 
        missingFields 
      });
    }
    
    // Convert to numbers and check if they're valid
    const numericWeights = {};
    requiredFields.forEach(field => {
      numericWeights[field] = parseFloat(weights[field]);
      if (isNaN(numericWeights[field]) || numericWeights[field] < 0) {
        return res.status(400).json({ 
          message: 'Invalid weight value', 
          field,
          value: weights[field]
        });
      }
    });
    
    // Check if weights sum to approximately 1.0 (allow for floating point imprecision)
    const sum = Object.values(numericWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      return res.status(400).json({ 
        message: 'Weight values must sum to 1.0', 
        sum,
        weights: numericWeights
      });
    }
    
    // Save the new weights
    const success = saveUserConfiguredWeights(numericWeights);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to save weights' });
    }
    
    res.json({ 
      success: true, 
      weights: numericWeights 
    });
  } catch (error) {
    console.error('Error saving similarity weights:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PDF MATCHING ENDPOINT

/**
 * POST /api/match-pdf - Match a PDF to existing use cases
 * 
 * This endpoint accepts a PDF file upload and returns the best matching use case
 * based on similarity between the PDF content and existing use cases.
 * 
 * Request:
 * - multipart/form-data with a 'pdf' file field
 * - optional 'threshold' field (number between 0-1, default: 0.6)
 * - optional 'useAI' field (boolean, default: true)
 * - optional 'customWeights' field (JSON object with field weights)
 * 
 * Response:
 * - JSON object with the best matching use case and similarity score
 * - If no match is found, returns a message and the best candidate
 */
router.post('/match-pdf', upload.single('pdf'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }
    
    // Get the path to the uploaded file
    const pdfPath = req.file.path;
    
    // Get the similarity threshold from the request (default: 0.6)
    const threshold = req.body.threshold ? parseFloat(req.body.threshold) : 0.6;
    
    // Get the original filename
    const originalFilename = req.file.originalname;
    
    // Get AI matching preference (default: true)
    const useAI = req.body.useAI !== undefined ? (req.body.useAI === 'true' || req.body.useAI === true) : true;
    
    // Get custom weights if provided
    let customWeights = null;
    if (req.body.customWeights) {
      try {
        customWeights = JSON.parse(req.body.customWeights);
      } catch (error) {
        console.warn('Invalid custom weights format:', error);
      }
    }
    
    // Log the matching parameters
    console.log('PDF Matching Parameters:', {
      threshold,
      useAI,
      customWeights: customWeights ? 'custom' : 'default',
      originalFilename
    });
    
    // Match the PDF to existing use cases
    const match = await matchPdfToUseCase(pdfPath, threshold, originalFilename, customWeights, useAI);
    
    // Ensure the original filename is set in the response
    if (!match.pdfFileName) {
      match.pdfFileName = originalFilename;
    }
    
    // Log the final response for debugging
    console.log('Final API response:', JSON.stringify(match, null, 2));
    
    // Clean up the temporary file
    const fs = require('fs');
    fs.unlinkSync(pdfPath);
    
    // Return the match result
    res.json(match);
  } catch (error) {
    console.error('Error matching PDF:', error);
    
    // Clean up the temporary file if it exists
    if (req.file && req.file.path) {
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    
    // Return an error response
    res.status(500).json({ 
      message: 'Failed to match PDF', 
      error: error.message 
    });
  }
});

// NEW USE CASES ENDPOINTS

/**
 * GET /api/new-use-cases - Get all new use cases
 */
router.get('/new-use-cases', async (req, res) => {
  try {
    const newUseCases = await solutionsService.getNewUseCases();
    res.json(newUseCases);
  } catch (error) {
    console.error('Error getting new use cases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/export-new-use-cases - Export new use cases as CSV
 */
router.get('/export-new-use-cases', async (req, res) => {
  try {
    const csv = await solutionsService.exportNewUseCasesToCsv();
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=new-use-cases.csv');
    
    res.send(csv);
  } catch (error) {
    console.error('Error exporting new use cases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/new-use-cases - Save a new use case
 */
router.post('/new-use-cases', express.json(), async (req, res) => {
  try {
    console.log('Received request to save new use case with data:', JSON.stringify({
      extractedFields: req.body.extractedFields ? 'present' : 'missing',
      mappedFields: req.body.mappedFields ? 'present' : 'missing',
      pdfFileName: req.body.pdfFileName,
      userId: req.body.userId || 'default'
    }));
    
    const { extractedFields, mappedFields, pdfFileName, userId = 'default' } = req.body;
    
    if (!extractedFields || !mappedFields) {
      console.error('Missing required fields:', { 
        extractedFields: !!extractedFields, 
        mappedFields: !!mappedFields 
      });
      return res.status(400).json({ message: 'Extracted fields and mapped fields are required' });
    }
    
    // Log the mapped fields to see what's being sent
    console.log('Mapped fields received:', JSON.stringify(mappedFields));
    
    const newUseCase = await solutionsService.saveNewUseCase(
      extractedFields,
      mappedFields,
      pdfFileName || 'unknown.pdf',
      userId
    );
    
    console.log('New use case saved successfully with ID:', newUseCase.id);
    res.status(201).json(newUseCase);
  } catch (error) {
    console.error('Error saving new use case:', error);
    // Provide more detailed error message to help with debugging
    res.status(500).json({ 
      message: 'Server error while saving use case', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

/**
 * PUT /api/new-use-cases/:id - Update a new use case
 */
router.put('/new-use-cases/:id', express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const { extractedFields, mappedFields, status, notes } = req.body;
    
    const updatedUseCase = await solutionsService.updateNewUseCase(id, {
      extractedFields,
      mappedFields,
      status,
      notes
    });
    
    if (!updatedUseCase) {
      return res.status(404).json({ message: 'Use case not found' });
    }
    
    res.json(updatedUseCase);
  } catch (error) {
    console.error('Error updating new use case:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/new-use-cases/:id - Delete a new use case
 */
router.delete('/new-use-cases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await solutionsService.deleteNewUseCase(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Use case not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting new use case:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

/**
 * Data Import Utilities
 * 
 * This module provides utilities for importing data from JSON files to MongoDB.
 * It includes functions for importing use cases and validating data.
 */

const fs = require('fs').promises;
const path = require('path');
const { repositoryFactory } = require('../repositories');

/**
 * Import use cases from a JSON file to MongoDB
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object>} Import results with counts
 */
async function importUseCasesFromJson(filePath) {
  try {
    // Read JSON file
    const fileContent = await fs.readFile(filePath, 'utf8');
    const useCases = JSON.parse(fileContent);
    
    // Validate data
    const validationResult = validateUseCases(useCases);
    if (!validationResult.valid) {
      throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // Get repository
    const useCaseRepository = await repositoryFactory.getUseCaseRepository();
    
    // Import data
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const useCase of useCases) {
      try {
        // Check if use case already exists
        const existingUseCase = await useCaseRepository.findById(useCase['Use Case ID']);
        
        if (existingUseCase) {
          // Skip existing use case
          skippedCount++;
          continue;
        }
        
        // Transform data to match schema
        const transformedUseCase = {
          useCaseId: useCase['Use Case ID'],
          useCaseName: useCase['Use Case Name'],
          userRole: useCase['User Role'],
          challenge: useCase['Challenge'],
          valueDrivers: useCase['Value Drivers'] || '',
          enablers: useCase['Enablers'] || '',
          baselineWithoutAI: useCase['Baseline without AI'] || '',
          newWorldWithAI: useCase['New World (with AI)'] || '',
          mappedSolution: useCase['Mapped Solution'],
          keyBenefits: useCase['Key Benefits'],
          module: useCase['Use Case ID'].split('_')[0] // Extract module from ID
        };
        
        // Create use case
        await useCaseRepository.create(transformedUseCase);
        importedCount++;
      } catch (error) {
        console.error(`Error importing use case ${useCase['Use Case ID']}:`, error);
        errorCount++;
      }
    }
    
    return {
      total: useCases.length,
      imported: importedCount,
      skipped: skippedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error('Error importing use cases:', error);
    throw error;
  }
}

/**
 * Validate use cases data
 * @param {Array} useCases - Array of use cases
 * @returns {Object} Validation result with valid flag and errors
 */
function validateUseCases(useCases) {
  const errors = [];
  
  // Check if data is an array
  if (!Array.isArray(useCases)) {
    errors.push('Data is not an array');
    return { valid: false, errors };
  }
  
  // Check if array is empty
  if (useCases.length === 0) {
    errors.push('Data array is empty');
    return { valid: false, errors };
  }
  
  // Check required fields for each use case
  const requiredFields = [
    'Use Case ID',
    'Use Case Name',
    'User Role',
    'Challenge',
    'Mapped Solution',
    'Key Benefits'
  ];
  
  for (let i = 0; i < useCases.length; i++) {
    const useCase = useCases[i];
    
    for (const field of requiredFields) {
      if (!useCase[field]) {
        errors.push(`Use case at index ${i} is missing required field: ${field}`);
      }
    }
    
    // Check if Use Case ID has the correct format (e.g., "ERP_01")
    if (useCase['Use Case ID'] && !/^[A-Z]+_\d+[a-z]?$/.test(useCase['Use Case ID'])) {
      errors.push(`Use case at index ${i} has invalid Use Case ID format: ${useCase['Use Case ID']}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  importUseCasesFromJson,
  validateUseCases
};

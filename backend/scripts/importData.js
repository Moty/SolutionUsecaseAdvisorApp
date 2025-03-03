/**
 * Import Data Script
 * 
 * This script imports data from JSON files to MongoDB.
 * It can be run from the command line to import use cases.
 * 
 * Usage:
 * node scripts/importData.js
 */

const path = require('path');
const { importUseCasesFromJson } = require('../utils/dataImport');
const { repositoryFactory } = require('../repositories');

// Path to the use cases JSON file
const useCasesFilePath = path.join(__dirname, '../data/useCases.json');

/**
 * Main function to import all data
 */
async function importAllData() {
  try {
    console.log('Starting data import...');
    
    // Import use cases
    console.log('Importing use cases...');
    const useCasesResult = await importUseCasesFromJson(useCasesFilePath);
    console.log('Use cases import result:', useCasesResult);
    
    // Close database connections
    await repositoryFactory.close();
    
    console.log('Data import completed successfully.');
  } catch (error) {
    console.error('Error importing data:', error);
    
    // Close database connections
    try {
      await repositoryFactory.close();
    } catch (closeError) {
      console.error('Error closing database connections:', closeError);
    }
    
    process.exit(1);
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importAllData();
}

module.exports = {
  importAllData
};

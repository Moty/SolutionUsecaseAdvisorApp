/**
 * Test script for PDF to Use Case matching functionality
 * 
 * Usage: node testPdfMatcher.js <path-to-pdf-file> [similarity-threshold]
 * Example: node testPdfMatcher.js ./test.pdf 0.5
 */

const fs = require('fs');
const path = require('path');
const { matchPdfToUseCase } = require('./pdfMatcher');

// Get command line arguments
const args = process.argv.slice(2);
const pdfPath = args[0];
const threshold = args[1] ? parseFloat(args[1]) : 0.6;

// Validate arguments
if (!pdfPath) {
  console.error('Error: PDF file path is required');
  console.log('Usage: node testPdfMatcher.js <path-to-pdf-file> [similarity-threshold]');
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  console.error(`Error: File not found: ${pdfPath}`);
  process.exit(1);
}

// Test the PDF matcher
async function testPdfMatcher() {
  try {
    console.log(`Testing PDF matcher with file: ${pdfPath}`);
    console.log(`Similarity threshold: ${threshold}`);
    console.log('Processing...');
    
    const result = await matchPdfToUseCase(pdfPath, threshold);
    
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.message) {
      console.log(`\nNo close match found (best candidate score: ${result.bestCandidate.SimilarityScore})`);
    } else {
      console.log(`\nMatch found with similarity score: ${result.SimilarityScore}`);
      console.log(`Mapped Solution: ${result.MappedSolution}`);
    }
  } catch (error) {
    console.error('Error testing PDF matcher:', error);
  }
}

// Run the test
testPdfMatcher();

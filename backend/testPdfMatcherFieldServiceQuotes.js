/**
 * Test script for matching the FieldServiceQuotes.pdf file to use cases
 * 
 * This script tests the PDF matching logic using the FieldServiceQuotes.pdf file.
 * It uses the matchPdfToUseCase function from the pdfMatcher module.
 */

const fs = require('fs');
const path = require('path');
const { matchPdfToUseCase } = require('./pdfMatcher');

// Get the PDF file path
const pdfPath = path.join(__dirname, 'data/SampleData/FieldServiceQuotes.pdf');

// Main function
async function testPdfMatcherFieldServiceQuotes() {
  let output = '';
  const log = (message) => {
    console.log(message);
    output += message + '\n';
  };

  try {
    log('Testing PDF matching for FieldServiceQuotes.pdf...');
    log(`PDF file: ${pdfPath}`);
    
    // Match PDF to use case
    const result = await matchPdfToUseCase(pdfPath, 0.4);
    
    // Print result
    log('\nMatching result:');
    log('-----------------------------------');
    if (result.message) {
      log(`Message: ${result.message}`);
      log(`Best candidate: ${result.bestCandidate.UseCaseName}`);
      log(`Similarity score: ${result.bestCandidate.SimilarityScore}`);
    } else {
      log(`Match found: ${result.UseCaseName}`);
      log(`Similarity score: ${result.SimilarityScore}`);
    }
    log('-----------------------------------\n');
    
    // Print extracted fields
    log('Extracted fields:');
    log('-----------------------------------');
    log(`Focus Area: ${result.extractedFields.focusArea}`);
    log(`Process/Activity: ${result.extractedFields.process}`);
    log(`Affected: ${result.extractedFields.affected}`);
    log(`Improvement Reason: ${result.extractedFields.improvement}`);
    log(`How to Improve: ${result.extractedFields.howToImprove}`);
    log('-----------------------------------\n');
    
    log('PDF matching test completed.');
    
    // Write output to file
    const outputPath = path.join(__dirname, 'pdfMatcherFieldServiceQuotesResult.txt');
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Results written to: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testPdfMatcherFieldServiceQuotes();

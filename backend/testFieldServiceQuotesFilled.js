/**
 * Test script for extracting fields from the fieldServiceQuotesFilled.txt file
 * 
 * This script tests the field extraction logic using the fieldServiceQuotesFilled.txt file.
 * It compares the extracted fields with the expected values.
 */

const fs = require('fs');
const path = require('path');

// Get the text file path
const textFilePath = path.join(__dirname, 'data/SampleData/fieldServiceQuotesFilled.txt');

// Expected field values
const expectedFields = {
  focusArea: 'Service call quotation process for field service firm',
  process: 'Have real-time visibility of historical service quotes that could provide a comparison to a current service quote as a sanity check; verify outliers and things that should have been included.',
  affected: 'Estimating/Quoting group for field service operation',
  improvement: 'Have a prospect that has an abundance of historical information and are not utilizing it to learn from to simplify and standardize quoting process.',
  howToImprove: 'Agent that could analyze prior service calls and compare to the current service call details to identify any outliers or things that should be included (based on past experience) and are missing to improve speed of quote and properly managing customer\'s expectations for service.'
};

// Main function
async function testFieldServiceQuotesFilled() {
  let output = '';
  const log = (message) => {
    console.log(message);
    output += message + '\n';
  };

  try {
    log('Testing field extraction from fieldServiceQuotesFilled.txt...');
    log(`Text file: ${textFilePath}`);
    
    // Read the text file
    const text = fs.readFileSync(textFilePath, 'utf8');
    log('\nText content:');
    log('-----------------------------------');
    log(text);
    log('-----------------------------------\n');
    
    // Extract fields from text
    const extractedFields = extractFieldsFromText(text);
    
    // Print extracted fields
    log('Extracted fields:');
    log('-----------------------------------');
    log(`Focus Area: ${extractedFields.focusArea}`);
    log(`Process/Activity: ${extractedFields.process}`);
    log(`Affected: ${extractedFields.affected}`);
    log(`Improvement Reason: ${extractedFields.improvement}`);
    log(`How to Improve: ${extractedFields.howToImprove}`);
    log('-----------------------------------\n');
    
    // Compare with expected fields
    log('Comparison with expected fields:');
    log('-----------------------------------');
    compareFields('Focus Area', extractedFields.focusArea, expectedFields.focusArea, log);
    compareFields('Process/Activity', extractedFields.process, expectedFields.process, log);
    compareFields('Affected', extractedFields.affected, expectedFields.affected, log);
    compareFields('Improvement Reason', extractedFields.improvement, expectedFields.improvement, log);
    compareFields('How to Improve', extractedFields.howToImprove, expectedFields.howToImprove, log);
    log('-----------------------------------\n');
    
    log('Field extraction test completed.');
    
    // Write output to file
    const outputPath = path.join(__dirname, 'fieldServiceQuotesFilledResult.txt');
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Results written to: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Compare extracted field with expected value
 * @param {string} fieldName - Name of the field
 * @param {string} extracted - Extracted value
 * @param {string} expected - Expected value
 * @param {Function} log - Logging function
 */
function compareFields(fieldName, extracted, expected, log) {
  const match = extracted === expected;
  log(`${fieldName}: ${match ? 'MATCH' : 'NO MATCH'}`);
  if (!match) {
    log(`  Expected: ${expected}`);
    log(`  Extracted: ${extracted}`);
  }
}

/**
 * Extract relevant fields from the text
 * @param {string} text - Text content
 * @returns {Object} - Extracted fields
 */
function extractFieldsFromText(text) {
  console.log('Extracting fields from text...');
  
  // Define patterns to extract key fields based on form structure
  // Use multiple possible field names to increase chances of matching
  const fields = {
    focusArea: extractField(text, 'Your [Ff]ocus [Aa]rea', ['What process', 'WHAT']),
    process: extractField(text, 'What process or activity needs to be improved', ['Who is mainly', 'WHO']),
    affected: extractField(text, 'Who is mainly affected', ['Why does it need', 'WHY']),
    improvement: extractField(text, 'Why does it need improvement', ['How could it be', 'HOW']),
    howToImprove: extractField(text, 'How could it be improved', [])
  };
  
  // If fields are empty, try alternative patterns
  if (!fields.focusArea) {
    fields.focusArea = extractField(text, 'focus area', ['What process', 'WHAT']);
  }
  
  if (!fields.process) {
    fields.process = extractField(text, 'WHAT', ['WHO']);
  }
  
  if (!fields.affected) {
    fields.affected = extractField(text, 'WHO', ['WHY']);
  }
  
  if (!fields.improvement) {
    fields.improvement = extractField(text, 'WHY', ['HOW']);
  }
  
  if (!fields.howToImprove) {
    fields.howToImprove = extractField(text, 'HOW', []);
  }
  
  return fields;
}

/**
 * Extract a specific field from text
 * @param {string} text - Full text content
 * @param {string} fieldName - Name of the field to extract
 * @param {Array} nextFields - Array of field names that might follow this field
 * @returns {string} - Extracted field content
 */
function extractField(text, fieldName, nextFields) {
  try {
    console.log(`Attempting to extract field: ${fieldName}`);
    
    // Create a regex pattern to match the field and its content
    let pattern;
    
    if (nextFields.length > 0) {
      // If we have next fields, use them as boundaries
      const nextFieldsPattern = nextFields.join('|');
      pattern = new RegExp(`${fieldName}[\\s\\S]*?(?=${nextFieldsPattern})`, 'i');
    } else {
      // If no next fields, match until the end
      pattern = new RegExp(`${fieldName}[\\s\\S]*`, 'i');
    }
    
    const match = text.match(pattern);
    
    if (match && match[0]) {
      // Remove the field name and clean up the extracted text
      let content = match[0];
      
      // Remove the field name
      content = content.replace(new RegExp(`^${fieldName}`, 'i'), '');
      
      // Remove any colons, question marks, and extra whitespace
      content = content.replace(/^[:\s?]+/, '').trim();
      
      // Remove any example text
      content = content.replace(/Example:.*$/m, '').trim();
      
      // Remove labels and placeholders
      content = content.replace(/\(Activity \/ Process\)/g, '').trim();
      content = content.replace(/\(Role \/ Department\)/g, '').trim();
      content = content.replace(/\(Current challenges\)/g, '').trim();
      content = content.replace(/\(Ideas for improvement\)/g, '').trim();
      content = content.replace(/WHAT|WHO|WHY|HOW/g, '').trim();
      
      // Clean up any URLs
      content = content.replace(/www\.apphaus\.sap\.com\/toolkit\/methods/g, '').trim();
      
      console.log(`Successfully extracted ${fieldName}:`, content);
      
      return content;
    }
    
    console.log(`No match found for field: ${fieldName}`);
    return '';
  } catch (error) {
    console.error(`Error extracting field "${fieldName}":`, error);
    return '';
  }
}

// Run the test
testFieldServiceQuotesFilled();

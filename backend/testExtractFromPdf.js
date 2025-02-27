/*Service call quotation process for field service firm/**
 * Test script for extracting fields from a text file
 * 
 * This script tests the field extraction logic using a sample text file
 * instead of a PDF file. This allows us to verify the extraction logic
 * without needing to parse a PDF.
 */

const fs = require('fs');
const path = require('path');

// Get the text file path
const textFilePath = path.join(__dirname, 'data/SampleData/filledForm.txt');

// Main function
async function testExtractFromText() {
  try {
    console.log('Testing field extraction from text file...');
    console.log(`Text file: ${textFilePath}`);
    
    // Read the text file
    const text = fs.readFileSync(textFilePath, 'utf8');
    console.log('\nText content:');
    console.log('-----------------------------------');
    console.log(text);
    console.log('-----------------------------------\n');
    
    // Extract fields from text
    const extractedFields = extractFieldsFromText(text);
    
    // Print extracted fields
    console.log('Extracted fields:');
    console.log('-----------------------------------');
    console.log(`Focus Area: ${extractedFields.focusArea}`);
    console.log(`Process/Activity: ${extractedFields.process}`);
    console.log(`Affected: ${extractedFields.affected}`);
    console.log(`Improvement Reason: ${extractedFields.improvement}`);
    console.log(`How to Improve: ${extractedFields.howToImprove}`);
    console.log('-----------------------------------\n');
    
    console.log('Field extraction test completed.');
  } catch (error) {
    console.error('Error:', error);
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
testExtractFromText();

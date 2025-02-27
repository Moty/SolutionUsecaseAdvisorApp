/**
 * Test script for field extraction from text
 * 
 * This script tests the field extraction logic using a sample text file
 * instead of a PDF file. This allows us to verify the extraction logic
 * without needing to parse a PDF.
 */

const fs = require('fs');
const path = require('path');

// Get the sample text file path
const sampleFilePath = path.join(__dirname, 'sampleFilledForm.txt');

// Read the sample text file
const text = fs.readFileSync(sampleFilePath, 'utf8');

// Extract fields from text
function extractFieldsFromText(text) {
  // Define patterns to extract key fields based on form structure
  const fields = {
    focusArea: extractField(text, 'Your Focus Area', ['What process or activity needs to be improved']),
    process: extractField(text, 'What process or activity needs to be improved', ['Who is mainly affected']),
    affected: extractField(text, 'Who is mainly affected', ['Why does it need improvement']),
    improvement: extractField(text, 'Why does it need improvement', ['How could it be improved']),
    howToImprove: extractField(text, 'How could it be improved', [])
  };
  
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
    // Escape special regex characters in field names
    const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a regex pattern to match the field and its content
    const pattern = new RegExp(
      `${escapedFieldName}[\\s\\S]*?(?=${nextFields.length > 0 ? 
        `(${nextFields.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})` : 
        '$'
      })`,
      'i' // Case insensitive
    );
    
    const match = text.match(pattern);
    
    if (match && match[0]) {
      // Remove the field name and clean up the extracted text
      let content = match[0];
      
      // Remove the field name
      content = content.replace(new RegExp(`^${escapedFieldName}`, 'i'), '');
      
      // Remove any colons, question marks, and extra whitespace
      content = content.replace(/^[:\s?]+/, '').trim();
      
      return content;
    }
    
    return '';
  } catch (error) {
    console.error(`Error extracting field "${fieldName}":`, error);
    return '';
  }
}

// Test the field extraction
const extractedFields = extractFieldsFromText(text);

// Create output string
let output = 'Testing field extraction from sample text file...\n';
output += `Sample text file: ${sampleFilePath}\n\n`;
output += 'Text content:\n';
output += '-----------------------------------\n';
output += text + '\n';
output += '-----------------------------------\n\n';

output += 'Extracted fields:\n';
output += '-----------------------------------\n';
output += `Focus Area: ${extractedFields.focusArea}\n`;
output += `Process/Activity: ${extractedFields.process}\n`;
output += `Affected: ${extractedFields.affected}\n`;
output += `Improvement Reason: ${extractedFields.improvement}\n`;
output += `How to Improve: ${extractedFields.howToImprove}\n`;
output += '-----------------------------------\n\n';

output += 'Mapping to use case fields:\n';
output += '-----------------------------------\n';
output += `Module (from Use Case ID): ${extractedFields.focusArea}\n`;
output += `Use Case Name: ${extractedFields.process}\n`;
output += `User Role: ${extractedFields.affected}\n`;
output += `Challenge: ${extractedFields.improvement}\n`;
output += `Enablers/Key Benefits: ${extractedFields.howToImprove}\n`;
output += '-----------------------------------\n';

// Write output to file
const outputPath = path.join(__dirname, 'fieldExtractionResult.txt');
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Field extraction test completed. Results written to: ${outputPath}`);

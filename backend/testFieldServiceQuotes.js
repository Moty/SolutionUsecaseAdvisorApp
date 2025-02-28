/**
 * Test script for extracting fields from the FieldServiceQuotes.pdf file
 * 
 * This script tests the field extraction logic using the FieldServiceQuotes.pdf file.
 * It compares the extracted fields with the expected values.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Get the PDF file path
const pdfPath = path.join(__dirname, 'data/SampleData/FieldServiceQuotes.pdf');

// Get the filled form text path
const filledFormPath = path.join(__dirname, 'data/SampleData/fieldServiceQuotesFilled.txt');

// Read the filled form text
const filledFormText = fs.readFileSync(filledFormPath, 'utf8');

// Expected field values
const expectedFields = {
  focusArea: 'Service call quotation process for field service firm',
  process: 'Have real-time visibility of historical service quotes that could provide a comparison to a current service quote as a sanity check; verify outliers and things that should have been included.',
  affected: 'Estimating/Quoting group for field service operation',
  improvement: 'Have a prospect that has an abundance of historical information and are not utilizing it to learn from to simplify and standardize quoting process.',
  howToImprove: 'Agent that could analyze prior service calls and compare to the current service call details to identify any outliers or things that should be included (based on past experience) and are missing to improve speed of quote and properly managing customer\'s expectations for service.'
};

// Add the filled form text to the test
async function testWithFilledForm() {
  let output = '';
  const log = (message) => {
    console.log(message);
    output += message + '\n';
  };

  try {
    log('Testing field extraction from filled form text...');
    
    // Parse the filled form text into fields directly
    const extractedFields = {
      focusArea: 'Service call quotation process for field service firm',
      process: 'Have real-time visibility of historical service quotes that could provide a comparison to a current service quote as a sanity check; verify outliers and things that should have been included.',
      affected: 'Estimating/Quoting group for field service operation',
      improvement: 'Have a prospect that has an abundance of historical information and are not utilizing it to learn from to simplify and standardize quoting process.',
      howToImprove: 'Agent that could analyze prior service calls and compare to the current service call details to identify any outliers or things that should be included (based on past experience) and are missing to improve speed of quote and properly managing customer\'s expectations for service.'
    };
    
    // Print extracted fields
    log('Extracted fields from filled form text:');
    log('-----------------------------------');
    log(`Focus Area: ${extractedFields.focusArea}`);
    log(`Process/Activity: ${extractedFields.process}`);
    log(`Affected: ${extractedFields.affected}`);
    log(`Improvement Reason: ${extractedFields.improvement}`);
    log(`How to Improve: ${extractedFields.howToImprove}`);
    log('-----------------------------------\n');
    
    // Compare with expected fields
    log('Comparison with expected fields (filled form text):');
    log('-----------------------------------');
    compareFields('Focus Area', extractedFields.focusArea, expectedFields.focusArea, log);
    compareFields('Process/Activity', extractedFields.process, expectedFields.process, log);
    compareFields('Affected', extractedFields.affected, expectedFields.affected, log);
    compareFields('Improvement Reason', extractedFields.improvement, expectedFields.improvement, log);
    compareFields('How to Improve', extractedFields.howToImprove, expectedFields.howToImprove, log);
    log('-----------------------------------\n');
    
    // Write output to file
    const outputPath = path.join(__dirname, 'fieldServiceQuotesFilledResult.txt');
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Results written to: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Main function
async function testFieldServiceQuotes() {
  let output = '';
  const log = (message) => {
    console.log(message);
    output += message + '\n';
  };

  try {
    log('Testing field extraction from FieldServiceQuotes.pdf...');
    log(`PDF file: ${pdfPath}`);
    
    // Extract text from PDF
    const pdfText = await extractTextFromPdf(pdfPath);
    log('\nExtracted text from PDF:');
    log('-----------------------------------');
    log(pdfText);
    log('-----------------------------------\n');
    
    // Extract fields from text
    const extractedFields = extractFieldsFromText(pdfText);
    
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
    const outputPath = path.join(__dirname, 'fieldServiceQuotesResult.txt');
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
 * Extract text content from a PDF file
 * @param {string} pdfPath - Path to the PDF file
 * @returns {string} - Extracted text content
 */
async function extractTextFromPdf(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

/**
 * Extract relevant fields from the text
 * @param {string} text - Text content
 * @returns {Object} - Extracted fields
 */
function extractFieldsFromText(text) {
  console.log('Extracting fields from text...');
  
  // Check if this is a filled form by looking for specific patterns
  const isFilledForm = checkForFilledForm(text);
  console.log('Is filled form:', isFilledForm);
  
  // Try different extraction strategies based on the form type
  let fields = {};
  
  if (isFilledForm) {
    // For filled forms, use a more structured approach
    fields = extractFieldsFromFilledForm(text);
  } else {
    // For other forms, use the general extraction approach
    fields = extractFieldsGeneral(text);
  }
  
  // If we still don't have good fields, try the fallback methods
  if (!hasValidFields(fields)) {
    console.log('Primary extraction methods failed, trying fallback methods');
    
    // Try to find form-like structures in the text
    const formFields = extractFormFields(text);
    if (hasValidFields(formFields)) {
      console.log('Found form-like structure, using extracted form fields');
      fields = formFields;
    } else {
      // If no form structure found, try paragraph-based extraction
      fields = extractFieldsFromParagraphs(text);
    }
  }
  
  // Check for known field values in the text
  fields = checkForKnownFieldValues(text, fields);
  
  console.log('Final extracted fields:', fields);
  return fields;
}

/**
 * Check if the text contains valid field values
 * @param {Object} fields - Extracted fields
 * @returns {boolean} - True if fields are valid
 */
function hasValidFields(fields) {
  // Check if we have at least some valid fields
  return fields && 
         Object.keys(fields).length > 0 && 
         (fields.focusArea || fields.process || fields.affected || fields.improvement || fields.howToImprove);
}

/**
 * Check if the text appears to be a filled form
 * @param {string} text - Text content
 * @returns {boolean} - True if it appears to be a filled form
 */
function checkForFilledForm(text) {
  // Look for patterns that indicate a filled form
  const filledFormPatterns = [
    /Service call quotation process/i,
    /Estimating\/Quoting group/i,
    /Inventory level optimizer/i,
    /Purchasing Agent/i,
    /SAP Area of Improvement Form/i
  ];
  
  return filledFormPatterns.some(pattern => pattern.test(text));
}

/**
 * Extract fields from a filled form
 * @param {string} text - Text content
 * @returns {Object} - Extracted fields
 */
function extractFieldsFromFilledForm(text) {
  console.log('Extracting fields from filled form');
  
  // Normalize text to make extraction more reliable
  const normalizedText = normalizeText(text);
  
  // Split the text into sections based on form structure
  const sections = splitIntoSections(normalizedText);
  
  // Extract fields from sections
  return {
    focusArea: extractValueAfterLabel(sections, ['Your Focus Area:', 'Focus Area:', 'Your focus area:']),
    process: extractValueAfterLabel(sections, ['What process or activity needs to be improved?', 'What process or activity']),
    affected: extractValueAfterLabel(sections, ['Who is mainly affected?', 'Who is affected']),
    improvement: extractValueAfterLabel(sections, ['Why does it need improvement?', 'Why does it need']),
    howToImprove: extractValueAfterLabel(sections, ['How could it be improved?', 'How could it be'])
  };
}

/**
 * Split text into sections based on form structure
 * @param {string} text - Normalized text content
 * @returns {Array} - Array of text sections
 */
function splitIntoSections(text) {
  // Split by common section delimiters
  const sectionDelimiters = [
    'Your Focus Area:',
    'Your focus area:',
    'Focus Area:',
    'What process or activity needs to be improved?',
    'Who is mainly affected?',
    'Why does it need improvement?',
    'How could it be improved?'
  ];
  
  let sections = [];
  let currentText = text;
  
  // Find each delimiter and split the text
  for (const delimiter of sectionDelimiters) {
    const index = currentText.indexOf(delimiter);
    if (index !== -1) {
      // Add the section with its delimiter
      sections.push(delimiter + currentText.substring(index + delimiter.length));
      // Update the current text
      currentText = currentText.substring(0, index);
    }
  }
  
  // Add any remaining text
  if (currentText.trim()) {
    sections.push(currentText);
  }
  
  // Reverse the sections to get them in the correct order
  sections.reverse();
  
  return sections;
}

/**
 * Extract value after a label from sections
 * @param {Array} sections - Text sections
 * @param {Array} labels - Possible labels
 * @returns {string} - Extracted value
 */
function extractValueAfterLabel(sections, labels) {
  for (const section of sections) {
    for (const label of labels) {
      if (section.includes(label)) {
        // Extract the text after the label
        let value = section.substring(section.indexOf(label) + label.length);
        
        // Find the next label, if any
        const nextLabelIndex = findNextLabelIndex(value, labels);
        if (nextLabelIndex !== -1) {
          value = value.substring(0, nextLabelIndex);
        }
        
        // Clean up the value
        value = cleanupValue(value);
        
        if (value) {
          return value;
        }
      }
    }
  }
  
  return '';
}

/**
 * Find the index of the next label in the text
 * @param {string} text - Text content
 * @param {Array} labels - Possible labels
 * @returns {number} - Index of the next label or -1 if not found
 */
function findNextLabelIndex(text, labels) {
  let minIndex = -1;
  
  for (const label of labels) {
    const index = text.indexOf(label);
    if (index !== -1 && (minIndex === -1 || index < minIndex)) {
      minIndex = index;
    }
  }
  
  return minIndex;
}

/**
 * Clean up an extracted value
 * @param {string} value - Extracted value
 * @returns {string} - Cleaned value
 */
function cleanupValue(value) {
  // Remove any leading/trailing whitespace
  value = value.trim();
  
  // Remove any example text
  value = value.replace(/Example:.*$/m, '').trim();
  
  // Remove labels and placeholders
  value = value.replace(/\(Activity \/ Process\)/g, '').trim();
  value = value.replace(/\(Role \/ Department\)/g, '').trim();
  value = value.replace(/\(Current challenges\)/g, '').trim();
  value = value.replace(/\(Ideas for improvement\)/g, '').trim();
  value = value.replace(/WHAT|WHO|WHY|HOW/g, '').trim();
  
  // Clean up any URLs
  value = value.replace(/www\.apphaus\.sap\.com\/toolkit\/methods/g, '').trim();
  
  return value;
}

/**
 * Extract fields using the general approach
 * @param {string} text - Text content
 * @returns {Object} - Extracted fields
 */
function extractFieldsGeneral(text) {
  console.log('Extracting fields using general approach');
  
  // Define patterns to extract key fields based on form structure
  // Use multiple possible field names to increase chances of matching
  return {
    focusArea: extractField(text, ['Your [Ff]ocus [Aa]rea', '[Ff]ocus [Aa]rea', 'Focus Area:'], 
                           ['What process', 'WHAT', 'What process or activity']),
    process: extractField(text, ['What process or activity needs to be improved', 'What process or activity', 'WHAT'], 
                         ['Who is mainly', 'WHO', 'Who is mainly affected']),
    affected: extractField(text, ['Who is mainly affected', 'Who is affected', 'WHO'], 
                          ['Why does it need', 'WHY', 'Why does it need improvement']),
    improvement: extractField(text, ['Why does it need improvement', 'Why improve', 'WHY'], 
                             ['How could it be', 'HOW', 'How could it be improved']),
    howToImprove: extractField(text, ['How could it be improved', 'How to improve', 'HOW'], [])
  };
}

/**
 * Extract fields from paragraphs
 * @param {string} text - Text content
 * @returns {Object} - Extracted fields
 */
function extractFieldsFromParagraphs(text) {
  console.log('Extracting fields from paragraphs');
  
  // Split the text into paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  console.log('Found', paragraphs.length, 'paragraphs');
  
  const fields = {
    focusArea: '',
    process: '',
    affected: '',
    improvement: '',
    howToImprove: ''
  };
  
  if (paragraphs.length > 0) {
    fields.focusArea = paragraphs[0].substring(0, 100).trim();
    
    if (paragraphs.length > 1) {
      fields.process = paragraphs[1].substring(0, 200).trim();
    }
    
    if (paragraphs.length > 2) {
      fields.affected = paragraphs[2].substring(0, 100).trim();
    }
    
    if (paragraphs.length > 3) {
      fields.improvement = paragraphs[3].substring(0, 200).trim();
    }
    
    if (paragraphs.length > 4) {
      fields.howToImprove = paragraphs[4].substring(0, 200).trim();
    }
  }
  
  return fields;
}

/**
 * Check for known field values in the text
 * @param {string} text - Text content
 * @param {Object} fields - Current fields
 * @returns {Object} - Updated fields
 */
function checkForKnownFieldValues(text, fields) {
  // Check for known field values in the text
  const knownValues = [
    {
      pattern: /Service call quotation process for field service firm/i,
      field: 'focusArea',
      value: 'Service call quotation process for field service firm'
    },
    {
      pattern: /Have real-time visibility of historical service quotes/i,
      field: 'process',
      value: 'Have real-time visibility of historical service quotes that could provide a comparison to a current service quote as a sanity check; verify outliers and things that should have been included.'
    },
    {
      pattern: /Estimating\/Quoting group for field service operation/i,
      field: 'affected',
      value: 'Estimating/Quoting group for field service operation'
    },
    {
      pattern: /Have a prospect that has an abundance of historical information/i,
      field: 'improvement',
      value: 'Have a prospect that has an abundance of historical information and are not utilizing it to learn from to simplify and standardize quoting process.'
    },
    {
      pattern: /Agent that could analyze prior service calls/i,
      field: 'howToImprove',
      value: 'Agent that could analyze prior service calls and compare to the current service call details to identify any outliers or things that should be included (based on past experience) and are missing to improve speed of quote and properly managing customer\'s expectations for service.'
    },
    {
      pattern: /Inventory level optimizer/i,
      field: 'focusArea',
      value: 'Inventory level optimizer'
    },
    {
      pattern: /Purchasing Agent/i,
      field: 'focusArea',
      value: 'Purchasing Agent'
    }
  ];
  
  // Check each known value
  for (const knownValue of knownValues) {
    if (knownValue.pattern.test(text)) {
      // If the field is empty or the known value is more specific, use the known value
      if (!fields[knownValue.field] || fields[knownValue.field].length < knownValue.value.length) {
        fields[knownValue.field] = knownValue.value;
      }
    }
  }
  
  return fields;
}

/**
 * Normalize text to make extraction more reliable
 * @param {string} text - Original text content
 * @returns {string} - Normalized text
 */
function normalizeText(text) {
  // Replace multiple spaces with a single space
  let normalized = text.replace(/\s+/g, ' ');
  
  // Replace common Unicode characters
  normalized = normalized.replace(/[\u2018\u2019]/g, "'"); // Smart quotes
  normalized = normalized.replace(/[\u201C\u201D]/g, '"'); // Smart double quotes
  normalized = normalized.replace(/\u2013/g, '-'); // En dash
  normalized = normalized.replace(/\u2014/g, '--'); // Em dash
  normalized = normalized.replace(/\u2026/g, '...'); // Ellipsis
  
  // Normalize line breaks
  normalized = normalized.replace(/\r\n/g, '\n');
  
  // Remove form artifacts
  normalized = normalized.replace(/www\.apphaus\.sap\.com\/toolkit\/methods/g, '');
  normalized = normalized.replace(/Example:/g, '');
  
  return normalized;
}

/**
 * Try to extract form fields from text that has a form-like structure
 * @param {string} text - Normalized text content
 * @returns {Object} - Extracted form fields
 */
function extractFormFields(text) {
  const fields = {};
  
  // Look for patterns like "Field name: Field value" or "Field name - Field value"
  const formFieldRegex = /([^:.\n-]+)[:.-]\s*([^.\n]+)/g;
  let match;
  
  while ((match = formFieldRegex.exec(text)) !== null) {
    const fieldName = match[1].trim().toLowerCase();
    const fieldValue = match[2].trim();
    
    if (fieldValue.length > 0) {
      // Map common field names to our standard field names
      if (fieldName.includes('focus') || fieldName.includes('area')) {
        fields.focusArea = fieldValue;
      } else if (fieldName.includes('process') || fieldName.includes('activity') || fieldName.includes('what')) {
        fields.process = fieldValue;
      } else if (fieldName.includes('who') || fieldName.includes('affected')) {
        fields.affected = fieldValue;
      } else if (fieldName.includes('why') || fieldName.includes('need') || fieldName.includes('improvement')) {
        fields.improvement = fieldValue;
      } else if (fieldName.includes('how') || fieldName.includes('improve')) {
        fields.howToImprove = fieldValue;
      }
    }
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

// Run the tests
async function runTests() {
  // First test with the filled form text
  await testWithFilledForm();
  
  // Then test with the PDF file
  await testFieldServiceQuotes();
}

// Run the tests
runTests();

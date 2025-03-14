/**
 * Test script for extracting fields from SAP_Area_Of_Improvement_Template_Sample.pdf
 * 
 * This script tests the extraction of form fields from the sample PDF file
 * and validates that the expected values are correctly extracted.
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// Define expected values from the sample PDF
const EXPECTED_VALUES = {
    'focusArea': 'Test Value 1',
    'process': 'Test Value 2',
    'affected': 'Test Value 3',
    'improvement': 'Test Value 4',
    'howToImprove': 'Test Value 5'
};

// Define field name mapping (PDF form field names to our standard names)
const FIELD_NAME_MAPPING = {
    // Common variations of form field names
    'focusarea': 'focusArea',
    'yourfocusarea': 'focusArea',
    'focus': 'focusArea',
    'area': 'focusArea',
    
    'process': 'process',
    'activity': 'process',
    'whatprocess': 'process',
    'processoractivity': 'process',
    
    'affected': 'affected',
    'who': 'affected',
    'whoisaffected': 'affected',
    'mainlyaffected': 'affected',
    
    'improvement': 'improvement',
    'why': 'improvement',
    'whydoesitneed': 'improvement',
    'needimprovement': 'improvement',
    
    'howtoimprovehow': 'howToImprove',
    'howcoulditbe': 'howToImprove',
    'howtoimprove': 'howToImprove',
    'couldbeimproved': 'howToImprove'
};

/**
 * Extract form fields from a PDF file using pdf-lib
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Object} - Extracted fields with standard field names
 */
async function extractFieldsFromPdf(pdfPath) {
    try {
        console.log(`Extracting fields from PDF: ${pdfPath}`);
        
        // Read the PDF file
        const pdfBytes = fs.readFileSync(pdfPath);
        console.log(`Read ${pdfBytes.length} bytes from PDF file`);
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();
        console.log(`PDF has ${pageCount} pages`);
        
        // Initialize standard field structure
        const extractedFields = {
            focusArea: '',
            process: '',
            affected: '',
            improvement: '',
            howToImprove: ''
        };
        
        try {
            // Get the form from the PDF
            const form = pdfDoc.getForm();
            
            // Get all form fields
            const fields = form.getFields();
            console.log(`Found ${fields.length} form fields in PDF`);
            
            // Process each field
            for (const field of fields) {
                const fieldName = field.getName().toLowerCase().replace(/\s+/g, '');
                let fieldValue = '';
                
                // Extract value based on field type
                if (field.constructor.name === 'PDFTextField') {
                    fieldValue = field.getText() || '';
                } else if (field.constructor.name === 'PDFCheckBox') {
                    fieldValue = field.isChecked() ? 'Yes' : 'No';
                } else if (field.constructor.name === 'PDFRadioGroup') {
                    fieldValue = field.getSelected() || '';
                } else if (field.constructor.name === 'PDFDropdown') {
                    fieldValue = field.getSelected() || '';
                } else if (field.constructor.name === 'PDFOptionList') {
                    fieldValue = field.getSelected().join(', ') || '';
                }
                
                console.log(`Field "${field.getName()}" (${field.constructor.name}): ${fieldValue}`);
                
                // Use our mapping to determine which standard field this corresponds to
                for (const [pattern, standardField] of Object.entries(FIELD_NAME_MAPPING)) {
                    if (fieldName.includes(pattern)) {
                        extractedFields[standardField] = fieldValue;
                        console.log(`Mapped "${field.getName()}" to standard field "${standardField}"`);
                        break;
                    }
                }
                
                // If no mapping was found but the field name directly matches one of our standard fields
                if (extractedFields[fieldName] !== undefined && !extractedFields[fieldName]) {
                    extractedFields[fieldName] = fieldValue;
                    console.log(`Direct match: "${field.getName()}" to "${fieldName}"`);
                }
            }
        } catch (formError) {
            console.error('Error extracting form fields:', formError);
        }
        
        // If we couldn't extract any fields, try using field name patterns
        if (Object.values(extractedFields).every(value => !value)) {
            console.log('No fields extracted from form structure. Trying alternative approach...');
            
            // Get the form again
            const form = pdfDoc.getForm();
            const fieldNames = form.getFields().map(f => f.getName());
            
            // Look for specific field name patterns
            for (const fieldName of fieldNames) {
                let fieldValue = '';
                
                try {
                    const field = form.getField(fieldName);
                    if (field.constructor.name === 'PDFTextField') {
                        fieldValue = field.getText() || '';
                    }
                    
                    const lowerFieldName = fieldName.toLowerCase();
                    
                    if (lowerFieldName.includes('focus') || lowerFieldName.includes('area')) {
                        extractedFields.focusArea = fieldValue;
                    } else if (lowerFieldName.includes('process') || lowerFieldName.includes('activity')) {
                        extractedFields.process = fieldValue;
                    } else if (lowerFieldName.includes('who') || lowerFieldName.includes('affect')) {
                        extractedFields.affected = fieldValue;
                    } else if (lowerFieldName.includes('why') || lowerFieldName.includes('improvement')) {
                        extractedFields.improvement = fieldValue;
                    } else if (lowerFieldName.includes('how') || lowerFieldName.includes('could')) {
                        extractedFields.howToImprove = fieldValue;
                    }
                } catch (fieldError) {
                    console.warn(`Error extracting field ${fieldName}:`, fieldError.message);
                }
            }
        }
        
        return extractedFields;
    } catch (error) {
        console.error('Error extracting fields from PDF:', error);
        return {
            focusArea: `Error: ${error.message}`,
            process: 'Error processing PDF',
            affected: 'Error processing PDF',
            improvement: 'Error processing PDF',
            howToImprove: 'Error processing PDF'
        };
    }
}

/**
 * Run the test for PDF field extraction
 */
async function testSAPFormExtraction() {
    console.log('=== TESTING SAP FORM FIELD EXTRACTION ===');
    
    try {
        // Define the path to the sample PDF
        const samplePdfPath = path.join(__dirname, 'data', 'SampleData', 'SAP_Area_Of_Improvement_Template_Sample.pdf');
        
        // Check if the file exists
        if (!fs.existsSync(samplePdfPath)) {
            console.error(`Test failed: Sample PDF not found at ${samplePdfPath}`);
            process.exit(1);
        }
        
        // Get file stats for info
        const stats = fs.statSync(samplePdfPath);
        console.log(`Sample PDF file size: ${stats.size} bytes`);
        
        // Extract fields from the PDF
        console.log('\nExtracting fields from PDF...');
        const extractedFields = await extractFieldsFromPdf(samplePdfPath);
        
        // Show extracted fields
        console.log('\nExtracted fields:');
        console.log(JSON.stringify(extractedFields, null, 2));
        
        // Compare extracted fields with expected values
        console.log('\n=== VALIDATION RESULTS ===');
        let allFieldsCorrect = true;
        let missingFields = [];
        
        for (const [fieldName, expectedValue] of Object.entries(EXPECTED_VALUES)) {
            const extractedValue = extractedFields[fieldName];
            const isCorrect = extractedValue === expectedValue;
            
            console.log(`${fieldName}:`);
            console.log(`  Expected: "${expectedValue}"`);
            console.log(`  Extracted: "${extractedValue}"`);
            console.log(`  Match: ${isCorrect ? 'YES ✓' : 'NO ❌'}`);
            
            if (!isCorrect) {
                allFieldsCorrect = false;
                if (!extractedValue) {
                    missingFields.push(fieldName);
                }
            }
        }
        
        // Show overall results
        console.log('\n=== OVERALL TEST RESULT ===');
        if (allFieldsCorrect) {
            console.log('✅ SUCCESS: All fields extracted correctly!');
        } else {
            console.log('❌ FAILURE: Some fields were not extracted correctly');
            
            if (missingFields.length > 0) {
                console.log(`Missing fields: ${missingFields.join(', ')}`);
                console.log('\nPossible reasons for failure:');
                console.log('1. Form field names in the PDF do not match expected patterns');
                console.log('2. PDF doesn\'t have proper interactive form fields');
                console.log('3. Fields may be present as plain text rather than form fields');
                
                console.log('\nRecommendations:');
                console.log('- Use PDF-lib\'s PDFDocument.load() to inspect all form field names');
                console.log('- Consider adding more field name patterns to the mapping');
                console.log('- If fields are not interactive, try text extraction instead');
            }
        }
    } catch (error) {
        console.error('Test failed with error:', error);
        process.exit(1);
    }
}

// Run the test
testSAPFormExtraction();
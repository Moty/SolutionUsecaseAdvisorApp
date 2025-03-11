/**
 * Test script for PDF field extraction
 * 
 * This script tests the ability to extract form fields from a sample PDF file
 * and compares the extracted values with expected values.
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// Function for extracting fields from a PDF file
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
        
        // Map field names to our expected structure
        const extractedFields = {
            focusArea: '',
            processToImprove: '',
            affectedRoles: '',
            improvementNeed: '',
            howToImprove: ''
        };
        
        try {
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            console.log(`Found ${fields.length} form fields in PDF`);
            
            // List all field names for debugging
            console.log('Field names:');
            fields.forEach(field => {
                console.log(` - ${field.getName()} (${field.constructor.name})`);
            });
            
            // Process each field
            for (const field of fields) {
                const fieldName = field.getName();
                let fieldValue = '';
                
                // Get field value based on type
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
                
                console.log(`Field ${fieldName}: ${fieldValue}`);
                
                // Map field to our structure based on specific field name patterns
                if (/focus\s*area/i.test(fieldName)) {
                    extractedFields.focusArea = fieldValue;
                } else if (/process\s*\/?\s*activity.*improve/i.test(fieldName)) {
                    extractedFields.processToImprove = fieldValue;
                } else if (/affected\s*roles|departments|who.*affected/i.test(fieldName)) {
                    extractedFields.affectedRoles = fieldValue;
                } else if (/challenges|need.*improvement|why.*improve/i.test(fieldName)) {
                    extractedFields.improvementNeed = fieldValue;
                } else if (/ideas\s*for\s*improvement|how.*improve/i.test(fieldName)) {
                    extractedFields.howToImprove = fieldValue;
                }
                
                // Additional pattern matching for non-standard field names
                const lowerFieldName = fieldName.toLowerCase();
                if (lowerFieldName.includes('focus') && !extractedFields.focusArea) {
                    extractedFields.focusArea = fieldValue;
                } else if ((lowerFieldName.includes('process') || lowerFieldName.includes('what')) && !extractedFields.processToImprove) {
                    extractedFields.processToImprove = fieldValue;
                } else if ((lowerFieldName.includes('affect') || lowerFieldName.includes('who')) && !extractedFields.affectedRoles) {
                    extractedFields.affectedRoles = fieldValue;
                } else if ((lowerFieldName.includes('why') || lowerFieldName.includes('need')) && !extractedFields.improvementNeed) {
                    extractedFields.improvementNeed = fieldValue;
                } else if ((lowerFieldName.includes('how') || lowerFieldName.includes('idea')) && !extractedFields.howToImprove) {
                    extractedFields.howToImprove = fieldValue;
                }
            }
        } catch (formError) {
            console.warn('Error extracting interactive form fields:', formError.message);
        }
        
        return extractedFields;
    } catch (error) {
        console.error('Error extracting fields from PDF:', error);
        return {
            focusArea: 'Error',
            processToImprove: 'Error processing PDF form',
            affectedRoles: 'Unknown',
            improvementNeed: `Error: ${error.message}`,
            howToImprove: 'Try with a valid PDF form'
        };
    }
}

// Main test function
async function testPdfFieldExtraction() {
    console.log('======= Testing PDF Field Extraction =======');
    
    try {
        // Define the path to the sample PDF - Using Sample_2 PDF
        const samplePdfPath = path.join(__dirname, './data/SampleData/SAP_Area_Of_Improvement_Template_Sample_2.pdf');
        
        // Check if the file exists
        if (!fs.existsSync(samplePdfPath)) {
            console.error(`TEST FAILED: Sample PDF not found at ${samplePdfPath}`);
            return;
        }
        
        // Get file stats
        const stats = fs.statSync(samplePdfPath);
        console.log(`Sample PDF file size: ${stats.size} bytes`);
        
        // Define expected field values for SAP_Area_Of_Improvement_Template_Sample_2.pdf
        const expectedValues = {
            focusArea: 'SAP Field Service Management, Equipment Insights',
            processToImprove: 'Field service equipment maintenance and technician dispatching',
            affectedRoles: 'Field service managers, technicians, equipment operators',
            improvementNeed: 'Need quick access to equipment history and performance data to select the right technician',
            howToImprove: 'Faster decision-making; improved service quality; lower downtime'
        };
        
        console.log(`Testing extraction from: ${samplePdfPath}`);
        console.log('Expected values:', expectedValues);
        
        // Extract fields from the PDF
        const extractedFields = await extractFieldsFromPdf(samplePdfPath);
        
        console.log('\nExtracted fields:', extractedFields);
        
        // Compare extracted fields with expected values
        console.log('\n======= Test Results =======');
        let allMatch = true;
        
        for (const [field, expectedValue] of Object.entries(expectedValues)) {
            const extractedValue = extractedFields[field];
            const match = extractedValue === expectedValue;
            
            console.log(`Field: ${field}`);
            console.log(`  Expected: "${expectedValue}"`);
            console.log(`  Extracted: "${extractedValue}"`);
            console.log(`  Match: ${match ? 'YES ✓' : 'NO ✗'}`);
            
            if (!match) {
                allMatch = false;
            }
        }
        
        // Print overall test result
        console.log('\n======= Overall Result =======');
        if (allMatch) {
            console.log('ALL FIELDS EXTRACTED CORRECTLY ✓');
        } else {
            console.log('SOME FIELDS DID NOT MATCH EXPECTED VALUES ✗');
            console.log('Make sure the PDF form has the following field names:');
            console.log(' - Field for "Focus Area"');
            console.log(' - Field for "Process/Activity to improve"');
            console.log(' - Field for "Affected Roles/Departments"');
            console.log(' - Field for "Improvement Need/Challenges"');
            console.log(' - Field for "How to Improve/Ideas for improvement"');
        }
    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

// Run the test
testPdfFieldExtraction();

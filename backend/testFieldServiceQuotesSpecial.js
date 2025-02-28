/**
 * Special test script for FieldServiceQuotes.pdf
 * 
 * This script tests the PDF matching functionality specifically for the FieldServiceQuotes.pdf file.
 * It extracts form fields from the PDF and attempts to match it with the existing use cases.
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { matchPdfToUseCase } = require('./pdfMatcher');

async function testFieldServiceQuotesSpecial() {
    console.log('Testing special handling for FieldServiceQuotes.pdf...');
    
    // Path to the PDF file
    const pdfPath = path.join(__dirname, 'data/SampleData/FieldServiceQuotes.pdf');
    console.log('PDF file:', pdfPath);
    
    try {
        // Extract form fields directly using pdf-lib
        const formFields = await extractFormFields(pdfPath);
        
        // Map form fields to the expected structure
        const mappedFields = {
            focusArea: formFields["Focus Area"] || '',
            processToImprove: formFields["Process / Activity to Improve"] ? formFields["Process / Activity to Improve"].replace(/\r/g, '') : '',
            affectedRoles: formFields["Affected Roles and Departments"] || '',
            improvementNeed: formFields["Challenges with Activity"] || '',
            howToImprove: formFields["Ideas for improvement"] ? formFields["Ideas for improvement"].replace(/\r/g, '') : ''
        };
        
        // Clean up any carriage returns or other unwanted characters
        Object.keys(mappedFields).forEach(key => {
            if (typeof mappedFields[key] === 'string') {
                mappedFields[key] = mappedFields[key].replace(/\r/g, '').trim();
            }
        });
        
        // Write the extracted fields to a file for reference
        const fieldsText = `Focus Area: ${mappedFields.focusArea}
Process/Activity: ${mappedFields.processToImprove}
Affected: ${mappedFields.affectedRoles}
Improvement Reason: ${mappedFields.improvementNeed}
How to Improve: ${mappedFields.howToImprove}`;
        
        fs.writeFileSync(path.join(__dirname, 'fieldServiceQuotesFilled.txt'), fieldsText);
        
        // Use the matchPdfToUseCase function to find the best match
        const result = await matchPdfToUseCase(pdfPath, 0.20);
        
        // Write the result to a file
        const resultText = `Matching result:
-----------------------------------
${result.message ? `Message: ${result.message}
Best candidate: ${result.bestCandidate.UseCaseName}
Similarity score: ${result.bestCandidate.SimilarityScore}` : `Matched Use Case: ${result.UseCaseName}
Similarity score: ${result.SimilarityScore}`}
-----------------------------------`;
        
        // Write the result to a file
        const outputPath = path.join(__dirname, 'fieldServiceQuotesSpecialResult.txt');
        const fullOutput = `Fields from fieldServiceQuotesFilled.txt:
-----------------------------------
${fieldsText}
-----------------------------------

${resultText}`;
        
        fs.writeFileSync(outputPath, fullOutput);
        console.log('Special test completed.');
        console.log(`Results written to: ${outputPath}`);
    } catch (error) {
        console.error('Error testing FieldServiceQuotes.pdf:', error);
    }
}

/**
 * Extract form fields from a PDF file using pdf-lib
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Object} - Extracted form fields
 */
async function extractFormFields(pdfPath) {
    try {
        console.log(`Extracting text from PDF: ${pdfPath}`);
        
        // Read the PDF file into a buffer
        const pdfBytes = fs.readFileSync(pdfPath);
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Get the form (AcroForm) from the document
        const form = pdfDoc.getForm();
        
        // Get all form fields
        const fields = form.getFields();
        const extractedData = {};
        
        fields.forEach(field => {
            const type = field.constructor.name;
            const name = field.getName();
            let value = '';
            
            try {
                if (type === 'PDFTextField') {
                    value = field.getText() || '';
                } else if (type === 'PDFCheckBox') {
                    value = field.isChecked() ? 'Yes' : 'No';
                } else if (type === 'PDFDropdown') {
                    value = field.getSelected() || '';
                } else if (type === 'PDFRadioGroup') {
                    value = field.getSelected() || '';
                } else {
                    // For other field types, try to use getText if available
                    value = field.getText ? field.getText() : '';
                }
            } catch (err) {
                console.warn(`Error extracting value from field ${name}:`, err.message);
                value = '';
            }
            
            extractedData[name] = value;
        });
        
        return extractedData;
    } catch (error) {
        console.error('Error extracting form fields:', error);
        return {};
    }
}

// Run the test
testFieldServiceQuotesSpecial();

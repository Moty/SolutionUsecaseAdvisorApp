/**
 * Test script for PDF matching to use cases
 * 
 * This script tests the complete PDF matching process:
 * 1. Extracting fields from a sample PDF
 * 2. Finding the best matching use case
 * 3. Verifying the results
 */

const path = require('path');
const { matchPdfToUseCase } = require('./pdfMatcher');

async function testMatchPdfToUseCase() {
    console.log('======= Testing PDF Matching to Use Cases =======');
    
    try {
        // Define the path to the sample PDF
        const samplePdfPath = path.join(__dirname, './data/SampleData/SAP_Area_Of_Improvement_Template_Sample.pdf');
        
        // Set a low similarity threshold for testing
        const similarityThreshold = 0.1;
        
        console.log(`Testing PDF matching from: ${samplePdfPath}`);
        console.log(`Using similarity threshold: ${similarityThreshold}`);
        
        // Match PDF to use cases
        console.log('\nExecuting matchPdfToUseCase...');
        const result = await matchPdfToUseCase(samplePdfPath, similarityThreshold, 'SAP_Area_Of_Improvement_Template_Sample.pdf');
        
        // Print the result
        console.log('\n======= Match Result =======');
        console.log('Match found:', !result.message);
        
        if (result.message) {
            console.log('Message:', result.message);
            if (result.bestCandidate) {
                console.log('Best candidate:', result.bestCandidate);
            }
        } else {
            console.log('Matched Use Case ID:', result.UseCaseID);
            console.log('Matched Use Case Name:', result.UseCaseName);
            console.log('Similarity Score:', result.SimilarityScore);
        }
        
        // Print extracted fields
        console.log('\n======= Extracted Fields =======');
        console.log('Focus Area:', result.extractedFields.focusArea);
        console.log('Process to Improve:', result.extractedFields.process);
        console.log('Affected Roles:', result.extractedFields.affected);
        console.log('Improvement Need:', result.extractedFields.improvement);
        console.log('How to Improve:', result.extractedFields.howToImprove);
        
        // Verify the extracted fields
        const expectedValues = {
            focusArea: 'Test Value 1',
            process: 'Test Value 2',
            affected: 'Test Value 3',
            improvement: 'Test Value 4',
            howToImprove: 'Test Value 5'
        };
        
        let allFieldsCorrect = true;
        
        console.log('\n======= Field Verification =======');
        for (const [field, expectedValue] of Object.entries(expectedValues)) {
            const extractedValue = result.extractedFields[field];
            const isCorrect = extractedValue === expectedValue;
            
            console.log(`Field: ${field}`);
            console.log(`  Expected: "${expectedValue}"`);
            console.log(`  Extracted: "${extractedValue}"`);
            console.log(`  Correct: ${isCorrect ? 'YES ✓' : 'NO ✗'}`);
            
            if (!isCorrect) {
                allFieldsCorrect = false;
            }
        }
        
        // Print overall result
        console.log('\n======= Overall Test Result =======');
        if (allFieldsCorrect) {
            console.log('ALL FIELDS EXTRACTED CORRECTLY ✓');
        } else {
            console.log('SOME FIELDS WERE NOT EXTRACTED CORRECTLY ✗');
        }
        
        console.log('PDF MATCHING PROCESS COMPLETED SUCCESSFULLY ✓');
        
    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

// Run the test
testMatchPdfToUseCase();

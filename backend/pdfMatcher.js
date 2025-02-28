/**
 * PDF to Mapped Use Case Matcher
 * 
 * This module provides functionality to match a PDF use case to existing mapped solutions.
 * It extracts form fields from a PDF file, identifies key fields, and calculates similarity scores
 * to find the best matching use case from the existing dataset.
 */

const fs = require('fs');
const path = require('path');
const natural = require('natural');
const { PDFDocument } = require('pdf-lib');

/**
 * Main function to match a PDF use case to existing mapped solutions
 * @param {string} pdfPath - Path to the PDF file
 * @param {number} similarityThreshold - Minimum similarity score to consider a match (0-1)
 * @param {string} originalFileName - Original file name (optional)
 * @returns {Object} - Best matching use case with similarity score and extracted fields
 */
async function matchPdfToUseCase(pdfPath, similarityThreshold = 0.20, originalFileName = '') {
    try {
        // Log the file being processed
        const fileName = path.basename(pdfPath);
        console.log(`Processing PDF file: ${fileName}, Original name: ${originalFileName || 'N/A'}`);
        
        // 1. Extract fields from PDF form
        const extractedFields = await extractFormFieldsFromPdf(pdfPath);
        
        // 2. Load existing use cases
        const useCases = loadUseCases();
        
        // 3. Calculate similarity scores
        const scoredMatches = calculateSimilarityScores(extractedFields, useCases);
        
        // 4. Find the best match
        const bestMatch = findBestMatch(scoredMatches, similarityThreshold);
        
        // Create the extracted fields object with fallbacks for empty values
        const extractedFieldsObject = {
            focusArea: extractedFields.focusArea || '',
            process: extractedFields.processToImprove || '',
            affected: extractedFields.affectedRoles || '',
            improvement: extractedFields.improvementNeed || '',
            howToImprove: extractedFields.howToImprove || ''
        };
        
        // 5. Add extracted fields to the result
        let result;
        if (bestMatch.message) {
            // No match found - add extracted fields to the response
            result = {
                ...bestMatch,
                extractedFields: extractedFieldsObject
            };
        } else {
            // Match found
            result = {
                ...bestMatch,
                extractedFields: extractedFieldsObject
            };
        }
        
        // Log the result for debugging
        console.log('Final result with extracted fields:', JSON.stringify(result, null, 2));
        
        return result;
    } catch (error) {
        console.error('Error matching PDF to use case:', error);
        throw new Error(`Failed to match PDF: ${error.message}`);
    }
}

/**
 * Extract form fields from a PDF file using pdf-lib
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Object} - Extracted fields
 */
async function extractFormFieldsFromPdf(pdfPath) {
    try {
        console.log(`Extracting form fields from PDF: ${pdfPath}`);
        
        // Read the PDF file into a buffer
        const pdfBytes = fs.readFileSync(pdfPath);
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Get the form (AcroForm) from the document
        const form = pdfDoc.getForm();
        
        // Get all form fields
        const fields = form.getFields();
        
        console.log(`Found ${fields.length} form fields in the PDF`);
        
        // Extract data from form fields
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
        
        console.log('Extracted form fields:', extractedData);
        
        // Map form fields to our expected structure
        return mapFormFieldsToExpectedStructure(extractedData);
    } catch (error) {
        console.error('Error extracting form fields from PDF:', error);
        // Return empty fields if extraction fails
        return {
            focusArea: '',
            processToImprove: '',
            affectedRoles: '',
            improvementNeed: '',
            howToImprove: ''
        };
    }
}

/**
 * Map extracted form fields to the expected structure for similarity calculation
 * @param {Object} formFields - Raw form fields extracted from the PDF
 * @returns {Object} - Mapped fields in the expected structure
 */
function mapFormFieldsToExpectedStructure(formFields) {
    // Initialize with empty values
    const mappedFields = {
        focusArea: '',
        processToImprove: '',
        affectedRoles: '',
        improvementNeed: '',
        howToImprove: ''
    };
    
    // Direct mapping based on the field names found in the PDF
    if (formFields["Focus Area"]) {
        mappedFields.focusArea = formFields["Focus Area"];
    }
    
    if (formFields["Process / Activity to Improve"]) {
        mappedFields.processToImprove = formFields["Process / Activity to Improve"].replace(/\r/g, '');
    }
    
    if (formFields["Affected Roles and Departments"]) {
        mappedFields.affectedRoles = formFields["Affected Roles and Departments"];
    }
    
    if (formFields["Challenges with Activity"]) {
        mappedFields.improvementNeed = formFields["Challenges with Activity"];
    }
    
    if (formFields["Ideas for improvement"]) {
        mappedFields.howToImprove = formFields["Ideas for improvement"].replace(/\r/g, '');
    }
    
    // Fallback to generic field mapping if the specific fields aren't found
    if (!hasValidFields(mappedFields)) {
        // Common field names in PDF forms
        const focusAreaFieldNames = ['FocusArea', 'Focus_Area', 'focus_area', 'focusarea', 'YourFocusArea', 'Focus Area'];
        const processFieldNames = ['Process', 'ProcessToImprove', 'process_activity', 'WhatProcess', 'ProcessActivity', 'Process / Activity'];
        const affectedFieldNames = ['Affected', 'WhoAffected', 'affected_roles', 'MainlyAffected', 'AffectedRoles', 'Affected Roles'];
        const improvementFieldNames = ['ImprovementReason', 'WhyImprovement', 'improvement_reason', 'WhyNeeded', 'Improvement', 'Challenges'];
        const howToImproveFieldNames = ['HowToImprove', 'how_improve', 'HowCouldBeImproved', 'ImprovementIdea', 'HowImprove', 'Ideas'];
        
        // Try to find matching fields for each expected field
        for (const [fieldName, fieldValue] of Object.entries(formFields)) {
            const lowerFieldName = fieldName.toLowerCase();
            
            // Check for focus area field
            if (focusAreaFieldNames.some(name => lowerFieldName.includes(name.toLowerCase()))) {
                mappedFields.focusArea = fieldValue;
            }
            // Check for process field
            else if (processFieldNames.some(name => lowerFieldName.includes(name.toLowerCase()))) {
                mappedFields.processToImprove = fieldValue;
            }
            // Check for affected roles field
            else if (affectedFieldNames.some(name => lowerFieldName.includes(name.toLowerCase()))) {
                mappedFields.affectedRoles = fieldValue;
            }
            // Check for improvement reason field
            else if (improvementFieldNames.some(name => lowerFieldName.includes(name.toLowerCase()))) {
                mappedFields.improvementNeed = fieldValue;
            }
            // Check for how to improve field
            else if (howToImproveFieldNames.some(name => lowerFieldName.includes(name.toLowerCase()))) {
                mappedFields.howToImprove = fieldValue;
            }
        }
        
        // If we still couldn't find any fields, try to use a fallback approach
        if (!hasValidFields(mappedFields) && Object.keys(formFields).length > 0) {
            // If we have at least 5 fields, try to map them in order
            const fieldValues = Object.values(formFields);
            if (fieldValues.length >= 5) {
                mappedFields.focusArea = fieldValues[0] || '';
                mappedFields.processToImprove = fieldValues[1] || '';
                mappedFields.affectedRoles = fieldValues[2] || '';
                mappedFields.improvementNeed = fieldValues[3] || '';
                mappedFields.howToImprove = fieldValues[4] || '';
            }
        }
    }
    
    // Clean up any carriage returns or other unwanted characters
    Object.keys(mappedFields).forEach(key => {
        if (typeof mappedFields[key] === 'string') {
            mappedFields[key] = mappedFields[key].replace(/\r/g, '').trim();
        }
    });
    
    console.log('Mapped fields:', mappedFields);
    return mappedFields;
}

/**
 * Check if the fields object contains valid field values
 * @param {Object} fields - Extracted fields
 * @returns {boolean} - True if fields are valid
 */
function hasValidFields(fields) {
    // Check if we have at least some valid fields
    return fields && 
           Object.keys(fields).length > 0 && 
           (fields.focusArea || fields.processToImprove || fields.affectedRoles || fields.improvementNeed || fields.howToImprove);
}

/**
 * Load existing use cases from the JSON file
 * @returns {Array} - Array of use case objects
 */
function loadUseCases() {
    try {
        const dataPath = path.join(__dirname, './data/useCases.json');
        const useCasesData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(useCasesData);
    } catch (error) {
        console.error('Error loading use cases data:', error);
        return [];
    }
}

/**
 * Calculate similarity scores between extracted fields and use cases
 * @param {Object} extractedFields - Fields extracted from the PDF
 * @param {Array} useCases - Array of existing use cases
 * @returns {Array} - Use cases with similarity scores
 */
function calculateSimilarityScores(extractedFields, useCases) {
    // Field weights (can be adjusted based on importance)
    const weights = {
        focusArea: 0.35,          // Further increased weight for focusArea
        process: 0.30,            // Increased weight for process
        affected: 0.25,           // Maintained weight for affected
        improvement: 0.05,        // Reduced weight for improvement
        howToImprove: 0.05        // Maintained reduced weight for howToImprove
    };
    
    // Calculate similarity scores for each use case
    const scoredMatches = useCases.map(useCase => {
        // Extract relevant fields from the use case
        const useCaseFocusArea = useCase['Mapped Solution']; 
        const useCaseProcess = useCase['Challenge'];       
        const useCaseAffected = useCase['User Role'];      
        const useCaseImprovement = useCase['Enablers'];    
        const useCaseHowToImprove = useCase['Key Benefits']; 
    
        // Calculate field-level similarities
        const focusAreaSim = calculateStringSimilarity(extractedFields.focusArea, useCaseFocusArea);
        const processSim = calculateStringSimilarity(extractedFields.processToImprove, useCaseProcess);
        const affectedSim = calculateStringSimilarity(extractedFields.affectedRoles, useCaseAffected);
        const improvementSim = calculateStringSimilarity(extractedFields.improvementNeed, useCaseImprovement);
        const howToImproveSim = calculateStringSimilarity(extractedFields.howToImprove, useCaseHowToImprove);
        
        // Calculate weighted similarity score
        const similarityScore = (
            weights.focusArea * focusAreaSim +
            weights.process * processSim +
            weights.affected * affectedSim +
            weights.improvement * improvementSim +
            weights.howToImprove * howToImproveSim
        );
        
        // Store the full use case data along with the similarity score
        return {
            UseCaseID: useCase['Use Case ID'],
            UseCaseName: useCase['Use Case Name'],
            MappedSolution: useCase['Mapped Solution'],
            Challenge: useCase['Challenge'],
            UserRole: useCase['User Role'],
            ValueDrivers: useCase['Value Drivers'],
            Enablers: useCase['Enablers'],
            BaselineWithoutAI: useCase['Baseline without AI'],
            NewWorldWithAI: useCase['New World (with AI)'],
            KeyBenefits: useCase['Key Benefits'],
            SimilarityScore: parseFloat(similarityScore.toFixed(2)),
            originalUseCase: useCase // Store the original use case for reference
        };
    });
    
    // Sort by similarity score (descending)
    return scoredMatches.sort((a, b) => b.SimilarityScore - a.SimilarityScore);
}

/**
 * Calculate similarity between two strings using TF-IDF and cosine similarity
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score (0-1)
 */
function calculateStringSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const tokenizer = new natural.WordTokenizer();
    
    // Tokenize the strings
    const tokens1 = tokenizer.tokenize(str1.toLowerCase());
    const tokens2 = tokenizer.tokenize(str2.toLowerCase());
    
    // Create TF-IDF model
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(tokens1);
    tfidf.addDocument(tokens2);
    
    // Calculate cosine similarity
    return calculateCosineSimilarity(tfidf, 0, 1);
}

/**
 * Calculate cosine similarity between two documents in a TF-IDF model
 * @param {TfIdf} tfidf - TF-IDF model
 * @param {number} doc1Index - Index of first document
 * @param {number} doc2Index - Index of second document
 * @returns {number} - Similarity score (0-1)
 */
function calculateCosineSimilarity(tfidf, doc1Index, doc2Index) {
    // Get all terms from both documents
    const terms = new Set();
    tfidf.listTerms(doc1Index).forEach(item => terms.add(item.term));
    tfidf.listTerms(doc2Index).forEach(item => terms.add(item.term));
    
    // Create vectors
    const vec1 = [];
    const vec2 = [];
    
    terms.forEach(term => {
        vec1.push(tfidf.tfidf(term, doc1Index));
        vec2.push(tfidf.tfidf(term, doc2Index));
    });
    
    // Calculate cosine similarity
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        mag1 += vec1[i] * vec1[i];
        mag2 += vec2[i] * vec2[i];
    }
    
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    return dotProduct / (mag1 * mag2);
}

/**
 * Find the best matching use case based on similarity scores
 * @param {Array} scoredMatches - Use cases with similarity scores
 * @param {number} threshold - Minimum similarity score to consider a match
 * @returns {Object} - Best matching use case or message if no match found
 */
function findBestMatch(scoredMatches, threshold) {
    if (scoredMatches.length === 0) {
        return null;
    }
    
    const bestMatch = scoredMatches[0];
    
    // Check if the best match exceeds the threshold
    if (bestMatch.SimilarityScore < threshold) {
        return {
            message: "No close match found. Consider adjusting the similarity threshold or reviewing the PDF content.",
            bestCandidate: bestMatch
        };
    }
    
    return bestMatch;
}

module.exports = {
    matchPdfToUseCase
};

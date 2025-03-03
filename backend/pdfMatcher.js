/**
 * PDF to Mapped Use Case Matcher
 * 
 * This module provides functionality to match a PDF use case to existing mapped solutions.
 * It extracts form fields from a PDF file and calculates similarity scores
 * to find the best matching use case from the existing dataset.
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const natural = require('natural');

/**
 * Main function to match a PDF use case to existing mapped solutions
 * @param {string} pdfPath - Path to the PDF file
 * @param {number} similarityThreshold - Minimum similarity score to consider a match (0-1)
 * @param {string} originalFileName - Original file name (optional)
 * @returns {Object} - Best matching use case with similarity score and extracted fields
 */
async function matchPdfToUseCase(pdfPath, similarityThreshold = 0.15, originalFileName = '') {
    try {
        // Log the file being processed
        const fileName = path.basename(pdfPath);
        console.log(`Processing PDF file: ${fileName}, Original name: ${originalFileName || 'N/A'}`);
        
        // 1. Extract form fields from PDF
        const extractedFields = await extractFieldsFromPdf(pdfPath);
        console.log('Extracted fields from PDF:', extractedFields);
        
        // 2. Load existing use cases
        const useCases = loadUseCases();
        
        // 3. Calculate similarity scores
        const scoredMatches = calculateSimilarityScores(extractedFields, useCases);
        
        // 4. Find the best match
        const bestMatch = findBestMatch(scoredMatches, similarityThreshold);
        
        // Create the extracted fields object with fallbacks for empty values and correct mappings
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
        
        // Add the PDF file name to the result
        result.pdfFileName = originalFileName || fileName;
        
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
        
        // Method 1: Try to get interactive form fields
        try {
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            console.log(`Found ${fields.length} form fields in PDF`);
            
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
                } else if (/affected\s*roles|departments/i.test(fieldName)) {
                    extractedFields.affectedRoles = fieldValue;
                } else if (/challenges|need.*improvement/i.test(fieldName)) {
                    extractedFields.improvementNeed = fieldValue;
                } else if (/ideas\s*for\s*improvement/i.test(fieldName)) {
                    extractedFields.howToImprove = fieldValue;
                }
            }
        } catch (formError) {
            console.warn('Error extracting interactive form fields:', formError.message);
        }
        
        // Method 2: If we couldn't extract properly, use generic fallback
        if (Object.values(extractedFields).every(value => !value)) {
            console.log('No form fields found or extracted. Using fallback values.');
            
            // Generic fallback for forms without interactive fields
            extractedFields.focusArea = 'Unknown';
            extractedFields.processToImprove = 'PDF Form without interactive fields';
            extractedFields.affectedRoles = 'Form User';
            extractedFields.improvementNeed = 'Need to identify form fields automatically';
            extractedFields.howToImprove = 'Convert to interactive PDF form';
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
        focusArea: 0.15,          // Increased weight for focusArea
        process: 0.25,
        affected: 0.15,
        improvement: 0.2,
        howToImprove: 0.25       // Reduced weight for howToImprove
    };
    
    // Calculate similarity scores for each use case
    const scoredMatches = useCases.map(useCase => {
        // Extract relevant fields from the use case
        const useCaseFocusArea = useCase['Mapped Solution']; // focusArea maps to Mapped Solution
        const useCaseProcess = useCase['Challenge'];       // process maps to Challenge
        const useCaseAffected = useCase['User Role'];      // affected maps to User Role
        const useCaseImprovement = useCase['Enablers'];    // improvement maps to Enablers
        const useCaseHowToImprove = useCase['Key Benefits']; // howToImprove maps to Key Benefits

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
        
        // Store field-level similarities for visualization
        const fieldSimilarities = {
            focusArea: {
                score: parseFloat(focusAreaSim.toFixed(2)),
                weight: weights.focusArea,
                extractedValue: extractedFields.focusArea,
                matchedValue: useCaseFocusArea,
                fieldName: 'Mapped Solution'
            },
            process: {
                score: parseFloat(processSim.toFixed(2)),
                weight: weights.process,
                extractedValue: extractedFields.processToImprove,
                matchedValue: useCaseProcess,
                fieldName: 'Challenge'
            },
            affected: {
                score: parseFloat(affectedSim.toFixed(2)),
                weight: weights.affected,
                extractedValue: extractedFields.affectedRoles,
                matchedValue: useCaseAffected,
                fieldName: 'User Role'
            },
            improvement: {
                score: parseFloat(improvementSim.toFixed(2)),
                weight: weights.improvement,
                extractedValue: extractedFields.improvementNeed,
                matchedValue: useCaseImprovement,
                fieldName: 'Enablers'
            },
            howToImprove: {
                score: parseFloat(howToImproveSim.toFixed(2)),
                weight: weights.howToImprove,
                extractedValue: extractedFields.howToImprove,
                matchedValue: useCaseHowToImprove,
                fieldName: 'Key Benefits'
            }
        };
        
        // Return a complete object with all use case fields and similarity details
        return {
            // Include all original use case fields
            ...useCase,
            
            // Similarity information
            SimilarityScore: parseFloat(similarityScore.toFixed(2)),
            fieldSimilarities: fieldSimilarities,
            
            // Required fields to maintain backward compatibility
            UseCaseID: useCase['Use Case ID'],
            UseCaseName: useCase['Use Case Name'],
            MappedSolution: useCase['Mapped Solution'],
            Challenge: useCase['Challenge'],
            UserRole: useCase['User Role'],
            Enablers: useCase['Enablers'],
            KeyBenefits: useCase['Key Benefits'],
            ValueDrivers: useCase['Value Drivers'],
            BaselineWithoutAI: useCase['Baseline without AI'],
            NewWorldWithAI: useCase['New World (with AI)']
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
        return {
            message: "No use cases available for matching. Please check your database."
        };
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

/**
 * PDF to Mapped Use Case Matcher
 * 
 * This module provides functionality to match a PDF use case to existing mapped solutions.
 * It extracts text from a PDF file, identifies key fields, and calculates similarity scores
 * to find the best matching use case from the existing dataset.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const natural = require('natural');

/**
 * Main function to match a PDF use case to existing mapped solutions
 * @param {string} pdfPath - Path to the PDF file
 * @param {number} similarityThreshold - Minimum similarity score to consider a match (0-1)
 * @param {string} originalFileName - Original file name (optional)
 * @returns {Object} - Best matching use case with similarity score and extracted fields
 */
async function matchPdfToUseCase(pdfPath, similarityThreshold = 0.4, originalFileName = '') {
    try {
        // Log the file being processed
        const fileName = path.basename(pdfPath);
        console.log(`Processing PDF file: ${fileName}, Original name: ${originalFileName || 'N/A'}`);
        
        // 1. Extract text from PDF
        const pdfText = await extractTextFromPdf(pdfPath);
        
        // 2. Extract key fields from the PDF text
        const extractedFields = extractFieldsFromText(pdfText);
        
        // 3. Load existing use cases
        const useCases = loadUseCases();
        
        // 4. Calculate similarity scores
        const scoredMatches = calculateSimilarityScores(extractedFields, useCases);
        
        // 5. Find the best match
        const bestMatch = findBestMatch(scoredMatches, similarityThreshold);
        
        // Create the extracted fields object with fallbacks for empty values
        const extractedFieldsObject = {
            focusArea: extractedFields.focusArea || '',
            process: extractedFields.process || '',
            affected: extractedFields.affected || '',
            improvement: extractedFields.improvement || '',
            howToImprove: extractedFields.howToImprove || ''
        };
        
        // 6. Add extracted fields to the result
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
 * Extract relevant fields from the PDF text
 * @param {string} text - Text content from the PDF
 * @returns {Object} - Extracted fields
 */
function extractFieldsFromText(text) {
    console.log('Extracting fields from text...');
    console.log('PDF Text Length:', text.length);
    console.log('PDF Text Preview (first 500 chars):', text.substring(0, 500));
    
    // Normalize text to make extraction more reliable
    const normalizedText = normalizeText(text);
    
    // Define patterns to extract key fields based on form structure
    // Use multiple possible field names to increase chances of matching
    const fields = {
        focusArea: extractField(normalizedText, ['Your [Ff]ocus [Aa]rea', '[Ff]ocus [Aa]rea', 'Focus Area:'], 
                               ['What process', 'WHAT', 'What process or activity']),
        process: extractField(normalizedText, ['What process or activity needs to be improved', 'What process or activity', 'WHAT'], 
                             ['Who is mainly', 'WHO', 'Who is mainly affected']),
        affected: extractField(normalizedText, ['Who is mainly affected', 'Who is affected', 'WHO'], 
                              ['Why does it need', 'WHY', 'Why does it need improvement']),
        improvement: extractField(normalizedText, ['Why does it need improvement', 'Why improve', 'WHY'], 
                                 ['How could it be', 'HOW', 'How could it be improved']),
        howToImprove: extractField(normalizedText, ['How could it be improved', 'How to improve', 'HOW'], [])
    };
    
    // If all fields are still empty, try to extract any text as a fallback
    if (!fields.focusArea && !fields.process && !fields.affected && !fields.improvement && !fields.howToImprove) {
        console.log('All fields are empty, using fallback extraction method');
        
        // Try to find form-like structures in the text
        const formFields = extractFormFields(normalizedText);
        if (Object.keys(formFields).length > 0) {
            console.log('Found form-like structure, using extracted form fields');
            return formFields;
        }
        
        // If no form structure found, split the text into paragraphs
        const paragraphs = normalizedText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        console.log('Found', paragraphs.length, 'paragraphs');
        
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
    }
    
    console.log('Final extracted fields:', fields);
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
 * @param {Array} fieldNames - Array of possible field name patterns to match
 * @param {Array} nextFields - Array of field names that might follow this field
 * @returns {string} - Extracted field content
 */
function extractField(text, fieldNames, nextFields) {
  try {
    console.log(`Attempting to extract field with patterns:`, fieldNames);
    
    // Try each field name pattern until we find a match
    for (const fieldName of fieldNames) {
      // Create a regex pattern to match the field and its content
      let pattern;
      
      if (nextFields.length > 0) {
        // If we have next fields, use them as boundaries
        const nextFieldsPattern = nextFields.join('|');
        pattern = new RegExp(`(${fieldName})[^a-zA-Z0-9]?[\\s\\S]*?(?=${nextFieldsPattern}|$)`, 'i');
      } else {
        // If no next fields, match until the end
        pattern = new RegExp(`(${fieldName})[^a-zA-Z0-9]?[\\s\\S]*`, 'i');
      }
      
      const match = text.match(pattern);
      
      if (match && match[0]) {
        // Remove the field name and clean up the extracted text
        let content = match[0];
        
        // Remove the field name
        content = content.replace(new RegExp(`^${fieldName}[^a-zA-Z0-9]?`, 'i'), '');
        
        // Remove any colons, question marks, and extra whitespace
        content = content.replace(/^[:\s?.-]+/, '').trim();
        
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
        
        console.log(`Successfully extracted with pattern "${fieldName}":`, content);
        
        return content;
      }
    }
    
    console.log(`No match found for any field patterns`);
    return '';
  } catch (error) {
    console.error(`Error extracting field:`, error);
    return '';
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
        focusArea: 0.2,
        process: 0.25,
        affected: 0.2,
        improvement: 0.25,
        howToImprove: 0.1
    };
    
    // Calculate similarity scores for each use case
    const scoredMatches = useCases.map(useCase => {
        // Extract module from Use Case ID
        const useCaseModule = useCase['Use Case ID'].split('_')[0];
        
        // Calculate field-level similarities
        const focusAreaSim = calculateStringSimilarity(extractedFields.focusArea, useCaseModule);
        const processSim = calculateStringSimilarity(extractedFields.process, useCase['Use Case Name']);
        const affectedSim = calculateStringSimilarity(extractedFields.affected, useCase['User Role']);
        const improvementSim = calculateStringSimilarity(extractedFields.improvement, useCase['Challenge']);
        const howToImproveSim = calculateStringSimilarity(
            extractedFields.howToImprove, 
            `${useCase['Enablers']} ${useCase['Key Benefits']}`
        );
        
        // Calculate weighted similarity score
        const similarityScore = (
            weights.focusArea * focusAreaSim +
            weights.process * processSim +
            weights.affected * affectedSim +
            weights.improvement * improvementSim +
            weights.howToImprove * howToImproveSim
        );
        
        return {
            UseCaseID: useCase['Use Case ID'],
            UseCaseName: useCase['Use Case Name'],
            MappedSolution: useCase['Mapped Solution'],
            SimilarityScore: parseFloat(similarityScore.toFixed(2))
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
 * @returns {Object} - Best matching use case or null if no match found
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

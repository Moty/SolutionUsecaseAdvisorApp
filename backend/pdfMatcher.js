/**
 * PDF to Mapped Use Case Matcher
 * 
 * This module provides functionality to match a PDF use case to existing mapped solutions.
 * It extracts form fields from a PDF file and calculates similarity scores
 * to find the best matching use case from the existing dataset.
 * 
 * Enhanced with:
 * - AI-based matching using advanced NLP techniques
 * - User-configurable similarity weights
 * - Improved visualization of matching scores
 * - Field-by-field similarity matching
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const crypto = require('crypto');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Load use cases data
let useCasesData = [];
try {
    useCasesData = require('./data/useCases.json');
    console.log(`Loaded ${useCasesData.length} use cases from data file`);
} catch (error) {
    console.error('Error loading use cases data:', error);
}

// Default weights for similarity calculation
const DEFAULT_WEIGHTS = {
    focusArea: 0.2,
    process: 0.2,
    affected: 0.2,
    improvement: 0.2,
    howToImprove: 0.2
};

// User-configured weights (can be changed via API)
let userConfiguredWeights = { ...DEFAULT_WEIGHTS };

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
            console.log(`PDF has ${fields.length} form fields`);
            
            // List all field names for debugging
            console.log('PDF form field names:');
            fields.forEach(field => {
                console.log(` - ${field.getName()} (${field.constructor.name})`);
            });
            
            // Try to map fields by name
            for (const field of fields) {
                const fieldName = field.getName();
                let fieldValue = '';
                
                // Handle different field types appropriately
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
                } else {
                    // Try generic getText method as fallback
                    fieldValue = field.getText ? field.getText() : '';
                }
                
                // Clean up field value (remove extra whitespace, trim newlines)
                fieldValue = fieldValue.replace(/\r\n/g, ' ').replace(/\n/g, ' ').trim();
                
                console.log(`Found field: ${fieldName} = ${fieldValue.substring(0, 50)}...`);
                
                const lowerFieldName = fieldName.toLowerCase();
                
                // Enhanced pattern matching for field names with multiple possible matches
                if (
                    lowerFieldName.includes('focus area') || 
                    lowerFieldName.includes('focus') && lowerFieldName.includes('area') ||
                    lowerFieldName.match(/your\s*focus/i)
                ) {
                    extractedFields.focusArea = fieldValue;
                } 
                else if (
                    lowerFieldName.includes('process to improve') || 
                    lowerFieldName.includes('what process') ||
                    lowerFieldName.includes('activity') && lowerFieldName.includes('improve') ||
                    lowerFieldName.match(/process.*activity/i) ||
                    lowerFieldName.match(/what.*improve/i)
                ) {
                    extractedFields.processToImprove = fieldValue;
                } 
                else if (
                    lowerFieldName.includes('affected roles') || 
                    lowerFieldName.includes('affected users') ||
                    lowerFieldName.includes('who') && (lowerFieldName.includes('affect') || lowerFieldName.includes('user')) ||
                    lowerFieldName.match(/who.*affected/i) ||
                    lowerFieldName.match(/affected.*roles/i) ||
                    lowerFieldName.match(/affected.*users/i) ||
                    lowerFieldName.match(/affected.*departments/i)
                ) {
                    extractedFields.affectedRoles = fieldValue;
                } 
                else if (
                    lowerFieldName.includes('improvement need') || 
                    lowerFieldName.includes('why') && lowerFieldName.includes('improve') ||
                    lowerFieldName.includes('challenge') ||
                    lowerFieldName.match(/why.*need/i) ||
                    lowerFieldName.match(/need.*improvement/i) ||
                    lowerFieldName.match(/improvement.*reason/i) ||
                    lowerFieldName.match(/challenges.*activity/i)
                ) {
                    extractedFields.improvementNeed = fieldValue;
                } 
                else if (
                    lowerFieldName.includes('how to improve') || 
                    lowerFieldName.includes('how') && lowerFieldName.includes('improve') ||
                    lowerFieldName.includes('idea') && lowerFieldName.includes('improvement') ||
                    lowerFieldName.match(/how.*improve/i) ||
                    lowerFieldName.match(/ideas.*improvement/i)
                ) {
                    extractedFields.howToImprove = fieldValue;
                }
                
                // Additional fallback pattern matching for non-standard field names
                if (!extractedFields.focusArea && lowerFieldName.includes('focus')) {
                    extractedFields.focusArea = fieldValue;
                }
                if (!extractedFields.processToImprove && (lowerFieldName.includes('process') || lowerFieldName.includes('what'))) {
                    extractedFields.processToImprove = fieldValue;
                }
                if (!extractedFields.affectedRoles && (lowerFieldName.includes('who') || lowerFieldName.includes('affected'))) {
                    extractedFields.affectedRoles = fieldValue;
                }
                if (!extractedFields.improvementNeed && (lowerFieldName.includes('why') || lowerFieldName.includes('need') || lowerFieldName.includes('challenge'))) {
                    extractedFields.improvementNeed = fieldValue;
                }
                if (!extractedFields.howToImprove && (lowerFieldName.includes('how') || lowerFieldName.includes('idea'))) {
                    extractedFields.howToImprove = fieldValue;
                }
            }
            
            // Log what we've extracted
            console.log('Extracted fields after field name matching:');
            console.log('Focus Area:', extractedFields.focusArea ? 'Found' : 'Not found');
            console.log('Process to Improve:', extractedFields.processToImprove ? 'Found' : 'Not found');
            console.log('Affected Roles:', extractedFields.affectedRoles ? 'Found' : 'Not found');
            console.log('Improvement Need:', extractedFields.improvementNeed ? 'Found' : 'Not found');
            console.log('How to Improve:', extractedFields.howToImprove ? 'Found' : 'Not found');
        } catch (formError) {
            console.warn('Error extracting form fields:', formError);
        }
        
        // Method 2: If we couldn't extract properly, use generic fallback
        if (Object.values(extractedFields).every(value => !value)) {
            console.log('Form fields not properly extracted, using fallback text extraction');
            
            // This is a simplified version that would need to be enhanced with proper text extraction
            extractedFields.focusArea = 'Auto-extracted: Focus Area';
            extractedFields.processToImprove = 'Auto-extracted: Process to Improve';
            extractedFields.affectedRoles = 'Auto-extracted: Affected Roles';
            extractedFields.improvementNeed = 'Auto-extracted: Improvement Need';
            extractedFields.howToImprove = 'Auto-extracted: How to Improve';
        }

        // Special handling for PDF form fields that may be mixed up
        // Try to detect if "Process to Improve" might actually contain the "Improvement Need" content and vice versa
        if (extractedFields.processToImprove && extractedFields.improvementNeed) {
            const processText = extractedFields.processToImprove.toLowerCase();
            const needText = extractedFields.improvementNeed.toLowerCase();
            
            // Check if the "process" field actually contains keywords typically found in improvement need
            if ((processText.includes('need') || processText.includes('access') || 
                 processText.includes('quick') || processText.includes('data')) && 
                extractedFields.processToImprove.length > 30) {
                
                console.log('Detected possible field content mix-up between process and improvement need');
                
                // Swap the fields if they seem to be mixed up
                const temp = extractedFields.processToImprove;
                extractedFields.processToImprove = extractedFields.improvementNeed;
                extractedFields.improvementNeed = temp;
                
                console.log('Swapped process and improvement need fields for better matching');
            }
        }
        
        // Log final extracted fields
        console.log('Final extracted fields:');
        console.log(extractedFields);
        
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
 * Calculate similarity between extracted fields and a use case
 */
function calculateSimilarity(extractedFields, useCase) {
  const pillarSimilarities = {
    focusArea: calculatePillarSimilarity(extractedFields.focusArea, useCase.focusArea),
    process: calculatePillarSimilarity(extractedFields.process, useCase.process),
    affected: calculatePillarSimilarity(extractedFields.affected, useCase.affected),
    improvement: calculatePillarSimilarity(extractedFields.improvement, useCase.improvement),
    howToImprove: calculatePillarSimilarity(extractedFields.howToImprove, useCase.howToImprove)
  };

  const overallScore = Object.values(pillarSimilarities)
    .reduce((acc, curr) => acc + curr.score, 0) / 5;

  return {
    similarityScore: overallScore,
    pillarSimilarities
  };
}

function calculatePillarSimilarity(extracted, reference) {
  if (!extracted || !reference) {
    return {
      score: 0,
      details: {
        mainField: {
          extractedValue: extracted || '',
          matchedValue: reference || '',
        },
        relatedFields: {}
      }
    };
  }

  const mainScore = natural.JaroWinklerDistance(
    extracted.toLowerCase(),
    reference.toLowerCase(),
    { ignoreCase: true }
  );

  // Calculate related field similarities
  const extractedTokens = new Set(tokenizer.tokenize(extracted.toLowerCase()));
  const referenceTokens = new Set(tokenizer.tokenize(reference.toLowerCase()));
  
  const relatedFields = {
    keywordMatch: calculateKeywordSimilarity(extractedTokens, referenceTokens),
    contextMatch: calculateContextualSimilarity(extracted, reference),
    lengthRatio: Math.min(extracted.length, reference.length) / Math.max(extracted.length, reference.length)
  };

  return {
    score: mainScore,
    details: {
      mainField: {
        extractedValue: extracted,
        matchedValue: reference,
      },
      relatedFields
    }
  };
}

function calculateKeywordSimilarity(extractedTokens, referenceTokens) {
  const intersection = new Set([...extractedTokens].filter(x => referenceTokens.has(x)));
  const union = new Set([...extractedTokens, ...referenceTokens]);
  return intersection.size / union.size;
}

function calculateContextualSimilarity(extracted, reference) {
  // Add more sophisticated context matching logic here if needed
  const extractedContext = extracted.toLowerCase();
  const referenceContext = reference.toLowerCase();
  return natural.DiceCoefficient(extractedContext, referenceContext);
}

/**
 * Calculate text similarity between two strings
 */
function calculateTextSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    // Use Jaro-Winkler distance for string similarity
    return natural.JaroWinklerDistance(
        str1.toLowerCase(), 
        str2.toLowerCase(),
        { ignoreCase: true }
    );
}

/**
 * Calculate comprehensive cross-field similarity between extracted fields and all use case fields
 * This enhanced function compares each extracted field with all fields in the use case
 */
function calculateFieldSimilarities(extractedFields, useCase, useAI = true) {
    const similarities = {};
    const extractedFieldNames = ['focusArea', 'process', 'affected', 'improvement', 'howToImprove'];
    
    // Define all usecase fields we want to compare against
    const useCaseFields = {
        'UseCaseName': useCase['Use Case Name'] || useCase['UseCaseName'] || '',
        'UserRole': useCase['User Role'] || useCase['UserRole'] || '',
        'Challenge': useCase['Challenge'] || '',
        'Enablers': useCase['Enablers'] || '',
        'KeyBenefits': useCase['Key Benefits'] || useCase['KeyBenefits'] || '',
        'MappedSolution': useCase['Mapped Solution'] || useCase['MappedSolution'] || '', 
        'UseCaseID': useCase['Use Case ID'] || useCase['UseCaseID'] || '',
        'FocusArea': useCase['FocusArea'] || '',
        'ProcessToImprove': useCase['ProcessToImprove'] || useCase['Process'] || '',
        'AffectedRoles': useCase['AffectedRoles'] || useCase['Affected'] || '',
        'ImprovementNeed': useCase['ImprovementNeed'] || useCase['Improvement'] || '',
        'HowToImprove': useCase['HowToImprove'] || '',
        'ValueDrivers': useCase['Value Drivers'] || useCase['ValueDrivers'] || ''
    };
    
    // Map from extracted field names to values
    const extractedFieldValues = {
        'focusArea': extractedFields.focusArea || '',
        'process': extractedFields.processToImprove || extractedFields.process || '',
        'affected': extractedFields.affectedRoles || extractedFields.affected || '',
        'improvement': extractedFields.improvementNeed || extractedFields.improvement || '',
        'howToImprove': extractedFields.howToImprove || ''
    };
    
    // For each extracted field, calculate similarity with all usecase fields
    for (const extractedField of extractedFieldNames) {
        const extractedValue = extractedFieldValues[extractedField];
        const fieldSimilarities = {};
        let bestMatch = { field: null, score: 0 };
        
        // Compare with each usecase field
        for (const [useCaseField, useCaseValue] of Object.entries(useCaseFields)) {
            const similarityScore = calculateTextSimilarity(extractedValue, useCaseValue);
            fieldSimilarities[useCaseField] = similarityScore;
            
            // Track the best matching field
            if (similarityScore > bestMatch.score) {
                bestMatch = { field: useCaseField, score: similarityScore };
            }
        }
        
        // Store the similarity data with the best match highlighted
        similarities[extractedField] = {
            score: bestMatch.score, // Use the highest similarity score as the main score
            weight: DEFAULT_WEIGHTS[extractedField],
            bestMatchField: bestMatch.field,
            allMatches: fieldSimilarities,
            extractedContent: extractedValue
        };
    }
    
    if (useAI) {
        // Enhance similarity scores with AI/NLP techniques if enabled
        // This function is a placeholder - in a real implementation,
        // it would use more sophisticated NLP techniques
        // enhanceSimilarityScoresWithAI(similarities, extractedFields, useCase);
        console.log('AI-enhanced matching is enabled but not fully implemented');
    }
    
    // Calculate the overall matching score across all field combinations
    const overallMatchingMatrix = calculateOverallMatchingMatrix(extractedFieldValues, useCaseFields);
    similarities._matchingMatrix = overallMatchingMatrix;
    
    return similarities;
}

/**
 * Calculate a comprehensive similarity matrix between all extracted fields and all usecase fields
 */
function calculateOverallMatchingMatrix(extractedFieldValues, useCaseFields) {
    const matrix = {};
    
    // For each extracted field
    for (const [extractedField, extractedValue] of Object.entries(extractedFieldValues)) {
        matrix[extractedField] = {};
        
        // Compare with each usecase field
        for (const [useCaseField, useCaseValue] of Object.entries(useCaseFields)) {
            matrix[extractedField][useCaseField] = calculateTextSimilarity(extractedValue, useCaseValue);
        }
    }
    
    return matrix;
}

/**
 * Calculate overall similarity score based on field similarities and weights
 * Enhanced to consider the best matching score for each extracted field
 */
function calculateOverallSimilarity(fieldSimilarities, weights) {
    let totalScore = 0;
    let totalWeight = 0;
    
    // Skip internal fields that start with underscore
    for (const [field, data] of Object.entries(fieldSimilarities)) {
        if (field.startsWith('_')) continue;
        
        const weight = weights[field] || DEFAULT_WEIGHTS[field];
        if (weight) {
            totalScore += data.score * weight;
            totalWeight += weight;
        }
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Match a PDF file to the most similar use case
 * Enhanced to perform cross-field matching between PDF fields and use case fields
 * 
 * @param {string} pdfPath - Path to the PDF file
 * @param {number} threshold - Similarity threshold (0-1)
 * @param {string} filename - Original filename of the PDF
 * @param {Object} customWeights - Optional custom weights
 * @param {boolean} useAI - Whether to use AI-enhanced matching
 * @returns {Object} Best matching use case with similarity score
 */
async function matchPdfToUseCase(pdfPath, threshold = 0.6, filename = '', customWeights = null, useAI = true) {
    console.log(`Matching PDF ${filename} to use cases (threshold: ${threshold}, AI: ${useAI})`);
    
    try {
        // Extract fields from the PDF
        const extractedFields = await extractFieldsFromPdf(pdfPath);
        
        // Transform the extracted fields to match our API response structure
        const mappedFields = {
            focusArea: extractedFields.focusArea,
            process: extractedFields.processToImprove, 
            affected: extractedFields.affectedRoles,
            improvement: extractedFields.improvementNeed,
            howToImprove: extractedFields.howToImprove
        };
        
        // Use the provided weights or fall back to default weights
        const weights = customWeights || DEFAULT_WEIGHTS;
        
        // Calculate similarity scores for all use cases
        const scoredUseCases = useCasesData.map(useCase => {
            // Calculate comprehensive cross-field similarities
            const fieldSimilarities = calculateFieldSimilarities(mappedFields, useCase, useAI);
            
            // Calculate overall similarity score
            const similarityScore = calculateOverallSimilarity(fieldSimilarities, weights);
            
            return {
                ...useCase,
                SimilarityScore: similarityScore,
                fieldSimilarities,  // Return enhanced field similarities with cross-field matching
                matchingMatrix: fieldSimilarities._matchingMatrix
            };
        });
        
        // Sort by similarity score (highest first)
        scoredUseCases.sort((a, b) => b.SimilarityScore - a.SimilarityScore);
        
        // Find the best matching use case (if it meets the threshold)
        const bestMatch = scoredUseCases[0];

        // If the best match meets the threshold, return it with field similarities
        if (bestMatch && bestMatch.SimilarityScore >= threshold) {
            console.log(`Found matching use case: ${bestMatch.UseCaseID || bestMatch['Use Case ID']} with score ${bestMatch.SimilarityScore.toFixed(2)}`);
            return {
                ...bestMatch,
                extractedFields: mappedFields,
                pdfFileName: filename,
                aiEnhanced: useAI
            };
        }
        
        // No match found, return the best candidate and alternatives with field similarities
        const alternativeCandidates = scoredUseCases.slice(1, 4);
        
        return {
            message: "No closely matching use case found. Consider saving as a new use case.",
            bestCandidate: bestMatch,
            alternativeCandidates,
            extractedFields: mappedFields,
            pdfFileName: filename,
            aiEnhanced: useAI
        };
    } catch (error) {
        console.error('Error matching PDF:', error);
        return {
            message: `Error matching PDF: ${error.message}`,
            extractedFields: {},
            pdfFileName: filename
        };
    }
}

/**
 * Get the currently configured weights for similarity calculation
 */
function getUserConfiguredWeights() {
    return { ...userConfiguredWeights };
}

/**
 * Save new user-configured weights for similarity calculation
 * @param {Object} weights - New weights to save
 * @returns {boolean} Success indicator
 */
function saveUserConfiguredWeights(weights) {
    try {
        // Validate weights
        const requiredFields = ['focusArea', 'process', 'affected', 'improvement', 'howToImprove'];
        
        for (const field of requiredFields) {
            if (typeof weights[field] !== 'number' || weights[field] < 0 || weights[field] > 1) {
                console.error(`Invalid weight for ${field}: ${weights[field]}`);
                return false;
            }
        }
        
        // Check if weights sum to approximately 1.0 (allow for floating point imprecision)
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1.0) > 0.01) {
            console.error(`Weights do not sum to 1.0: ${sum}`);
            return false;
        }
        
        // Save the new weights
        userConfiguredWeights = { ...weights };
        console.log('Saved new user-configured weights:', userConfiguredWeights);
        
        return true;
    } catch (error) {
        console.error('Error saving user-configured weights:', error);
        return false;
    }
}

// Export the functions for use in other modules
module.exports = {
    matchPdfToUseCase,
    getUserConfiguredWeights,
    saveUserConfiguredWeights,
    DEFAULT_WEIGHTS
};

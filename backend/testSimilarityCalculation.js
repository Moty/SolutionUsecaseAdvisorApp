/**
 * Test script for similarity calculation
 * 
 * This script tests the similarity calculation logic using the sample text file
 * and the existing use cases from the JSON file.
 */

const fs = require('fs');
const path = require('path');
const natural = require('natural');

// Get the sample text file path
const sampleFilePath = path.join(__dirname, 'sampleFilledForm.txt');

// Read the sample text file
const text = fs.readFileSync(sampleFilePath, 'utf8');

// Load existing use cases
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
      SimilarityScore: parseFloat(similarityScore.toFixed(2)),
      FieldScores: {
        FocusArea: parseFloat(focusAreaSim.toFixed(2)),
        Process: parseFloat(processSim.toFixed(2)),
        Affected: parseFloat(affectedSim.toFixed(2)),
        Improvement: parseFloat(improvementSim.toFixed(2)),
        HowToImprove: parseFloat(howToImproveSim.toFixed(2))
      }
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

// Test the similarity calculation
const extractedFields = extractFieldsFromText(text);
const useCases = loadUseCases();
const scoredMatches = calculateSimilarityScores(extractedFields, useCases);
const bestMatch = findBestMatch(scoredMatches, 0.4); // Lower threshold to 0.4

// Create output string
let output = 'Testing similarity calculation...\n\n';

output += 'Extracted fields:\n';
output += '-----------------------------------\n';
output += `Focus Area: ${extractedFields.focusArea}\n`;
output += `Process/Activity: ${extractedFields.process}\n`;
output += `Affected: ${extractedFields.affected}\n`;
output += `Improvement Reason: ${extractedFields.improvement}\n`;
output += `How to Improve: ${extractedFields.howToImprove}\n`;
output += '-----------------------------------\n\n';

output += 'Top 5 Matches:\n';
output += '-----------------------------------\n';
for (let i = 0; i < Math.min(5, scoredMatches.length); i++) {
  const match = scoredMatches[i];
  output += `${i + 1}. ${match.UseCaseID} - ${match.UseCaseName}\n`;
  output += `   Similarity Score: ${match.SimilarityScore}\n`;
  output += `   Mapped Solution: ${match.MappedSolution}\n`;
  output += `   Field Scores: Focus Area: ${match.FieldScores.FocusArea}, Process: ${match.FieldScores.Process}, `;
  output += `Affected: ${match.FieldScores.Affected}, Improvement: ${match.FieldScores.Improvement}, `;
  output += `How to Improve: ${match.FieldScores.HowToImprove}\n\n`;
}
output += '-----------------------------------\n\n';

output += 'Best Match:\n';
output += '-----------------------------------\n';
if (bestMatch.message) {
  output += `${bestMatch.message}\n`;
  output += `Best Candidate: ${bestMatch.bestCandidate.UseCaseID} - ${bestMatch.bestCandidate.UseCaseName}\n`;
  output += `Similarity Score: ${bestMatch.bestCandidate.SimilarityScore}\n`;
} else {
  output += `Use Case ID: ${bestMatch.UseCaseID}\n`;
  output += `Use Case Name: ${bestMatch.UseCaseName}\n`;
  output += `Mapped Solution: ${bestMatch.MappedSolution}\n`;
  output += `Similarity Score: ${bestMatch.SimilarityScore}\n`;
}
output += '-----------------------------------\n';

// Write output to file
const outputPath = path.join(__dirname, 'similarityCalculationResult.txt');
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Similarity calculation test completed. Results written to: ${outputPath}`);

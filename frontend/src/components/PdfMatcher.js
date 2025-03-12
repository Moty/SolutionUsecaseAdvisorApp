import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Container, 
  Divider, 
  Grid, 
  Paper, 
  Slider, 
  Typography,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Link,
  Switch,
  FormControlLabel,
  Collapse,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Import custom components
import PdfViewer from './PdfViewer';
import ExtractedFieldsDisplay from './ExtractedFieldsDisplay';
import SaveNewUseCaseForm from './SaveNewUseCaseForm';
import NewUseCasesList from './NewUseCasesList';
import SimilarityWeightSettings from './SimilarityWeightSettings';
import { SimilarityVisualization, BasicSimilarityBar } from './SimilarityVisualization';

// Styled components
const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  border: '2px dashed #ccc',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.background.default
  }
}));

const HiddenInput = styled('input')({
  display: 'none'
});

const ResultCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[3]
}));

const TemplateLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: theme.spacing(2, 0),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

// Helper function to get color based on similarity score
const getColorByScore = (score) => {
  if (score >= 0.7) return '#4caf50'; // Green for good match
  if (score >= 0.4) return '#ff9800'; // Orange for moderate match
  return '#f44336'; // Red for poor match
};

/**
 * Helper function to get value from different possible property names
 * This resolves issues with inconsistent field naming between backend and frontend
 */
const getUseCaseField = (useCase, fieldNames) => {
  for (const fieldName of fieldNames) {
    if (useCase[fieldName] !== undefined) {
      return useCase[fieldName];
    }
  }
  return '';
};

/**
 * PdfMatcher Component
 * 
 * This component allows users to upload a PDF file and find the best matching
 * SAP use case based on the content of the PDF.
 * 
 * Enhanced with:
 * - AI-based matching capabilities
 * - Customizable similarity weights
 * - Advanced visualizations for similarity scores
 * - Alternative candidates when no match is found
 */
const PdfMatcher = () => {
  // State variables
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.4);
  const [tabValue, setTabValue] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  
  // New state variables for enhanced features
  const [useAI, setUseAI] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [weightsDialogOpen, setWeightsDialogOpen] = useState(false);
  const [customWeights, setCustomWeights] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please drop a valid PDF file');
    }
  };

  // Prevent default behavior for drag events
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle threshold change
  const handleThresholdChange = (event, newValue) => {
    setThreshold(newValue);
  };

  // Handle AI toggle change
  const handleAIChange = (event) => {
    setUseAI(event.target.checked);
  };

  // Handle weights dialog open
  const handleOpenWeightsDialog = () => {
    setWeightsDialogOpen(true);
  };

  // Handle weights dialog close
  const handleCloseWeightsDialog = () => {
    setWeightsDialogOpen(false);
  };

  // Handle weights save
  const handleSaveWeights = (weights) => {
    setCustomWeights(weights);
    setWeightsDialogOpen(false);
  };

  // Handle file upload and matching
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowAlternatives(false);

    try {
      // Create a data URL for the PDF viewer
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfDataUrl(e.target.result);
      };
      reader.readAsDataURL(file);

      // Create form data
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('threshold', threshold);
      formData.append('useAI', useAI);
      
      // Add custom weights if available
      if (customWeights) {
        formData.append('customWeights', JSON.stringify(customWeights));
      }

      // Send request to API
      const response = await axios.post('/api/match-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Ensure we have extracted fields and filename
      if (!response.data.extractedFields) {
        console.log('No extracted fields in API response for ' + file.name + ', creating default fields');
        
        // Create default extracted fields based on the PDF file
        response.data.extractedFields = {
          focusArea: 'Content from ' + file.name,
          process: 'This PDF does not match the expected form structure. The system has created default fields to display.',
          affected: 'Users working with ' + file.name,
          improvement: 'For better field extraction, use a form with clear section headers like "Focus Area", "Process", etc.',
          howToImprove: 'Upload a PDF that follows the expected form structure or use a form template.'
        };
      }
      
      if (!response.data.pdfFileName) {
        response.data.pdfFileName = file.name;
      }

      // Set result
      console.log('API Response:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('Error matching PDF:', error);
      setError(error.response?.data?.message || 'Failed to match PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle showing alternative candidates
  const handleToggleAlternatives = () => {
    setShowAlternatives(!showAlternatives);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open save dialog
  const handleOpenSaveDialog = () => {
    setSaveDialogOpen(true);
  };

  // Close save dialog
  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          SAP Use Case Matcher
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Upload a PDF form to find the best matching SAP use case
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="pdf matcher tabs">
            <Tab label="Solution Matching" />
            <Tab label="New Use Cases" />
          </Tabs>
        </Box>

        {/* Match PDF Tab */}
        {tabValue === 0 && (
          <Box>
            {/* Template Download Link */}
            <TemplateLink 
              href="/AreaOfImprovement_Empty_Form.pdf" 
              download="SAP_Area_Of_Improvement_Template.pdf"
              underline="none"
              color="primary"
            >
              <DownloadIcon sx={{ mr: 1 }} />
              <Typography variant="body1">Download Empty Form Template</Typography>
            </TemplateLink>

            {/* File Upload Area */}
            <Box sx={{ mt: 2 }}>
              <HiddenInput
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
              />
              <label htmlFor="pdf-upload">
                <UploadBox
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  component="div"
                >
                  {file ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <DescriptionIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h6">{file.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CloudUploadIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h6">Drag & Drop PDF file here</Typography>
                      <Typography variant="body2" color="text.secondary">
                        or click to browse
                      </Typography>
                    </Box>
                  )}
                </UploadBox>
              </label>
            </Box>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}

            {/* Matching Options */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Matching Options</Typography>
                <Button 
                  startIcon={<ExpandMoreIcon 
                    sx={{ 
                      transform: showAdvancedOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: '0.3s'
                    }} 
                  />}
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  size="small"
                >
                  {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </Button>
              </Box>
              
              {/* Basic Options */}
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={useAI}
                      onChange={handleAIChange}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SmartToyIcon sx={{ mr: 1, fontSize: 18 }} />
                      <Typography>Use AI-enhanced matching</Typography>
                    </Box>
                  }
                />
                <Tooltip title="AI-enhanced matching uses advanced NLP techniques to better understand the semantic meaning of your document content">
                  <Box component="span" sx={{ ml: 1, color: 'primary.main', fontSize: '0.85rem' }}>
                    (Recommended)
                  </Box>
                </Tooltip>
              </Box>

              {/* Threshold Slider */}
              <Box sx={{ mt: 2 }}>
                <Typography id="threshold-slider" gutterBottom>
                  Similarity Threshold: {threshold}
                </Typography>
                <Slider
                  value={threshold}
                  onChange={handleThresholdChange}
                  aria-labelledby="threshold-slider"
                  step={0.05}
                  marks
                  min={0}
                  max={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Typography variant="body2" color="text.secondary">
                  Lower values will return matches with less similarity. Higher values require closer matches.
                </Typography>
              </Box>

              {/* Advanced Options */}
              <Collapse in={showAdvancedOptions}>
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>Advanced Configuration</Typography>
                  
                  <Button
                    variant="outlined"
                    startIcon={<TuneIcon />}
                    onClick={handleOpenWeightsDialog}
                    sx={{ mt: 1 }}
                    size="small"
                  >
                    Customize Similarity Weights
                  </Button>
                  
                  {customWeights && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <AlertTitle>Custom Weights Applied</AlertTitle>
                      You are using custom weights for field matching. 
                      Click the button above to modify them.
                    </Alert>
                  )}
                </Box>
              </Collapse>
            </Box>

            {/* Upload Button */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleUpload}
                disabled={!file || loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Matching...' : 'Find Matching Use Case'}
              </Button>
            </Box>

            {/* Results */}
            {result && (
              <ResultCard>
                <CardContent>
                  {result.message ? (
                    // No match found
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ErrorIcon color="warning" sx={{ mr: 1 }} />
                          <Typography variant="h6">{result.message}</Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={handleOpenSaveDialog}
                        >
                          Save as New Use Case
                        </Button>
                      </Box>
                      
                      {/* Alternative candidates button */}
                      {result.alternativeCandidates && result.alternativeCandidates.length > 0 && (
                        <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            startIcon={<CompareArrowsIcon />}
                            onClick={handleToggleAlternatives}
                            size="small"
                          >
                            {showAlternatives ? 'Hide' : 'Show'} Alternative Candidates ({result.alternativeCandidates.length})
                          </Button>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Side-by-side comparison for no match */}
                      <Grid container spacing={3}>
                        {/* Left side: Extracted fields */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>Extracted Fields</Typography>
                          <ExtractedFieldsDisplay extractedFields={result.extractedFields || {}} />
                        </Grid>
                        
                        {/* Right side: Best candidate with improved visualization */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>Best Candidate</Typography>
                          
                          <SimilarityVisualization
                            similarityScore={result.bestCandidate.SimilarityScore}
                            fieldSimilarities={result.bestCandidate.fieldSimilarities}
                            title={getUseCaseField(result.bestCandidate, ['UseCaseName', 'Use Case Name'])}
                            aiEnhanced={result.aiEnhanced}
                            visualizationType="all"
                            matchingMatrix={result.bestCandidate.matchingMatrix}
                          />
                          
                          <Paper elevation={3} sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>Complete Use Case Details</Typography>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">ID:</Typography>
                              <Typography variant="body2">
                                {getUseCaseField(result.bestCandidate, ['UseCaseID', 'Use Case ID'])}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">Mapped Solution:</Typography>
                              <Typography variant="body2">
                                {getUseCaseField(result.bestCandidate, ['MappedSolution', 'Mapped Solution'])}
                              </Typography>
                            </Box>
                            
                            {result.bestCandidate.Challenge && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Challenge:</Typography>
                                <Typography variant="body2">{result.bestCandidate.Challenge}</Typography>
                              </Box>
                            )}
                            
                            {result.bestCandidate.UserRole && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">User Role:</Typography>
                                <Typography variant="body2">{result.bestCandidate.UserRole}</Typography>
                              </Box>
                            )}
                            
                            {result.bestCandidate.Enablers && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Enablers:</Typography>
                                <Typography variant="body2">{result.bestCandidate.Enablers}</Typography>
                              </Box>
                            )}
                            
                            {result.bestCandidate.KeyBenefits && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Key Benefits:</Typography>
                                <Typography variant="body2">{result.bestCandidate.KeyBenefits}</Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      </Grid>
                      
                      {/* Alternative candidates section */}
                      {showAlternatives && result.alternativeCandidates && result.alternativeCandidates.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" gutterBottom>Alternative Candidates</Typography>
                          <Divider sx={{ mb: 3 }} />
                          
                          <Grid container spacing={3}>
                            {result.alternativeCandidates.map((candidate, index) => (
                              <Grid item xs={12} md={6} key={index}>
                                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                                  <Typography variant="subtitle1">
                                    {getUseCaseField(candidate, ['UseCaseName', 'Use Case Name'])}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    ID: {getUseCaseField(candidate, ['UseCaseID', 'Use Case ID'])}
                                  </Typography>
                                  
                                  <Box sx={{ mt: 2, mb: 2 }}>
                                    <BasicSimilarityBar 
                                      score={candidate.SimilarityScore} 
                                      label="Similarity" 
                                    />
                                  </Box>
                                  
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Mapped Solution:</Typography>
                                    <Typography variant="body2" noWrap>
                                      {getUseCaseField(candidate, ['MappedSolution', 'Mapped Solution'])}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Challenge:</Typography>
                                    <Typography variant="body2" noWrap>
                                      {getUseCaseField(candidate, ['Challenge'])}
                                    </Typography>
                                  </Box>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    // Match found
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6">Match Found!</Typography>
                      </Box>
                      
                      {/* Alternative candidates button */}
                      {result.alternativeCandidates && result.alternativeCandidates.length > 0 && (
                        <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            startIcon={<CompareArrowsIcon />}
                            onClick={handleToggleAlternatives}
                            size="small"
                          >
                            {showAlternatives ? 'Hide' : 'Show'} Alternative Matches ({result.alternativeCandidates.length})
                          </Button>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Side-by-side comparison for match found */}
                      <Grid container spacing={3}>
                        {/* Left side: Extracted fields */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>Extracted Fields</Typography>
                          <ExtractedFieldsDisplay extractedFields={result.extractedFields || {}} />
                          
                          {/* PDF viewer */}
                          {pdfDataUrl && (
                            <Box sx={{ mt: 4 }}>
                              <Typography variant="h6" gutterBottom>PDF Preview</Typography>
                              <Paper elevation={1} sx={{ p: 1, height: 300 }}>
                                <PdfViewer file={pdfDataUrl} />
                              </Paper>
                            </Box>
                          )}
                        </Grid>
                        
                        {/* Right side: Matched use case with improved visualization */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>Matched Use Case</Typography>
                          
                          <SimilarityVisualization
                            similarityScore={result.SimilarityScore}
                            fieldSimilarities={result.fieldSimilarities}
                            title={getUseCaseField(result, ['UseCaseName', 'Use Case Name'])}
                            aiEnhanced={result.aiEnhanced}
                            visualizationType="all"
                            matchingMatrix={result.matchingMatrix}
                          />
                          
                          <Paper elevation={3} sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>Complete Use Case Details</Typography>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">ID:</Typography>
                              <Typography variant="body2">
                                {getUseCaseField(result, ['UseCaseID', 'Use Case ID'])}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">Mapped Solution:</Typography>
                              <Typography variant="body2">
                                {getUseCaseField(result, ['MappedSolution', 'Mapped Solution'])}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">Challenge:</Typography>
                              <Typography variant="body2">
                                {getUseCaseField(result, ['Challenge'])}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">User Role:</Typography>
                              <Typography variant="body2">
                                {getUseCaseField(result, ['UserRole', 'User Role'])}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">Enablers:</Typography>
                              <Typography variant="body2">
                                {getUseCaseField(result, ['Enablers'])}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">Key Benefits:</Typography>
                              <Typography variant="body2">
                                {getUseCaseField(result, ['KeyBenefits', 'Key Benefits'])}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                      
                      {/* Alternative matches section */}
                      {showAlternatives && result.alternativeCandidates && result.alternativeCandidates.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" gutterBottom>Alternative Matches</Typography>
                          <Divider sx={{ mb: 3 }} />
                          
                          <Grid container spacing={3}>
                            {result.alternativeCandidates.map((candidate, index) => (
                              <Grid item xs={12} md={6} key={index}>
                                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                                  <Typography variant="subtitle1">
                                    {getUseCaseField(candidate, ['UseCaseName', 'Use Case Name'])}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    ID: {getUseCaseField(candidate, ['UseCaseID', 'Use Case ID'])}
                                  </Typography>
                                  
                                  <Box sx={{ mt: 2, mb: 2 }}>
                                    <BasicSimilarityBar 
                                      score={candidate.SimilarityScore} 
                                      label="Similarity" 
                                    />
                                  </Box>
                                  
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Mapped Solution:</Typography>
                                    <Typography variant="body2" noWrap>
                                      {getUseCaseField(candidate, ['MappedSolution', 'Mapped Solution'])}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Challenge:</Typography>
                                    <Typography variant="body2" noWrap>
                                      {getUseCaseField(candidate, ['Challenge'])}
                                    </Typography>
                                  </Box>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </ResultCard>
            )}

            {/* Save New Use Case Dialog */}
            {result && result.message && (
              <SaveNewUseCaseForm
                open={saveDialogOpen}
                onClose={handleCloseSaveDialog}
                extractedFields={result.extractedFields}
                pdfFileName={result.pdfFileName}
              />
            )}
            
            {/* Similarity Weights Settings Dialog */}
            <SimilarityWeightSettings
              open={weightsDialogOpen}
              onClose={handleCloseWeightsDialog}
              onSave={handleSaveWeights}
            />
          </Box>
        )}

        {/* New Use Cases Tab */}
        {tabValue === 1 && (
          <Box sx={{ height: '800px' }}>
            <NewUseCasesList />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default PdfMatcher;

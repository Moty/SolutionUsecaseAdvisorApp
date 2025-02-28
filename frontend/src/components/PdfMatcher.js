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
  Link
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Import custom components
import PdfViewer from './PdfViewer';
import ExtractedFieldsDisplay from './ExtractedFieldsDisplay';
import SaveNewUseCaseForm from './SaveNewUseCaseForm';
import NewUseCasesList from './NewUseCasesList';

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

/**
 * PdfMatcher Component
 * 
 * This component allows users to upload a PDF file and find the best matching
 * SAP use case based on the content of the PDF.
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

  // Handle file upload and matching
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

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
      console.log('Extracted Fields:', response.data.extractedFields);
      console.log('Original Filename:', response.data.pdfFileName);
      console.log('Has extractedFields property:', response.data.hasOwnProperty('extractedFields'));
      console.log('extractedFields type:', typeof response.data.extractedFields);
      
      if (response.data.extractedFields) {
        console.log('extractedFields keys:', Object.keys(response.data.extractedFields));
        console.log('extractedFields values:', Object.values(response.data.extractedFields));
      } else {
        console.log('extractedFields is null or undefined');
      }
      
      setResult(response.data);
    } catch (error) {
      console.error('Error matching PDF:', error);
      setError(error.response?.data?.message || 'Failed to match PDF. Please try again.');
    } finally {
      setLoading(false);
    }
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

            {/* Threshold Slider */}
            <Box sx={{ mt: 4 }}>
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
              />
              <Typography variant="body2" color="text.secondary">
                Lower values will return matches with less similarity. Higher values require closer matches.
              </Typography>
            </Box>

            {/* Upload Button */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
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
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Side-by-side comparison for no match */}
                      <Grid container spacing={3}>
                        {/* Left side: Extracted fields */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>Extracted Fields</Typography>
                          <ExtractedFieldsDisplay extractedFields={result.extractedFields || {}} />
                        </Grid>
                        
                        {/* Right side: Best candidate */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>Best Candidate</Typography>
                          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6">{result.bestCandidate.UseCaseName}</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              ID: {result.bestCandidate.UseCaseID}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle1">Similarity Score:</Typography>
                              <Typography variant="body1">{result.bestCandidate.SimilarityScore}</Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle1">Mapped Solution:</Typography>
                              <Typography variant="body1">{result.bestCandidate.MappedSolution}</Typography>
                            </Box>
                            {result.bestCandidate.Challenge && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Challenge:</Typography>
                                <Typography variant="body1">{result.bestCandidate.Challenge}</Typography>
                              </Box>
                            )}
                            {result.bestCandidate.UserRole && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">User Role:</Typography>
                                <Typography variant="body1">{result.bestCandidate.UserRole}</Typography>
                              </Box>
                            )}
                            {result.bestCandidate.ValueDrivers && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Value Drivers:</Typography>
                                <Typography variant="body1">{result.bestCandidate.ValueDrivers}</Typography>
                              </Box>
                            )}
                            {result.bestCandidate.Enablers && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Enablers:</Typography>
                                <Typography variant="body1">{result.bestCandidate.Enablers}</Typography>
                              </Box>
                            )}
                            {result.bestCandidate.BaselineWithoutAI && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Baseline without AI:</Typography>
                                <Typography variant="body1">{result.bestCandidate.BaselineWithoutAI}</Typography>
                              </Box>
                            )}
                            {result.bestCandidate.NewWorldWithAI && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">New World (with AI):</Typography>
                                <Typography variant="body1">{result.bestCandidate.NewWorldWithAI}</Typography>
                              </Box>
                            )}
                            {result.bestCandidate.KeyBenefits && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Key Benefits:</Typography>
                                <Typography variant="body1">{result.bestCandidate.KeyBenefits}</Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    // Match found
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6">Match Found!</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Side-by-side comparison for match found */}
                      <Grid container spacing={3}>
                        {/* Left side: Extracted fields */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>Extracted Fields</Typography>
                          <ExtractedFieldsDisplay extractedFields={result.extractedFields || {}} />
                        </Grid>
                        
                        {/* Right side: Matched use case */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>Matched Use Case</Typography>
                          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6">{result.UseCaseName}</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              ID: {result.UseCaseID}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle1">Similarity Score:</Typography>
                              <Typography variant="body1">{result.SimilarityScore}</Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle1">Mapped Solution:</Typography>
                              <Typography variant="body1">{result.MappedSolution}</Typography>
                            </Box>
                            {result.Challenge && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Challenge:</Typography>
                                <Typography variant="body1">{result.Challenge}</Typography>
                              </Box>
                            )}
                            {result.UserRole && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">User Role:</Typography>
                                <Typography variant="body1">{result.UserRole}</Typography>
                              </Box>
                            )}
                            {result.ValueDrivers && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Value Drivers:</Typography>
                                <Typography variant="body1">{result.ValueDrivers}</Typography>
                              </Box>
                            )}
                            {result.Enablers && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Enablers:</Typography>
                                <Typography variant="body1">{result.Enablers}</Typography>
                              </Box>
                            )}
                            {result.BaselineWithoutAI && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Baseline without AI:</Typography>
                                <Typography variant="body1">{result.BaselineWithoutAI}</Typography>
                              </Box>
                            )}
                            {result.NewWorldWithAI && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">New World (with AI):</Typography>
                                <Typography variant="body1">{result.NewWorldWithAI}</Typography>
                              </Box>
                            )}
                            {result.KeyBenefits && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Key Benefits:</Typography>
                                <Typography variant="body1">{result.KeyBenefits}</Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      </Grid>
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

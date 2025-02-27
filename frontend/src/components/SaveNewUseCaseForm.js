import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import axios from 'axios';

/**
 * SaveNewUseCaseForm Component
 * 
 * This component provides a form for saving an unmatched use case to the repository.
 * It allows users to edit the extracted fields and provide additional information.
 */
const SaveNewUseCaseForm = ({ open, onClose, extractedFields, pdfFileName }) => {
  // Initialize form state with extracted fields
  const [formData, setFormData] = useState({
    useCaseName: '',
    userRole: extractedFields?.affected || '',
    challenge: extractedFields?.improvement || '',
    enablers: '',
    keyBenefits: '',
    mappedSolution: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare data for API
      const payload = {
        extractedFields: extractedFields,
        mappedFields: {
          UseCaseName: formData.useCaseName,
          UserRole: formData.userRole,
          Challenge: formData.challenge,
          Enablers: formData.enablers,
          KeyBenefits: formData.keyBenefits,
          MappedSolution: formData.mappedSolution
        },
        pdfFileName: pdfFileName
      };

      // Send request to API
      await axios.post('/api/new-use-cases', payload);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving new use case:', error);
      setError(error.response?.data?.message || 'Failed to save new use case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Save as New Use Case</DialogTitle>
      
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ my: 2 }}>
            New use case saved successfully!
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              Extracted Fields
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Focus Area"
                  fullWidth
                  value={extractedFields?.focusArea || ''}
                  disabled
                  variant="filled"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Process/Activity"
                  fullWidth
                  value={extractedFields?.process || ''}
                  disabled
                  variant="filled"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Affected Users"
                  fullWidth
                  value={extractedFields?.affected || ''}
                  disabled
                  variant="filled"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Improvement Reason"
                  fullWidth
                  value={extractedFields?.improvement || ''}
                  disabled
                  variant="filled"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="How to Improve"
                  fullWidth
                  value={extractedFields?.howToImprove || ''}
                  disabled
                  variant="filled"
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
            
            <Typography variant="subtitle1" gutterBottom>
              Mapped Use Case Fields
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="useCaseName"
                  label="Use Case Name"
                  fullWidth
                  required
                  value={formData.useCaseName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="userRole"
                  label="User Role"
                  fullWidth
                  required
                  value={formData.userRole}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="mappedSolution"
                  label="Mapped Solution"
                  fullWidth
                  required
                  value={formData.mappedSolution}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="challenge"
                  label="Challenge"
                  fullWidth
                  required
                  value={formData.challenge}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="enablers"
                  label="Enablers"
                  fullWidth
                  required
                  value={formData.enablers}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="keyBenefits"
                  label="Key Benefits"
                  fullWidth
                  required
                  value={formData.keyBenefits}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        {!success && (
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Use Case'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SaveNewUseCaseForm;

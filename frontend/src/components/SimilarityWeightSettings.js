import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Slider,
  Stack,
  Typography,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import axios from 'axios';

/**
 * Component for configuring similarity weights for PDF matching
 * 
 * Allows users to customize how much each field should contribute to 
 * the overall similarity score when matching PDFs to use cases.
 */
const SimilarityWeightSettings = ({ open, onClose, onSave }) => {
  // Weights must sum to 1.0
  const [weights, setWeights] = useState({
    focusArea: 0.15,
    process: 0.25,
    affected: 0.15,
    improvement: 0.20,
    howToImprove: 0.25
  });
  
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current weights from the server
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setError(null);
      
      axios.get('/api/similarity-weights')
        .then(response => {
          setWeights(response.data.weights);
          setIsDefault(response.data.isDefault);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error loading similarity weights:', err);
          setError('Failed to load current weights. Please try again.');
          setIsLoading(false);
        });
    }
  }, [open]);

  // Calculate the remaining weight for the current field
  const calculateRemainingWeight = (field) => {
    const sum = Object.entries(weights)
      .filter(([key]) => key !== field)
      .reduce((acc, [_, value]) => acc + value, 0);
    
    return Math.max(0, Math.min(1 - sum, 1));
  };

  // Handle weight change
  const handleWeightChange = (field, value) => {
    // Ensure value is within valid range (0-1)
    value = Math.max(0, Math.min(value, calculateRemainingWeight(field) + weights[field]));
    
    // Update the weight for this field
    const newWeights = { ...weights, [field]: value };
    
    // Distribute the remaining weight proportionally among other fields
    const oldSum = Object.values(weights).reduce((a, b) => a + b, 0);
    const newSum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    const diff = newSum - oldSum;
    
    if (diff !== 0) {
      // Calculate how much we need to adjust other weights
      const totalOtherWeights = oldSum - weights[field];
      
      if (totalOtherWeights > 0) {
        // Distribute the difference proportionally
        Object.keys(newWeights).forEach(key => {
          if (key !== field) {
            const proportion = weights[key] / totalOtherWeights;
            newWeights[key] = Math.max(0.01, weights[key] - (diff * proportion));
          }
        });
      }
    }
    
    // Ensure the sum is exactly 1.0
    const finalSum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(finalSum - 1) > 0.001) {
      // Find the largest weight that's not the current field and adjust it
      const largestField = Object.entries(newWeights)
        .filter(([key]) => key !== field)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
      
      if (largestField) {
        newWeights[largestField] += (1 - finalSum);
      }
    }
    
    // Update the weights
    setWeights(newWeights);
    setIsDefault(false);
  };

  // Reset weights to default
  const handleReset = () => {
    setWeights({
      focusArea: 0.15,
      process: 0.25,
      affected: 0.15,
      improvement: 0.20,
      howToImprove: 0.25
    });
    setIsDefault(true);
  };

  // Save the weights
  const handleSave = async () => {
    try {
      setError(null);
      const response = await axios.post('/api/similarity-weights', { weights });
      
      if (response.data.success) {
        if (onSave) {
          onSave(weights);
        }
        onClose();
      } else {
        setError('Failed to save weights: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving similarity weights:', err);
      setError('Failed to save weights. Please try again.');
    }
  };

  // Format the value as a percentage
  const valueFormatter = (value) => `${Math.round(value * 100)}%`;

  // Field labels and descriptions
  const fieldInfo = {
    focusArea: {
      label: 'Focus Area',
      description: 'Weight for matching the focus area (maps to "Mapped Solution" field)'
    },
    process: {
      label: 'Process/Activity',
      description: 'Weight for matching the process description (maps to "Challenge" field)'
    },
    affected: {
      label: 'Affected Roles',
      description: 'Weight for matching who is affected (maps to "User Role" field)'
    },
    improvement: {
      label: 'Improvement Need',
      description: 'Weight for matching improvement needs (maps to "Enablers" field)'
    },
    howToImprove: {
      label: 'How to Improve',
      description: 'Weight for matching improvement methods (maps to "Key Benefits" field)'
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="similarity-weights-dialog-title"
    >
      <DialogTitle id="similarity-weights-dialog-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Customize Similarity Weights</Typography>
          <Tooltip title="Reset to Default Values">
            <IconButton onClick={handleReset} color="primary">
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Adjust how much each form field contributes to the overall similarity score when matching PDFs to use cases. 
          The total of all weights must equal 100%.
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <Typography>Loading current weights...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {Object.entries(weights).map(([field, value]) => (
              <Grid item xs={12} key={field}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">{fieldInfo[field].label}</Typography>
                    <Tooltip title={fieldInfo[field].description}>
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="h6">{valueFormatter(value)}</Typography>
                  </Box>
                  
                  <Slider
                    value={value}
                    onChange={(_, newValue) => handleWeightChange(field, newValue)}
                    step={0.01}
                    min={0.01}
                    max={1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueFormatter}
                  />
                </Paper>
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="h6">
                    {valueFormatter(Object.values(weights).reduce((a, b) => a + b, 0))}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={isLoading || Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) > 0.01}
        >
          Save Weights
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimilarityWeightSettings;
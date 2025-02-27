import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Chip
} from '@mui/material';

/**
 * ExtractedFieldsDisplay Component
 * 
 * This component displays the fields extracted from a PDF file.
 * It shows each field with a label and its extracted value.
 */
const ExtractedFieldsDisplay = ({ extractedFields = {} }) => {
  // Check if extractedFields is empty
  const hasExtractedFields = extractedFields && 
    Object.values(extractedFields).some(value => value && value.trim() !== '');
  
  // If no fields are provided or all fields are empty, show a message
  if (!hasExtractedFields) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom align="center">
          Extracted Fields
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
          <Typography color="text.secondary">
            No fields extracted from the PDF
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Field labels for display
  const fieldLabels = {
    focusArea: 'Focus Area',
    process: 'Process/Activity',
    affected: 'Affected Users',
    improvement: 'Improvement Reason',
    howToImprove: 'How to Improve'
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom align="center">
        Extracted Fields
      </Typography>
      
      <List sx={{ width: '100%', flex: 1, overflow: 'auto' }}>
        {Object.entries(extractedFields).map(([key, value], index) => (
          <React.Fragment key={key}>
            {index > 0 && <Divider component="li" />}
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Chip 
                      label={fieldLabels[key] || key} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {value || 'Not found'}
                  </Typography>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default ExtractedFieldsDisplay;

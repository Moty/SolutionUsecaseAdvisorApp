import React from 'react';
import { 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Divider, 
  Paper, 
  Button,
  Chip,
  Tooltip
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

/**
 * FilterHistoryPanel component for displaying and applying previous filter combinations
 * @param {Object} props - Component props
 * @param {Array} props.history - Array of filter history items
 * @param {Function} props.onApplyFilter - Handler for applying a filter from history
 * @param {Function} props.onClose - Handler for closing the panel
 */
const FilterHistoryPanel = ({ 
  history = [], 
  onApplyFilter, 
  onClose 
}) => {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Format filter for display
  const formatFilter = (filter) => {
    const parts = [];
    
    if (filter.role) {
      parts.push(`Role: ${filter.role}`);
    }
    
    if (filter.module) {
      parts.push(`Module: ${filter.module}`);
    }
    
    if (filter.keyword) {
      parts.push(`Keyword: ${filter.keyword}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'All solutions';
  };
  
  return (
    <Box sx={{ width: 320, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Filter History</Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close panel">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {history.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SentimentDissatisfiedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No filter history yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Your filter combinations will appear here.
          </Typography>
        </Box>
      ) : (
        <List>
          {history.map((item, index) => (
            <React.Fragment key={item.id || index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle2" component="span">
                        {item.name || `Filter ${index + 1}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {formatDate(item.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" component="span">
                        {formatFilter(item.filters)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {item.filters.role && (
                          <Chip 
                            label={`Role: ${item.filters.role}`} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        )}
                        {item.filters.module && (
                          <Chip 
                            label={`Module: ${item.filters.module}`} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        )}
                        {item.filters.keyword && (
                          <Chip 
                            label={`Keyword: ${item.filters.keyword}`} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Apply this filter">
                    <IconButton 
                      edge="end" 
                      aria-label="apply filter" 
                      onClick={() => {
                        onApplyFilter(item);
                        onClose();
                      }}
                    >
                      <RestoreIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
              {index < history.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FilterHistoryPanel;

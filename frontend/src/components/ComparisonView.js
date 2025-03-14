import React from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Divider,
  Card,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

/**
 * ComparisonView component for side-by-side comparison of solutions
 * @param {Object} props - Component props
 * @param {Array} props.solutions - Array of solution objects to compare
 * @param {Function} props.onRemoveFromComparison - Handler for removing a solution from comparison
 * @param {Array} props.favorites - Array of favorite solution IDs
 * @param {Function} props.onToggleFavorite - Handler for toggling favorite status
 */
const ComparisonView = ({ 
  solutions = [],
  onRemoveFromComparison,
  favorites = [],
  onToggleFavorite,
  matchResult
}) => {
  // If no solutions are selected for comparison, display a message
  if (!solutions || solutions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h6" color="text.secondary">
          No solutions selected for comparison
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Select solutions to compare by clicking the compare icon on solution cards.
        </Typography>
      </Box>
    );
  }
  
  // Extract module from Use Case ID
  const getModule = (useCaseId) => {
    return useCaseId.split('_')[0];
  };
  
  // Define comparison attributes
  const comparisonAttributes = [
    { label: 'Solution Name', key: 'Use Case Name' },
    { label: 'Module', key: '_module', custom: true },
    { label: 'User Role', key: 'User Role' },
    { label: 'Challenge', key: 'Challenge' },
    { label: 'Value Drivers', key: 'Value Drivers' },
    { label: 'Enablers', key: 'Enablers' },
    { label: 'Baseline without AI', key: 'Baseline without AI' },
    { label: 'New World (with AI)', key: 'New World (with AI)' },
    { label: 'Key Benefits', key: 'Key Benefits' },
    { label: 'Mapped Solution', key: 'Mapped Solution' }
  ];
  
  const PillarScoreDisplay = ({ pillarName, pillarData }) => {
    const score = (pillarData.score * 100).toFixed(1);
    const getScoreColor = (score) => {
      if (score >= 80) return 'success';
      if (score >= 60) return 'warning';
      return 'error';
    };
  
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          {pillarName.charAt(0).toUpperCase() + pillarName.slice(1)}
          <Chip 
            label={`${score}%`}
            color={getScoreColor(score)}
            size="small"
            sx={{ ml: 1 }}
          />
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Main Field"
              secondary={`${pillarData.details.mainField.extractedValue} → ${pillarData.details.mainField.matchedValue}`}
            />
          </ListItem>
          {Object.entries(pillarData.details.relatedFields).map(([field, score]) => (
            <ListItem key={field}>
              <ListItemText 
                primary={field.charAt(0).toUpperCase() + field.slice(1)}
                secondary={`Similarity: ${(score * 100).toFixed(1)}%`}
              />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    );
  };
  
  // Check if we have match result data available
  const hasMatchData = matchResult && matchResult.pillarSimilarities;
  
  // Data for match scoring section
  let overallScore = "N/A";
  if (hasMatchData) {
    overallScore = (matchResult.similarityScore * 100).toFixed(1);
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CompareArrowsIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          Solution Comparison ({solutions.length})
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Compare key attributes of selected solutions side by side. You can add up to 3 solutions for comparison.
      </Alert>
      
      {/* Solution headers with action buttons */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {solutions.map((solution) => {
          const useCaseId = solution['Use Case ID'];
          const isFavorite = favorites.includes(useCaseId);
          
          return (
            <Grid item xs={12} md={12 / solutions.length} key={useCaseId}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  position: 'relative',
                  minHeight: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <IconButton 
                  size="small" 
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => onRemoveFromComparison(useCaseId)}
                  aria-label="Remove from comparison"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {solution['Use Case Name']}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Chip 
                    label={getModule(useCaseId)} 
                    size="small" 
                    color="primary" 
                  />
                  
                  <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                    <IconButton 
                      size="small" 
                      color={isFavorite ? "secondary" : "default"}
                      onClick={() => onToggleFavorite(useCaseId)}
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFavorite ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      
      {/* Comparison table */}
      <TableContainer component={Paper} elevation={2} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Attribute</TableCell>
              {solutions.map((solution) => (
                <TableCell key={solution['Use Case ID']} sx={{ width: `${80 / solutions.length}%` }}>
                  {solution['Use Case ID']}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonAttributes.map((attr) => (
              <TableRow key={attr.key} hover>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                  {attr.label}
                </TableCell>
                {solutions.map((solution) => {
                  let value;
                  
                  if (attr.custom) {
                    // Handle custom attributes
                    if (attr.key === '_module') {
                      value = getModule(solution['Use Case ID']);
                    } else {
                      value = 'N/A';
                    }
                  } else {
                    value = solution[attr.key] || 'N/A';
                  }
                  
                  return (
                    <TableCell key={`${solution['Use Case ID']}-${attr.key}`}>
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Match scoring section - only show if we have match data */}
      {hasMatchData ? (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Overall Match: {overallScore}%
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {Object.entries(matchResult.pillarSimilarities).map(([pillar, data]) => (
            <PillarScoreDisplay key={pillar} pillarName={pillar} pillarData={data} />
          ))}
        </Card>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          No similarity matching data is available for these solutions.
        </Alert>
      )}
    </Box>
  );
};

export default ComparisonView;

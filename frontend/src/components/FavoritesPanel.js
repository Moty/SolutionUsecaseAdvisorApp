import React from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper,
  Alert,
  Divider
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

// Import the SolutionCard component from RecommendationList
// We're importing it directly to avoid circular dependencies
import { SolutionCard } from './RecommendationList';

/**
 * FavoritesPanel component to display favorite solutions
 * @param {Object} props - Component props
 * @param {Array} props.solutions - Array of favorite solution objects
 * @param {Function} props.onToggleFavorite - Handler for toggling favorite status
 * @param {Object} props.annotations - Object mapping solution IDs to annotations
 * @param {Function} props.onSaveAnnotation - Handler for saving annotations
 * @param {Object} props.ratings - Object mapping solution IDs to ratings
 * @param {Function} props.onSaveRating - Handler for saving ratings
 * @param {Array} props.selectedForComparison - Array of solution IDs selected for comparison
 * @param {Function} props.onToggleComparison - Handler for toggling comparison selection
 */
const FavoritesPanel = ({ 
  solutions = [],
  onToggleFavorite,
  annotations = {},
  onSaveAnnotation,
  ratings = {},
  onSaveRating,
  selectedForComparison = [],
  onToggleComparison
}) => {
  // If no favorites, display a message
  if (!solutions || solutions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <SentimentDissatisfiedIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No favorites yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Click the star icon on any solution card to add it to your favorites.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <StarIcon color="secondary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          Favorite Solutions ({solutions.length})
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        These are your saved favorite solutions. You can remove items from favorites by clicking the star icon.
      </Alert>
      
      <Grid container spacing={2}>
        {solutions.map((solution) => {
          const useCaseId = solution['Use Case ID'];
          return (
            <Grid item xs={12} key={useCaseId}>
              <SolutionCard 
                solution={solution}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                annotation={annotations[useCaseId] || ''}
                onSaveAnnotation={onSaveAnnotation}
                rating={ratings[useCaseId]}
                onSaveRating={onSaveRating}
                isSelectedForComparison={selectedForComparison.includes(useCaseId)}
                onToggleComparison={onToggleComparison}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default FavoritesPanel;

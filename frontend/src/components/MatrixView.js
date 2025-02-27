import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

// Import components
import SolutionTile from './SolutionTile';
import SolutionDetailModal from './SolutionDetailModal';

/**
 * MatrixView component to display solutions in a grid layout
 * @param {Object} props - Component props
 * @param {Array} props.solutions - Array of solution objects to display
 * @param {Array} props.favorites - Array of favorite solution IDs
 * @param {Function} props.onToggleFavorite - Handler for toggling favorite status
 * @param {Object} props.annotations - Object mapping solution IDs to annotations
 * @param {Function} props.onSaveAnnotation - Handler for saving annotations
 * @param {Object} props.ratings - Object mapping solution IDs to ratings
 * @param {Object} props.ratingsSummary - Object with aggregated ratings data
 * @param {Function} props.onSaveRating - Handler for saving ratings
 * @param {Array} props.selectedForComparison - Array of solution IDs selected for comparison
 * @param {Function} props.onToggleComparison - Handler for toggling comparison selection
 */
const MatrixView = ({ 
  solutions,
  favorites = [],
  onToggleFavorite = () => {},
  annotations = {},
  onSaveAnnotation = () => {},
  ratings = {},
  ratingsSummary = {},
  onSaveRating = () => {},
  selectedForComparison = [],
  onToggleComparison = () => {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for the selected solution to show in the detail modal
  const [selectedSolution, setSelectedSolution] = useState(null);
  
  // If no solutions are found, display a message
  if (!solutions || solutions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h6" color="text.secondary">
          No solutions found matching your criteria.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your filters to see more results.
        </Typography>
      </Box>
    );
  }
  
  // Handle opening the detail modal
  const handleOpenDetail = (solution) => {
    setSelectedSolution(solution);
  };
  
  // Handle closing the detail modal
  const handleCloseDetail = () => {
    setSelectedSolution(null);
  };
  
  // Handle rating click
  const handleRateClick = (solution) => {
    setSelectedSolution(solution);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ViewModuleIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          Solution Tiles ({solutions.length})
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {solutions.map((solution) => {
          const useCaseId = solution['Use Case ID'];
          return (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              key={useCaseId}
            >
              <SolutionTile 
                solution={solution}
                isFavorite={favorites.includes(useCaseId)}
                onToggleFavorite={onToggleFavorite}
                isSelectedForComparison={selectedForComparison.includes(useCaseId)}
                onToggleComparison={onToggleComparison}
                ratingSummary={ratingsSummary[useCaseId]}
                onRateClick={() => handleRateClick(solution)}
                onClick={() => handleOpenDetail(solution)}
              />
            </Grid>
          );
        })}
      </Grid>
      
      {/* Solution Detail Modal */}
      {selectedSolution && (
        <SolutionDetailModal
          solution={selectedSolution}
          open={!!selectedSolution}
          onClose={handleCloseDetail}
          isFavorite={favorites.includes(selectedSolution['Use Case ID'])}
          onToggleFavorite={onToggleFavorite}
          isSelectedForComparison={selectedForComparison.includes(selectedSolution['Use Case ID'])}
          onToggleComparison={onToggleComparison}
          annotation={annotations[selectedSolution['Use Case ID']] || ''}
          onSaveAnnotation={onSaveAnnotation}
          rating={ratings[selectedSolution['Use Case ID']]}
          ratingSummary={ratingsSummary[selectedSolution['Use Case ID']]}
          onSaveRating={onSaveRating}
        />
      )}
    </Box>
  );
};

export default MatrixView;

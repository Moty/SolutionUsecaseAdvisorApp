import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Collapse, 
  Divider,
  useMediaQuery,
  useTheme,
  IconButton,
  TextField,
  Rating,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ListAltIcon from '@mui/icons-material/ListAlt';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import FeedbackIcon from '@mui/icons-material/Feedback';

/**
 * RecommendationList component to display filtered SAP solutions
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
const RecommendationList = ({ 
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
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ListAltIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          Recommended Solutions ({solutions.length})
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {solutions.map((solution) => {
          const useCaseId = solution['Use Case ID'];
          return (
            <Grid item xs={12} key={useCaseId}>
              <SolutionCard 
                solution={solution} 
                isMobile={isMobile}
                isFavorite={favorites.includes(useCaseId)}
                onToggleFavorite={onToggleFavorite}
                annotation={annotations[useCaseId] || ''}
                onSaveAnnotation={onSaveAnnotation}
                rating={ratings[useCaseId]}
                ratingSummary={ratingsSummary[useCaseId]}
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

/**
 * SolutionCard component to display individual solution details
 * @param {Object} props - Component props
 * @param {Object} props.solution - Solution data to display
 * @param {boolean} props.isMobile - Whether the viewport is mobile size
 * @param {boolean} props.isFavorite - Whether this solution is a favorite
 * @param {Function} props.onToggleFavorite - Handler for toggling favorite status
 * @param {string} props.annotation - Annotation text for this solution
 * @param {Function} props.onSaveAnnotation - Handler for saving annotations
 * @param {Object} props.rating - Rating data for this solution
 * @param {Object} props.ratingSummary - Aggregated rating data for this solution
 * @param {Function} props.onSaveRating - Handler for saving ratings
 * @param {boolean} props.isSelectedForComparison - Whether this solution is selected for comparison
 * @param {Function} props.onToggleComparison - Handler for toggling comparison selection
 */
const SolutionCard = ({ 
  solution, 
  isMobile,
  isFavorite = false,
  onToggleFavorite = () => {},
  annotation = '',
  onSaveAnnotation = () => {},
  rating = null,
  ratingSummary = null,
  onSaveRating = () => {},
  isSelectedForComparison = false,
  onToggleComparison = () => {}
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [annotationText, setAnnotationText] = useState(annotation);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(rating ? rating.rating : 0);
  const [feedbackText, setFeedbackText] = useState(rating ? rating.feedback : '');
  
  // Extract module from Use Case ID
  const getModule = (useCaseId) => {
    if (!useCaseId) return 'Unknown';
    const parts = useCaseId.split('_');
    return parts.length > 0 ? parts[0] : 'Unknown';
  };
  
  // Toggle expanded state
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (solution && solution['Use Case ID']) {
      onToggleFavorite(solution['Use Case ID']);
    }
  };
  
  // Handle comparison toggle
  const handleComparisonToggle = () => {
    if (solution && solution['Use Case ID']) {
      onToggleComparison(solution['Use Case ID']);
    }
  };
  
  // Handle annotation editing
  const handleStartEditingAnnotation = () => {
    setAnnotationText(annotation);
    setIsEditingAnnotation(true);
  };
  
  const handleSaveAnnotation = () => {
    onSaveAnnotation(solution['Use Case ID'], annotationText);
    setIsEditingAnnotation(false);
  };
  
  const handleCancelEditingAnnotation = () => {
    setAnnotationText(annotation);
    setIsEditingAnnotation(false);
  };
  
  // Handle rating dialog
  const handleOpenRatingDialog = () => {
    setRatingValue(rating ? rating.rating : 0);
    setFeedbackText(rating ? rating.feedback : '');
    setIsRatingDialogOpen(true);
  };
  
  const handleCloseRatingDialog = () => {
    setIsRatingDialogOpen(false);
  };
  
  const handleSaveRating = () => {
    onSaveRating(solution['Use Case ID'], ratingValue, feedbackText);
    setIsRatingDialogOpen(false);
  };
  
  return (
    <Card elevation={2} sx={{ overflow: 'visible', position: 'relative' }}>
      {/* Action buttons in top-right corner */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1, zIndex: 1 }}>
        {/* Favorite button */}
        <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
          <IconButton 
            size="small" 
            color={isFavorite ? "secondary" : "default"}
            onClick={handleFavoriteToggle}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Tooltip>
        
        {/* Compare button */}
        <Tooltip title={isSelectedForComparison ? "Remove from comparison" : "Add to comparison"}>
          <IconButton 
            size="small" 
            color={isSelectedForComparison ? "primary" : "default"}
            onClick={handleComparisonToggle}
            aria-label={isSelectedForComparison ? "Remove from comparison" : "Add to comparison"}
          >
            <CompareArrowsIcon />
          </IconButton>
        </Tooltip>
        
        {/* Rating button */}
        <Tooltip title="Rate this solution">
          <IconButton 
            size="small" 
            onClick={handleOpenRatingDialog}
            aria-label="Rate this solution"
          >
            <FeedbackIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <CardContent sx={{ pb: 1, pt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 1 }}>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, pr: 8 }}>
            {solution['Use Case Name']}
          </Typography>
          <Chip 
            label={getModule(solution && solution['Use Case ID'])} 
            size="small" 
            color="primary" 
            sx={{ fontWeight: 500 }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>ID:</strong> {solution && solution['Use Case ID'] ? solution['Use Case ID'] : 'N/A'} | <strong>Role:</strong> {solution && solution['User Role'] ? solution['User Role'] : 'N/A'}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Challenge:</strong> {solution && solution['Challenge'] ? solution['Challenge'] : 'N/A'}
        </Typography>
        
        <Typography variant="body2">
          <strong>Key Benefit:</strong> {solution && solution['Key Benefits'] ? solution['Key Benefits'] : 'N/A'}
        </Typography>
        
        {/* Display rating summary if available */}
        {ratingSummary && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Average Rating:
            </Typography>
            <Rating 
              value={ratingSummary.average || 0} 
              precision={0.5} 
              readOnly 
              size="small" 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({ratingSummary.count || 0} ratings)
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Button
          size="small"
          onClick={handleExpandClick}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      </CardActions>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Value Drivers:</strong> {solution && solution['Value Drivers'] ? solution['Value Drivers'] : 'N/A'}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Enablers:</strong> {solution && solution['Enablers'] ? solution['Enablers'] : 'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Baseline without AI:</strong> {solution && solution['Baseline without AI'] ? solution['Baseline without AI'] : 'N/A'}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>New World (with AI):</strong> {solution && solution['New World (with AI)'] ? solution['New World (with AI)'] : 'N/A'}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Mapped Solution:</strong> {solution && solution['Mapped Solution'] ? solution['Mapped Solution'] : 'N/A'}
              </Typography>
            </Grid>
            
            {/* Annotations section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  Personal Notes
                </Typography>
                {!isEditingAnnotation ? (
                  <IconButton 
                    size="small" 
                    onClick={handleStartEditingAnnotation}
                    aria-label="Edit notes"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={handleSaveAnnotation}
                      aria-label="Save notes"
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={handleCancelEditingAnnotation}
                      aria-label="Cancel editing"
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              
              {isEditingAnnotation ? (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Add your notes here..."
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                />
              ) : (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    minHeight: '80px', 
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    fontStyle: annotation ? 'normal' : 'italic',
                    color: annotation ? 'text.primary' : 'text.secondary'
                  }}
                >
                  {annotation || "No notes added yet. Click the edit button to add your notes."}
                </Paper>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
      
      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onClose={handleCloseRatingDialog}>
        <DialogTitle>Rate this Solution</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {solution && solution['Use Case Name'] ? solution['Use Case Name'] : 'Unnamed Solution'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography component="legend" sx={{ mr: 2 }}>Your Rating:</Typography>
              <Rating
                name="solution-rating"
                value={ratingValue}
                onChange={(event, newValue) => {
                  setRatingValue(newValue);
                }}
              />
            </Box>
            <TextField
              fullWidth
              label="Feedback (Optional)"
              multiline
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              variant="outlined"
              placeholder="Share your thoughts about this solution..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRatingDialog}>Cancel</Button>
          <Button onClick={handleSaveRating} variant="contained" color="primary">
            Save Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

// Export SolutionCard component for use in other components
export { SolutionCard };

export default RecommendationList;

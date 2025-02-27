import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Typography, 
  Box,
  Grid,
  Chip,
  Divider,
  TextField,
  Paper,
  Rating,
  Button,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * SolutionDetailModal component to display full solution details in a modal
 * @param {Object} props - Component props
 * @param {Object} props.solution - Solution data to display
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {boolean} props.isFavorite - Whether this solution is a favorite
 * @param {Function} props.onToggleFavorite - Handler for toggling favorite status
 * @param {boolean} props.isSelectedForComparison - Whether this solution is selected for comparison
 * @param {Function} props.onToggleComparison - Handler for toggling comparison selection
 * @param {string} props.annotation - Annotation text for this solution
 * @param {Function} props.onSaveAnnotation - Handler for saving annotations
 * @param {Object} props.rating - Rating data for this solution
 * @param {Object} props.ratingSummary - Aggregated rating data for this solution
 * @param {Function} props.onSaveRating - Handler for saving ratings
 */
const SolutionDetailModal = ({ 
  solution,
  open,
  onClose,
  isFavorite = false,
  onToggleFavorite = () => {},
  isSelectedForComparison = false,
  onToggleComparison = () => {},
  annotation = '',
  onSaveAnnotation = () => {},
  rating = null,
  ratingSummary = null,
  onSaveRating = () => {}
}) => {
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [annotationText, setAnnotationText] = useState(annotation);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(rating ? rating.rating : 0);
  const [feedbackText, setFeedbackText] = useState(rating ? rating.feedback : '');
  
  // Extract module from Use Case ID
  const getModule = (useCaseId) => {
    return useCaseId ? useCaseId.split('_')[0] : '';
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    onToggleFavorite(solution['Use Case ID']);
  };
  
  // Handle comparison toggle
  const handleComparisonToggle = () => {
    onToggleComparison(solution['Use Case ID']);
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
  
  // Handle rating
  const handleOpenRating = () => {
    setRatingValue(rating ? rating.rating : 0);
    setFeedbackText(rating ? rating.feedback : '');
    setIsRatingOpen(true);
  };
  
  const handleCloseRating = () => {
    setIsRatingOpen(false);
  };
  
  const handleSaveRating = () => {
    onSaveRating(solution['Use Case ID'], ratingValue, feedbackText);
    setIsRatingOpen(false);
  };
  
  // If no solution is provided, don't render anything
  if (!solution) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      scroll="paper"
      aria-labelledby="solution-detail-title"
    >
      <DialogTitle id="solution-detail-title" sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
            {solution['Use Case Name']}
          </Typography>
          <Chip 
            label={getModule(solution['Use Case ID'])} 
            size="small" 
            color="primary" 
            sx={{ fontWeight: 500 }}
          />
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>ID:</strong> {solution['Use Case ID']} | <strong>Role:</strong> {solution['User Role']}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Favorite button */}
            <IconButton 
              size="small" 
              color={isFavorite ? "secondary" : "default"}
              onClick={handleFavoriteToggle}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
            
            {/* Compare button */}
            <IconButton 
              size="small" 
              color={isSelectedForComparison ? "primary" : "default"}
              onClick={handleComparisonToggle}
              aria-label={isSelectedForComparison ? "Remove from comparison" : "Add to comparison"}
            >
              <CompareArrowsIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Challenge:</strong> {solution['Challenge']}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Key Benefits:</strong> {solution['Key Benefits']}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Value Drivers:</strong> {solution['Value Drivers']}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Enablers:</strong> {solution['Enablers']}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Baseline without AI:</strong> {solution['Baseline without AI']}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>New World (with AI):</strong> {solution['New World (with AI)']}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Mapped Solution:</strong> {solution['Mapped Solution']}
            </Typography>
          </Grid>
          
          {/* Rating summary if available */}
          {ratingSummary && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
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
                
                <Button 
                  size="small" 
                  onClick={handleOpenRating}
                  variant="outlined"
                >
                  Rate This Solution
                </Button>
              </Box>
            </Grid>
          )}
          
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
        
        {/* Rating Dialog */}
        <Dialog open={isRatingOpen} onClose={handleCloseRating}>
          <DialogTitle>Rate this Solution</DialogTitle>
          <DialogContent>
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {solution['Use Case Name']}
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
            <Button onClick={handleCloseRating}>Cancel</Button>
            <Button onClick={handleSaveRating} variant="contained" color="primary">
              Save Rating
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SolutionDetailModal;

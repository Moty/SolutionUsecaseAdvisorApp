import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Tooltip,
  Rating,
  CardActionArea,
  CardActions,
  Popover,
  Paper
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FeedbackIcon from '@mui/icons-material/Feedback';

/**
 * SolutionTile component to display a compact view of a solution in the matrix view
 * @param {Object} props - Component props
 * @param {Object} props.solution - Solution data to display
 * @param {boolean} props.isFavorite - Whether this solution is a favorite
 * @param {Function} props.onToggleFavorite - Handler for toggling favorite status
 * @param {boolean} props.isSelectedForComparison - Whether this solution is selected for comparison
 * @param {Function} props.onToggleComparison - Handler for toggling comparison selection
 * @param {Object} props.ratingSummary - Aggregated rating data for this solution
 * @param {Function} props.onRateClick - Handler for opening the rating dialog
 * @param {Function} props.onClick - Handler for clicking on the tile
 */
const SolutionTile = ({ 
  solution, 
  isFavorite = false, 
  onToggleFavorite = () => {},
  isSelectedForComparison = false,
  onToggleComparison = () => {},
  ratingSummary = null,
  onRateClick = () => {},
  onClick = () => {}
}) => {
  // State for hover preview
  const [showPreview, setShowPreview] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const hoverTimerRef = useRef(null);
  const cardRef = useRef(null);

  // Extract module from Use Case ID
  const getModule = (useCaseId) => {
    if (!useCaseId) return 'Unknown';
    const parts = useCaseId.split('_');
    return parts.length > 0 ? parts[0] : 'Unknown';
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (e) => {
    e.stopPropagation(); // Prevent tile click
    if (solution && solution['Use Case ID']) {
      onToggleFavorite(solution['Use Case ID']);
    }
  };
  
  // Handle comparison toggle
  const handleComparisonToggle = (e) => {
    e.stopPropagation(); // Prevent tile click
    if (solution && solution['Use Case ID']) {
      onToggleComparison(solution['Use Case ID']);
    }
  };
  
  // Handle rating click
  const handleRateClick = (e) => {
    e.stopPropagation(); // Prevent tile click
    onRateClick(solution);
  };

  // Handle mouse enter for preview
  const handleMouseEnter = (e) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    // Set a timer to show the preview after 2 seconds
    hoverTimerRef.current = setTimeout(() => {
      setAnchorEl(cardRef.current);
      setShowPreview(true);
    }, 2000);
  };

  // Handle mouse leave for preview
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowPreview(false);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <Card 
        ref={cardRef}
        elevation={2} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          },
          position: 'relative'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardActionArea 
          onClick={onClick}
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'stretch',
            justifyContent: 'flex-start'
          }}
        >
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            {/* Module chip */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Chip 
                label={getModule(solution && solution['Use Case ID'])} 
                size="small" 
                color="primary" 
                sx={{ fontWeight: 500 }}
              />
            </Box>
            
            {/* Solution name */}
            <Typography 
              variant="subtitle1" 
              component="h3" 
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                minHeight: '2.4em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.2em'
              }}
            >
              {solution && solution['Use Case Name'] ? solution['Use Case Name'] : 'Unnamed Solution'}
            </Typography>
            
            {/* User role */}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 1,
                height: '1.5em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              <strong>Role:</strong> {solution && solution['User Role'] ? solution['User Role'] : 'N/A'}
            </Typography>
            
            {/* Challenge - truncated */}
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 1,
                height: '3em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              <strong>Challenge:</strong> {solution && solution['Challenge'] ? solution['Challenge'] : 'N/A'}
            </Typography>
            
            {/* Key benefit - truncated */}
            <Typography 
              variant="body2" 
              sx={{ 
                height: '3em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              <strong>Key Benefit:</strong> {solution && solution['Key Benefits'] ? solution['Key Benefits'] : 'N/A'}
            </Typography>
            
            {/* Rating summary if available */}
            {ratingSummary && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <Rating 
                  value={ratingSummary.average || 0} 
                  precision={0.5} 
                  readOnly 
                  size="small" 
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({ratingSummary.count || 0})
                </Typography>
              </Box>
            )}
          </CardContent>
        </CardActionArea>
        
        {/* Action buttons */}
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1 }}>
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
              onClick={handleRateClick}
              aria-label="Rate this solution"
            >
              <FeedbackIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Hover Preview Popup */}
      <Popover
        open={showPreview}
        anchorEl={anchorEl}
        onClose={() => setShowPreview(false)}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        sx={{
          pointerEvents: 'none',
          '& .MuiPopover-paper': {
            maxWidth: 400,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
            mt: 1,
            ml: 1,
          }
        }}
        disableRestoreFocus
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {solution && solution['Use Case Name'] ? solution['Use Case Name'] : 'Unnamed Solution'}
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>ID:</strong> {solution && solution['Use Case ID'] ? solution['Use Case ID'] : 'N/A'}
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>User Role:</strong> {solution && solution['User Role'] ? solution['User Role'] : 'N/A'}
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>Challenge:</strong> {solution && solution['Challenge'] ? solution['Challenge'] : 'N/A'}
          </Typography>
          
          {solution && solution['Value Drivers'] && (
            <Typography variant="body2" paragraph>
              <strong>Value Drivers:</strong> {solution['Value Drivers']}
            </Typography>
          )}
          
          {solution && solution['Enablers'] && (
            <Typography variant="body2" paragraph>
              <strong>Enablers:</strong> {solution['Enablers']}
            </Typography>
          )}
          
          {solution && solution['Baseline without AI'] && (
            <Typography variant="body2" paragraph>
              <strong>Baseline without AI:</strong> {solution['Baseline without AI']}
            </Typography>
          )}
          
          {solution && solution['New World (with AI)'] && (
            <Typography variant="body2" paragraph>
              <strong>New World (with AI):</strong> {solution['New World (with AI)']}
            </Typography>
          )}
          
          <Typography variant="body2">
            <strong>Key Benefits:</strong> {solution && solution['Key Benefits'] ? solution['Key Benefits'] : 'N/A'}
          </Typography>
        </Paper>
      </Popover>
    </>
  );
};

export default SolutionTile;

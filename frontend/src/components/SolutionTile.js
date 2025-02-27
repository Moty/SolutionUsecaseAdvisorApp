import React from 'react';
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
  CardActions
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
  // Extract module from Use Case ID
  const getModule = (useCaseId) => {
    return useCaseId.split('_')[0];
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (e) => {
    e.stopPropagation(); // Prevent tile click
    onToggleFavorite(solution['Use Case ID']);
  };
  
  // Handle comparison toggle
  const handleComparisonToggle = (e) => {
    e.stopPropagation(); // Prevent tile click
    onToggleComparison(solution['Use Case ID']);
  };
  
  // Handle rating click
  const handleRateClick = (e) => {
    e.stopPropagation(); // Prevent tile click
    onRateClick(solution);
  };
  
  return (
    <Card 
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
              label={getModule(solution['Use Case ID'])} 
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
              height: '2.4em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {solution['Use Case Name']}
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
            <strong>Role:</strong> {solution['User Role']}
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
            <strong>Challenge:</strong> {solution['Challenge']}
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
            <strong>Key Benefit:</strong> {solution['Key Benefits']}
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
  );
};

export default SolutionTile;

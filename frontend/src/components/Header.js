import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  useTheme, 
  useMediaQuery, 
  IconButton, 
  Badge,
  Tooltip,
  Button
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import StarIcon from '@mui/icons-material/Star';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * Header component with SAP branding and navigation controls
 * @param {Object} props - Component props
 * @param {Function} props.onToggleFavorites - Handler for toggling favorites panel
 * @param {number} props.favoritesCount - Number of favorite solutions
 * @param {Function} props.onToggleComparison - Handler for toggling comparison view
 * @param {number} props.comparisonCount - Number of solutions selected for comparison
 * @param {Function} props.onToggleFilterHistory - Handler for toggling filter history panel
 */
const Header = ({ 
  onToggleFavorites, 
  favoritesCount = 0, 
  onToggleComparison, 
  comparisonCount = 0,
  onToggleFilterHistory
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <BusinessCenterIcon sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} component="h1" sx={{ fontWeight: 600 }}>
            SAP Solution Advisor
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Find the right SAP solution for your business needs
          </Typography>
        </Box>
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Favorites button */}
          <Tooltip title="Favorites">
            <IconButton 
              color="inherit" 
              onClick={onToggleFavorites}
              aria-label={`${favoritesCount} favorites`}
            >
              <Badge badgeContent={favoritesCount} color="secondary">
                <StarIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Comparison button */}
          <Tooltip title="Compare Solutions">
            <IconButton 
              color="inherit" 
              onClick={onToggleComparison}
              aria-label={`${comparisonCount} solutions selected for comparison`}
              disabled={comparisonCount === 0}
            >
              <Badge badgeContent={comparisonCount} color="secondary">
                <CompareArrowsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Filter History button */}
          <Tooltip title="Filter History">
            <IconButton 
              color="inherit" 
              onClick={onToggleFilterHistory}
              aria-label="Filter history"
            >
              <HistoryIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

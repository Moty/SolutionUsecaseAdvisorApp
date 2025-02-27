import React from 'react';
import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

/**
 * ViewToggle component to switch between list and matrix views
 * @param {Object} props - Component props
 * @param {string} props.currentView - Current view mode ('list' or 'matrix')
 * @param {Function} props.onViewChange - Handler for view mode changes
 */
const ViewToggle = ({ currentView, onViewChange }) => {
  const handleChange = (event, newView) => {
    // Only update if a new view is selected (prevents deselecting both)
    if (newView !== null) {
      onViewChange(newView);
    }
  };

  return (
    <ToggleButtonGroup 
      value={currentView} 
      exclusive 
      onChange={handleChange}
      aria-label="view mode"
      size="small"
    >
      <Tooltip title="List View">
        <ToggleButton value="list" aria-label="list view">
          <ViewListIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Tile View">
        <ToggleButton value="matrix" aria-label="tile view">
          <ViewModuleIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

export default ViewToggle;

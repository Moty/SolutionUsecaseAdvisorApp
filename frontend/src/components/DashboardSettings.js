import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  FormGroup, 
  FormControlLabel, 
  Switch, 
  Typography, 
  Divider,
  Box
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * DashboardSettings component for customizing dashboard display
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Handler for closing the dialog
 * @param {Object} props.preferences - Current dashboard preferences
 * @param {Function} props.onSave - Handler for saving preferences
 */
const DashboardSettings = ({ 
  open, 
  onClose, 
  preferences = {}, 
  onSave 
}) => {
  // Initialize local state with current preferences
  const [localPreferences, setLocalPreferences] = useState(preferences);
  
  // Handle preference change
  const handlePreferenceChange = (event) => {
    const { name, checked } = event.target;
    setLocalPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle save
  const handleSave = () => {
    onSave(localPreferences);
    onClose();
  };
  
  // Reset to defaults
  const handleResetDefaults = () => {
    const defaults = {
      showModuleChart: true,
      showRoleChart: true,
      showTotalCount: true
    };
    setLocalPreferences(defaults);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          Dashboard Settings
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Customize which charts and metrics are displayed on your dashboard.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Charts
        </Typography>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={localPreferences.showModuleChart || false}
                onChange={handlePreferenceChange}
                name="showModuleChart"
                color="primary"
              />
            }
            label="Show Module Distribution Chart"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={localPreferences.showRoleChart || false}
                onChange={handlePreferenceChange}
                name="showRoleChart"
                color="primary"
              />
            }
            label="Show User Role Chart"
          />
        </FormGroup>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Metrics
        </Typography>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={localPreferences.showTotalCount || false}
                onChange={handlePreferenceChange}
                name="showTotalCount"
                color="primary"
              />
            }
            label="Show Total Solution Count"
          />
        </FormGroup>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleResetDefaults} color="inherit">
          Reset to Defaults
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardSettings;

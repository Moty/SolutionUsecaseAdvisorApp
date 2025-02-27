import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Button,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * FilterPanel component for filtering SAP solutions
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Filter change handler
 * @param {Object} props.metrics - Metrics data for populating filter options
 */
const FilterPanel = ({ filters, onFilterChange, metrics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [localFilters, setLocalFilters] = useState(filters);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  
  // Extract filter options from metrics when available
  useEffect(() => {
    if (metrics) {
      // Extract module options
      if (metrics.moduleDistribution) {
        const modules = Object.keys(metrics.moduleDistribution).map(module => ({
          value: module,
          label: `${module} (${metrics.moduleDistribution[module]})`,
        }));
        setModuleOptions(modules);
      }
      
      // Extract role options
      if (metrics.roleDistribution) {
        const roles = Object.keys(metrics.roleDistribution).map(role => ({
          value: role,
          label: `${role} (${metrics.roleDistribution[role]})`,
        }));
        setRoleOptions(roles);
      }
    }
  }, [metrics]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      role: '',
      module: '',
      keyword: '',
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterAltIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          Filter Solutions
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {/* SAP Module Filter */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="module-label">SAP Module</InputLabel>
            <Select
              labelId="module-label"
              id="module"
              name="module"
              value={localFilters.module}
              onChange={handleInputChange}
              label="SAP Module"
            >
              <MenuItem value="">
                <em>All Modules</em>
              </MenuItem>
              {moduleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* User Role Filter */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="role-label">User Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={localFilters.role}
              onChange={handleInputChange}
              label="User Role"
            >
              <MenuItem value="">
                <em>All Roles</em>
              </MenuItem>
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Keyword Search */}
        <Grid item xs={12} sm={12} md={4}>
          <TextField
            fullWidth
            id="keyword"
            name="keyword"
            label="Search by Keyword"
            variant="outlined"
            size="small"
            value={localFilters.keyword}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleApplyFilters();
              }
            }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          size={isMobile ? 'small' : 'medium'}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyFilters}
          size={isMobile ? 'small' : 'medium'}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterPanel;

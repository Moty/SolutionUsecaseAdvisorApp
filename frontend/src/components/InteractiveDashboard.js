import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  Box, 
  useTheme, 
  useMediaQuery, 
  IconButton,
  Tooltip as MuiTooltip
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';

// Import DashboardSettings component
import DashboardSettings from './DashboardSettings';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

/**
 * InteractiveDashboard component to display metrics visualizations
 * @param {Object} props - Component props
 * @param {Object} props.metrics - Metrics data for visualizations
 * @param {Object} props.preferences - Dashboard display preferences
 * @param {Function} props.onUpdatePreferences - Handler for updating preferences
 */
const InteractiveDashboard = ({ 
  metrics, 
  preferences = {
    showModuleChart: true,
    showRoleChart: true,
    showTotalCount: true
  },
  onUpdatePreferences = () => {}
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // If metrics are not loaded yet, show loading placeholder
  if (!metrics) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3, minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Loading dashboard data...
        </Typography>
      </Paper>
    );
  }
  
  // Generate colors for charts
  const generateColors = (count) => {
    const baseColors = [
      '#0070f3', // SAP blue
      '#ff5722', // Orange
      '#4caf50', // Green
      '#9c27b0', // Purple
      '#f44336', // Red
      '#2196f3', // Light blue
      '#ff9800', // Amber
      '#795548', // Brown
      '#607d8b', // Blue grey
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
  };
  
  // Prepare data for module distribution chart
  const moduleData = {
    labels: Object.keys(metrics.moduleDistribution || {}),
    datasets: [
      {
        data: Object.values(metrics.moduleDistribution || {}),
        backgroundColor: generateColors(Object.keys(metrics.moduleDistribution || {}).length),
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for role distribution chart
  const roleData = {
    labels: Object.keys(metrics.roleDistribution || {}).slice(0, 8), // Limit to top 8 roles for readability
    datasets: [
      {
        label: 'Solutions by Role',
        data: Object.values(metrics.roleDistribution || {}).slice(0, 8),
        backgroundColor: '#0070f3',
        borderColor: '#0070f3',
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };
  
  // Handle opening settings dialog
  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };
  
  // Handle closing settings dialog
  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };
  
  // Handle saving preferences
  const handleSavePreferences = (newPreferences) => {
    onUpdatePreferences(newPreferences);
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Solution Insights Dashboard
          </Typography>
        </Box>
        
        {/* Settings button */}
        <MuiTooltip title="Customize Dashboard">
          <IconButton 
            size="small" 
            onClick={handleOpenSettings}
            aria-label="Dashboard settings"
          >
            <SettingsIcon />
          </IconButton>
        </MuiTooltip>
      </Box>
      
      <Grid container spacing={3}>
        {/* Module Distribution Chart */}
        {preferences.showModuleChart && (
          <Grid item xs={12} md={preferences.showRoleChart ? 6 : 12}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, textAlign: 'center' }}>
              Solutions by SAP Module
            </Typography>
            <Box sx={{ height: isMobile ? '200px' : '250px', position: 'relative' }}>
              <Pie data={moduleData} options={pieOptions} />
            </Box>
          </Grid>
        )}
        
        {/* Role Distribution Chart */}
        {preferences.showRoleChart && (
          <Grid item xs={12} md={preferences.showModuleChart ? 6 : 12}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, textAlign: 'center' }}>
              Top User Roles
            </Typography>
            <Box sx={{ height: isMobile ? '200px' : '250px', position: 'relative' }}>
              <Bar data={roleData} options={barOptions} height={isMobile ? 200 : 250} />
            </Box>
          </Grid>
        )}
        
        {/* Summary Stats */}
        {preferences.showTotalCount && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Solutions: <strong>{metrics.totalUseCases || 0}</strong> | 
                Modules: <strong>{Object.keys(metrics.moduleDistribution || {}).length}</strong> | 
                User Roles: <strong>{Object.keys(metrics.roleDistribution || {}).length}</strong>
              </Typography>
            </Box>
          </Grid>
        )}
        
        {/* No charts message */}
        {!preferences.showModuleChart && !preferences.showRoleChart && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="body1" color="text.secondary">
                No charts are currently displayed.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click the settings icon to customize your dashboard.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Dashboard Settings Dialog */}
      <DashboardSettings 
        open={settingsOpen}
        onClose={handleCloseSettings}
        preferences={preferences}
        onSave={handleSavePreferences}
      />
    </Paper>
  );
};

export default InteractiveDashboard;

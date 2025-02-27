import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Drawer from '@mui/material/Drawer';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Components
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import InteractiveDashboard from './components/InteractiveDashboard';
import RecommendationList from './components/RecommendationList';
import MatrixView from './components/MatrixView';
import ViewToggle from './components/ViewToggle';
import ExportButton from './components/ExportButton';
import FavoritesPanel from './components/FavoritesPanel';
import ComparisonView from './components/ComparisonView';
import FilterHistoryPanel from './components/FilterHistoryPanel';
import DashboardSettings from './components/DashboardSettings';

// API service
import { 
  fetchSolutions, 
  fetchMetrics, 
  fetchFavorites,
  addFavorite,
  removeFavorite,
  fetchAnnotations,
  saveAnnotation,
  removeAnnotation,
  fetchRatings,
  saveRating,
  fetchRatingsSummary,
  fetchFilterHistory,
  saveFilterToHistory,
  saveToLocalStorage,
  loadFromLocalStorage
} from './utils/api';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0070f3', // SAP blue
    },
    secondary: {
      main: '#ff5722',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  // Core state
  const [solutions, setSolutions] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    module: '',
    keyword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View state
  const [viewMode, setViewMode] = useState(
    loadFromLocalStorage('viewMode', 'list') // 'list' or 'matrix'
  );
  
  // New features state
  const [favorites, setFavorites] = useState([]);
  const [annotations, setAnnotations] = useState({});
  const [ratings, setRatings] = useState({});
  const [ratingsSummary, setRatingsSummary] = useState({});
  const [filterHistory, setFilterHistory] = useState([]);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(false);
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [showFilterHistory, setShowFilterHistory] = useState(false);
  const [dashboardPreferences, setDashboardPreferences] = useState(
    loadFromLocalStorage('dashboardPreferences', {
      showModuleChart: true,
      showRoleChart: true,
      showTotalCount: true
    })
  );
  const [activeTab, setActiveTab] = useState(0); // 0: Main, 1: Favorites, 2: Comparison

  // Fetch metrics for dashboard
  useEffect(() => {
    const getMetrics = async () => {
      try {
        const data = await fetchMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load dashboard metrics. Please try again later.');
      }
    };

    getMetrics();
  }, []);

  // Fetch solutions based on filters
  useEffect(() => {
    const getSolutions = async () => {
      setLoading(true);
      try {
        const data = await fetchSolutions(filters);
        setFilteredSolutions(data);
        if (solutions.length === 0) {
          setSolutions(data);
        }
        setLoading(false);
        
        // Save filter to history if it's not empty
        if (filters.role || filters.module || filters.keyword) {
          try {
            await saveFilterToHistory(filters);
            fetchFilterHistory().then(setFilterHistory);
          } catch (error) {
            console.error('Error saving filter to history:', error);
          }
        }
      } catch (err) {
        console.error('Error fetching solutions:', err);
        setError('Failed to load solutions. Please try again later.');
        setLoading(false);
      }
    };

    getSolutions();
  }, [filters]);
  
  // Load user data (favorites, annotations, ratings, etc.)
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load favorites
        const favoritesData = await fetchFavorites();
        setFavorites(favoritesData);
        
        // Load annotations
        const annotationsData = await fetchAnnotations();
        setAnnotations(annotationsData);
        
        // Load ratings
        const ratingsData = await fetchRatings();
        setRatings(ratingsData);
        
        // Load ratings summary
        const summaryData = await fetchRatingsSummary();
        setRatingsSummary(summaryData);
        
        // Load filter history
        const historyData = await fetchFilterHistory();
        setFilterHistory(historyData);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);
  
  // Save dashboard preferences when they change
  useEffect(() => {
    saveToLocalStorage('dashboardPreferences', dashboardPreferences);
  }, [dashboardPreferences]);
  
  // Save view mode when it changes
  useEffect(() => {
    saveToLocalStorage('viewMode', viewMode);
  }, [viewMode]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  // Toggle favorite status for a solution
  const handleToggleFavorite = async (useCaseId) => {
    try {
      if (favorites.includes(useCaseId)) {
        // Remove from favorites
        const result = await removeFavorite(useCaseId);
        setFavorites(result.favorites);
      } else {
        // Add to favorites
        const result = await addFavorite(useCaseId);
        setFavorites(result.favorites);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorites. Please try again.');
    }
  };
  
  // Save annotation for a solution
  const handleSaveAnnotation = async (useCaseId, text) => {
    try {
      const result = await saveAnnotation(useCaseId, text);
      setAnnotations(result.annotations);
    } catch (error) {
      console.error('Error saving annotation:', error);
      setError('Failed to save annotation. Please try again.');
    }
  };
  
  // Save rating for a solution
  const handleSaveRating = async (useCaseId, rating, feedback = '') => {
    try {
      const result = await saveRating(useCaseId, rating, feedback);
      setRatings(result.ratings);
      
      // Refresh ratings summary
      const summaryData = await fetchRatingsSummary();
      setRatingsSummary(summaryData);
    } catch (error) {
      console.error('Error saving rating:', error);
      setError('Failed to save rating. Please try again.');
    }
  };
  
  // Toggle selection for comparison
  const handleToggleComparison = (useCaseId) => {
    setSelectedForComparison(prev => {
      if (prev.includes(useCaseId)) {
        return prev.filter(id => id !== useCaseId);
      } else {
        // Limit to 3 solutions for comparison
        if (prev.length >= 3) {
          return [...prev.slice(1), useCaseId];
        }
        return [...prev, useCaseId];
      }
    });
  };
  
  // Update dashboard preferences
  const handleUpdateDashboardPreferences = (preferences) => {
    setDashboardPreferences(preferences);
  };
  
  // Apply a filter from history
  const handleApplyFilterFromHistory = (historyItem) => {
    setFilters(historyItem.filters);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Reset views based on tab
    if (newValue === 0) { // Main view
      setShowComparisonView(false);
    } else if (newValue === 1) { // Favorites
      setShowFavoritesPanel(true);
      setShowComparisonView(false);
    } else if (newValue === 2) { // Comparison
      setShowComparisonView(true);
    }
  };
  
  // Toggle favorites panel
  const handleToggleFavoritesPanel = () => {
    setShowFavoritesPanel(!showFavoritesPanel);
  };
  
  // Toggle filter history panel
  const handleToggleFilterHistory = () => {
    setShowFilterHistory(!showFilterHistory);
  };
  
  // Handle view mode change
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
  };
  
  // Get solutions by IDs (for favorites and comparison)
  const getSolutionsByIds = (ids) => {
    return solutions.filter(solution => ids.includes(solution['Use Case ID']));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header 
        onToggleFavorites={handleToggleFavoritesPanel}
        favoritesCount={favorites.length}
        comparisonCount={selectedForComparison.length}
        onToggleComparison={() => setShowComparisonView(!showComparisonView)}
        onToggleFilterHistory={handleToggleFilterHistory}
      />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Tab navigation for main views */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="solution views">
            <Tab label="All Solutions" />
            <Tab label={`Favorites (${favorites.length})`} />
            <Tab 
              label={`Comparison (${selectedForComparison.length})`} 
              disabled={selectedForComparison.length === 0} 
            />
          </Tabs>
        </Box>
        
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Main content based on active tab */}
                {activeTab === 0 && (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <FilterPanel 
                        filters={filters} 
                        onFilterChange={handleFilterChange} 
                        metrics={metrics}
                        onShowHistory={handleToggleFilterHistory}
                        filterHistory={filterHistory}
                        onApplyHistoryFilter={handleApplyFilterFromHistory}
                      />
                    </Box>
                    
                    {error && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                      </Alert>
                    )}
                    
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ mb: 4 }}>
                          <InteractiveDashboard 
                            metrics={metrics} 
                            preferences={dashboardPreferences}
                            onUpdatePreferences={handleUpdateDashboardPreferences}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <ViewToggle 
                            currentView={viewMode} 
                            onViewChange={handleViewModeChange} 
                          />
                          <ExportButton filters={filters} />
                        </Box>
                        
                        {viewMode === 'list' ? (
                          <RecommendationList 
                            solutions={filteredSolutions} 
                            favorites={favorites}
                            onToggleFavorite={handleToggleFavorite}
                            annotations={annotations}
                            onSaveAnnotation={handleSaveAnnotation}
                            ratings={ratings}
                            ratingsSummary={ratingsSummary}
                            onSaveRating={handleSaveRating}
                            selectedForComparison={selectedForComparison}
                            onToggleComparison={handleToggleComparison}
                          />
                        ) : (
                          <MatrixView 
                            solutions={filteredSolutions} 
                            favorites={favorites}
                            onToggleFavorite={handleToggleFavorite}
                            annotations={annotations}
                            onSaveAnnotation={handleSaveAnnotation}
                            ratings={ratings}
                            ratingsSummary={ratingsSummary}
                            onSaveRating={handleSaveRating}
                            selectedForComparison={selectedForComparison}
                            onToggleComparison={handleToggleComparison}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
                
                {/* Favorites Tab */}
                {activeTab === 1 && (
                  <FavoritesPanel 
                    solutions={getSolutionsByIds(favorites)}
                    onToggleFavorite={handleToggleFavorite}
                    annotations={annotations}
                    onSaveAnnotation={handleSaveAnnotation}
                    ratings={ratings}
                    onSaveRating={handleSaveRating}
                    selectedForComparison={selectedForComparison}
                    onToggleComparison={handleToggleComparison}
                  />
                )}
                
                {/* Comparison Tab */}
                {activeTab === 2 && (
                  <ComparisonView 
                    solutions={getSolutionsByIds(selectedForComparison)}
                    onRemoveFromComparison={handleToggleComparison}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}
                
                {/* Filter History Drawer */}
                <Drawer
                  anchor="right"
                  open={showFilterHistory}
                  onClose={handleToggleFilterHistory}
                >
                  <FilterHistoryPanel 
                    history={filterHistory}
                    onApplyFilter={handleApplyFilterFromHistory}
                    onClose={handleToggleFilterHistory}
                  />
                </Drawer>
              </>
            }
          />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App;

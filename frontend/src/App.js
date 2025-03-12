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
import PdfMatcher from './components/PdfMatcher';
import About from './components/About';

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
  loadFromLocalStorage,
  DEFAULT_USER_ID
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
  
  // Load favorites from local storage immediately for initial render
  const initialFavorites = loadFromLocalStorage(`favorites_${DEFAULT_USER_ID}`, []);
  
  // New features state with additional debugging
  const [favorites, setFavorites] = useState(initialFavorites);
  
  // Add a custom setFavorites function that logs changes
  const updateFavorites = (newFavorites) => {
    console.log('Favorites changing from', favorites, 'to', newFavorites);
    console.trace('Favorites state update stack trace');
    setFavorites(newFavorites);
  };
  const [favoritesLoading, setFavoritesLoading] = useState(true);
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
  
  // Add state to store match data for comparison
  const [matchData, setMatchData] = useState(null);
  
  // Effect for persisting favorites to local storage immediately on change
  useEffect(() => {
    // Skip the first render since initialFavorites already has localStorage data
    if (favorites !== initialFavorites) {
      console.log('Saving favorites to localStorage:', favorites);
      saveToLocalStorage(`favorites_${DEFAULT_USER_ID}`, favorites);
    }
  }, [favorites, initialFavorites]);
  
  // Load user data (favorites, annotations, ratings, etc.)
  useEffect(() => {
    // Define a helper function to retry API calls
    const retryApiCall = async (apiCall, maxRetries = 2, delay = 1000) => {
      let lastError;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await apiCall();
        } catch (error) {
          console.error(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
          lastError = error;
          
          if (attempt < maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      throw lastError;
    };
    
    const loadUserData = async () => {
      console.log('Loading user data...');
      setFavoritesLoading(true);
      
      try {
        // Load favorites with priority and retries
        try {
          const favoritesData = await retryApiCall(() => fetchFavorites());
          console.log('Loaded favorites from API:', favoritesData);
          
          // Only update if we got data and it's different from our current state
          // AND the API actually returned an array (important validation)
          if (Array.isArray(favoritesData) && 
              favoritesData.length > 0 && 
              JSON.stringify(favoritesData) !== JSON.stringify(favorites)) {
            console.log('Updating favorites from API response');
            updateFavorites(favoritesData);
          } else {
            console.log('API returned empty or invalid favorites, keeping local data:', favorites);
          }
        } catch (favError) {
          console.error('Failed to load favorites after retries:', favError);
          // We already initialized with local storage, so no need to set here
        } finally {
          setFavoritesLoading(false);
        }
        
        // Load other user data in parallel
        await Promise.all([
          // Load annotations
          fetchAnnotations()
            .then(setAnnotations)
            .catch(err => console.error('Error loading annotations:', err)),
          
          // Load ratings
          fetchRatings()
            .then(setRatings)
            .catch(err => console.error('Error loading ratings:', err)),
          
          // Load ratings summary
          fetchRatingsSummary()
            .then(setRatingsSummary)
            .catch(err => console.error('Error loading ratings summary:', err)),
          
          // Load filter history
          fetchFilterHistory()
            .then(setFilterHistory)
            .catch(err => console.error('Error loading filter history:', err)),
        ]);
        
        console.log('User data loaded successfully');
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []); // No dependencies to prevent re-running and potential race conditions
  
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
        // Remove from favorites - update UI immediately for better UX
        const newFavorites = favorites.filter(id => id !== useCaseId);
        console.log('Removing from favorites locally:', useCaseId);
        updateFavorites(newFavorites);
        
        // Then update server
        const result = await removeFavorite(useCaseId);
        console.log('Server response for removing favorite:', result);
        
        // IMPORTANT: Only update from server if we got valid data
        if (result && result.favorites && Array.isArray(result.favorites)) {
          updateFavorites(result.favorites);
        }
      } else {
        // Add to favorites - update UI immediately
        const newFavorites = [...favorites, useCaseId];
        console.log('Adding to favorites locally:', useCaseId);
        updateFavorites(newFavorites);
        
        // Then update server
        const result = await addFavorite(useCaseId);
        console.log('Server response for adding favorite:', result);
        
        // IMPORTANT: Only update from server if we got valid data
        if (result && result.favorites && Array.isArray(result.favorites)) {
          updateFavorites(result.favorites);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorites. Please try again.');
      
      // Revert the optimistic update on error
      if (favorites.includes(useCaseId)) {
        // We were removing, but failed - add it back
        updateFavorites([...favorites, useCaseId]);
      } else {
        // We were adding, but failed - remove it
        updateFavorites(favorites.filter(id => id !== useCaseId));
      }
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
  const handleToggleComparison = (useCaseId, matchResult = null) => {
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
    
    // If a match result is provided, store it for the comparison view
    if (matchResult) {
      setMatchData(matchResult);
    }
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
    if (!ids || ids.length === 0) {
      return [];
    }

    console.log('GetSolutionsByIds called with:', ids);
    console.log('Available solutions:', solutions);
    
    // If solutions aren't loaded yet but we have IDs, create placeholder objects
    if (solutions.length === 0 && ids.length > 0) {
      console.log('Creating placeholder solutions for:', ids);
      return ids.map(id => ({
        'Use Case ID': id,
        'Use Case Name': `Loading... (${id})`,
        'Loading': true
      }));
    }
    
    // Normal filtering when solutions are available
    const result = solutions.filter(solution => ids.includes(solution['Use Case ID']));
    console.log('Filtered solutions result:', result);
    return result;
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
            <Tab label="PDF Matcher" />
            <Tab label="About" />
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
                    matchResult={matchData}
                  />
                )}
                
                {/* PDF Matcher Tab */}
                {activeTab === 3 && (
                  <PdfMatcher />
                )}
                
                {/* About Tab */}
                {activeTab === 4 && (
                  <About />
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

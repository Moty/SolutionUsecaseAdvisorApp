import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tooltip,
  Divider,
  useTheme,
  Button
} from '@mui/material';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  Treemap,
  Tooltip as RechartsTooltip,
  LinearGradient,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList
} from 'recharts';

/**
 * Format field name for display
 */
const formatFieldName = (fieldName) => {
  switch (fieldName) {
    case 'focusArea': return 'Focus Area';
    case 'process': return 'Process/Activity';
    case 'affected': return 'Affected Roles';
    case 'improvement': return 'Improvement Need';
    case 'howToImprove': return 'How to Improve';
    default: return fieldName;
  }
};

/**
 * Get color based on similarity score
 */
const getColorByScore = (score) => {
  if (score >= 0.7) return '#4caf50'; // Green for good match
  if (score >= 0.4) return '#ff9800'; // Orange for moderate match
  return '#f44336'; // Red for poor match
};

/**
 * Basic similarity bar chart
 */
const BasicSimilarityBar = ({ score, label, maxWidth = '100%', height = 15, showLabel = true }) => {
  return (
    <Box sx={{ width: maxWidth }}>
      <Box sx={{ 
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 0.5
      }}>
        {showLabel && (
          <Typography variant="caption" color="text.secondary">
            {label || 'Similarity'}
          </Typography>
        )}
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {(score * 100).toFixed(0)}%
        </Typography>
      </Box>
      <Box sx={{ 
        width: '100%', 
        backgroundColor: '#e0e0e0', 
        borderRadius: 1,
        height: height,
      }}>
        <Box
          sx={{
            width: `${score * 100}%`,
            height: '100%',
            borderRadius: 1,
            backgroundColor: getColorByScore(score)
          }}
        />
      </Box>
    </Box>
  );
};

/**
 * Formats a use case field name for display
 */
const formatUseCaseFieldName = (fieldName) => {
  // Add spaces before capital letters and ensure first letter is capitalized
  const withSpaces = fieldName.replace(/([A-Z])/g, ' $1').trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

/**
 * A component to display cross-field matching information
 */
const BestMatchDisplay = ({ fieldSimilarities }) => {
  if (!fieldSimilarities) return null;
  
  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
      <Typography variant="subtitle1" gutterBottom>Best Field Matches:</Typography>
      
      {Object.entries(fieldSimilarities)
        .filter(([key]) => !key.startsWith('_')) // Skip internal fields
        .map(([extractedField, data]) => (
          <Box key={extractedField} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {formatFieldName(extractedField)}:
              </Typography>
              <Tooltip title={`${(data.score * 100).toFixed(1)}% match with ${formatUseCaseFieldName(data.bestMatchField || '')}`}>
                <Typography variant="body2" 
                  sx={{ 
                    color: getColorByScore(data.score),
                    fontWeight: 'bold'
                  }}
                >
                  {(data.score * 100).toFixed(0)}%
                </Typography>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="caption" sx={{ mr: 1 }}>
                Best match with: 
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                {formatUseCaseFieldName(data.bestMatchField || '')}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                mt: 0.5, 
                p: 1, 
                borderRadius: 1, 
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                fontSize: '0.75rem',
                fontStyle: 'italic',
                maxHeight: '50px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              "{data.extractedContent}"
            </Box>
          </Box>
        ))}
    </Box>
  );
};

/**
 * Radar chart visualization for similarity scores
 */
const SimilarityRadar = ({ fieldSimilarities }) => {
  // Add defensive check for fieldSimilarities
  if (!fieldSimilarities) {
    console.warn('SimilarityRadar: fieldSimilarities is null or undefined');
    return <Typography color="error">Unable to display radar chart - missing similarity data</Typography>;
  }
  
  // Convert field similarities to a format suitable for the radar chart
  const data = Object.entries(fieldSimilarities)
    .filter(([key]) => !key.startsWith('_')) // Skip internal fields
    .map(([key, value]) => ({
      subject: formatFieldName(key),
      score: value.score,
      weight: value.weight,
      fullMark: 1
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 1]} />
        <Radar
          name="Similarity Score"
          dataKey="score"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Radar
          name="Weight"
          dataKey="weight"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.4}
        />
        <RechartsTooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};

/**
 * Treemap visualization of weighted similarity scores
 */
const SimilarityTreemap = ({ fieldSimilarities }) => {
  // Add defensive check for fieldSimilarities
  if (!fieldSimilarities) {
    console.warn('SimilarityTreemap: fieldSimilarities is null or undefined');
    return <Typography color="error">Unable to display treemap - missing similarity data</Typography>;
  }
  
  // Convert field similarities to a format suitable for treemap
  const data = Object.entries(fieldSimilarities).map(([key, value]) => ({
    name: formatFieldName(key),
    size: value.score * value.weight * 100,
    score: value.score,
    weight: value.weight
  }));

  const CustomizedContent = (props) => {
    const { root, depth, x, y, width, height, index, name, score, value } = props;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: getColorByScore(score),
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {width > 50 && height > 30 && (
          <>
            <text x={x + width / 2} y={y + height / 2 - 7} textAnchor="middle" fill="#fff" fontSize={12}>
              {name}
            </text>
            <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={11} fillOpacity={0.9}>
              {`${Math.round(score * 100)}%`}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <Treemap
        data={data}
        dataKey="size"
        aspectRatio={4/3}
        stroke="#fff"
        fill="#8884d8"
        content={<CustomizedContent />}
      >
        <RechartsTooltip 
          formatter={(value, name, props) => [
            `${props.payload.name}: ${Math.round(props.payload.score * 100)}%`,
            `Weight: ${Math.round(props.payload.weight * 100)}%`
          ]}
        />
      </Treemap>
    </ResponsiveContainer>
  );
};

/**
 * Bar chart visualization for field similarity scores
 */
const SimilarityBarChart = ({ fieldSimilarities }) => {
  const theme = useTheme();
  
  // Add defensive check for fieldSimilarities
  if (!fieldSimilarities) {
    console.warn('SimilarityBarChart: fieldSimilarities is null or undefined');
    return <Typography color="error">Unable to display bar chart - missing similarity data</Typography>;
  }
  
  // Convert field similarities to a format suitable for the bar chart
  const data = Object.entries(fieldSimilarities)
    .filter(([key]) => !key.startsWith('_')) // Skip internal fields
    .map(([key, value]) => ({
      name: formatFieldName(key),
      score: value.score,
      weight: value.weight,
      weightedScore: value.score * value.weight,
      bestMatchField: formatUseCaseFieldName(value.bestMatchField || '')
    }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
        layout="vertical"
      >
        <XAxis type="number" domain={[0, 1]} />
        <YAxis 
          dataKey="name" 
          type="category" 
          tick={{ fontSize: 12 }} 
          width={120}
        />
        <RechartsTooltip
          formatter={(value, name) => [
            `${(value * 100).toFixed(0)}%`,
            name === 'score' ? 'Field Score' : (name === 'weight' ? 'Field Weight' : 'Weighted Score')
          ]}
        />
        <Bar dataKey="score" name="Field Score" barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColorByScore(entry.score)} />
          ))}
          <LabelList dataKey="score" position="right" formatter={(value) => `${(value * 100).toFixed(0)}%`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Matrix visualization showing how each extracted field matches against each use case field
 */
const MatchingMatrix = ({ matchingMatrix }) => {
  if (!matchingMatrix) {
    return <Typography color="error">Matching matrix data not available</Typography>;
  }
  
  // Get all extracted fields and use case fields
  const extractedFields = Object.keys(matchingMatrix);
  const useCaseFields = Object.keys(matchingMatrix[extractedFields[0]] || {});
  
  // Create data array for heatmap-style display
  const data = [];
  for (const extractedField of extractedFields) {
    for (const useCaseField of useCaseFields) {
      const score = matchingMatrix[extractedField][useCaseField] || 0;
      data.push({
        extractedField: formatFieldName(extractedField),
        useCaseField: formatUseCaseFieldName(useCaseField),
        score
      });
    }
  }
  
  return (
    <Box sx={{ mt: 3, mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Detailed Matching Matrix (Top Matches)
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 2
      }}>
        {extractedFields.map(extractedField => {
          // Get top 3 matches for this extracted field
          const matches = Object.entries(matchingMatrix[extractedField] || {})
            .map(([field, score]) => ({ field, score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
            
          return (
            <Paper elevation={1} key={extractedField} sx={{ p: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatFieldName(extractedField)}
              </Typography>
              
              {matches.map(({ field, score }) => (
                <Box key={field} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: getColorByScore(score),
                    mr: 1
                  }} />
                  <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                    {formatUseCaseFieldName(field)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {(score * 100).toFixed(0)}%
                  </Typography>
                </Box>
              ))}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

/**
 * Comprehensive similarity visualization component
 */
const SimilarityVisualization = ({
  similarityScore,
  fieldSimilarities,
  visualizationType = 'all', // 'all', 'radar', 'treemap', 'bars', 'matrix'
  title,
  aiEnhanced = false,
  matchingMatrix
}) => {
  // Add defensive check for missing props
  const hasSimilarityData = similarityScore !== undefined && similarityScore !== null && fieldSimilarities;
  const [showMatrix, setShowMatrix] = useState(false);
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      {title && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{title}</Typography>
            {aiEnhanced && (
              <Tooltip title="AI-enhanced matching was used">
                <Box 
                  component="span" 
                  sx={{ 
                    ml: 1, 
                    px: 1, 
                    py: 0.25, 
                    bgcolor: '#e3f2fd', 
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: '#1976d2'
                  }}
                >
                  AI
                </Box>
              </Tooltip>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
        </>
      )}

      {/* Overall Similarity Score */}
      {hasSimilarityData ? (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">Overall Similarity Score:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
              <BasicSimilarityBar 
                score={similarityScore} 
                height={20} 
                showLabel={false}
              />
            </Box>
          </Box>

          {/* Field-level Visualization */}
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Field Similarity Analysis</Typography>
        </>
      ) : (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="error">
            Similarity data is not available for visualization
          </Typography>
        </Box>
      )}

      {/* Field-level similarity information */}
      {hasSimilarityData && (
        <>
          {/* Bar chart visualization */}
          {(visualizationType === 'all' || visualizationType === 'bars') && (
            <Box sx={{ mb: 4 }}>
              <SimilarityBarChart fieldSimilarities={fieldSimilarities} />
            </Box>
          )}

          {/* Visualization Grid */}
          <Grid container spacing={3}>
            {/* Radar and Treemap charts */}
            {(visualizationType === 'all' || visualizationType === 'radar') && (
              <Grid item xs={12} md={6}>
                <SimilarityRadar fieldSimilarities={fieldSimilarities} />
              </Grid>
            )}
            
            {(visualizationType === 'all' || visualizationType === 'treemap') && (
              <Grid item xs={12} md={6}>
                <SimilarityTreemap fieldSimilarities={fieldSimilarities} />
              </Grid>
            )}
          </Grid>
          
          {/* Best Match Display */}
          <BestMatchDisplay fieldSimilarities={fieldSimilarities} />
          
          {/* Toggle button for detailed matrix */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => setShowMatrix(!showMatrix)}
              startIcon={showMatrix ? <i className="fas fa-chevron-up" /> : <i className="fas fa-chevron-down" />}
            >
              {showMatrix ? 'Hide' : 'Show'} Detailed Matching Matrix
            </Button>
          </Box>
          
          {/* Matching Matrix (conditionally displayed) */}
          {showMatrix && matchingMatrix && (
            <MatchingMatrix matchingMatrix={matchingMatrix} />
          )}
        </>
      )}
    </Paper>
  );
};

export { SimilarityVisualization, BasicSimilarityBar };

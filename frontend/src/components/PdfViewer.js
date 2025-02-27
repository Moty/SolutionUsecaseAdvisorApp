import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Button, CircularProgress, Typography, Paper } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

// Set up the worker for react-pdf
// This is required for react-pdf to work
// Use a simpler approach with a direct CDN URL
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

/**
 * PdfViewer Component
 * 
 * This component displays a PDF file with navigation controls.
 * It allows users to view PDFs, navigate between pages, and zoom in/out.
 */
const PdfViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  // Handle document load error
  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  };

  // Navigate to the previous page
  const goToPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  // Navigate to the next page
  const goToNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
  };

  // Zoom in
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.0));
  };

  // Zoom out
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom align="center">
        PDF Viewer
      </Typography>
      
      {/* PDF Document */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'flex-start',
          mb: 2
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<CircularProgress />}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </Box>
      
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={zoomOut} 
          disabled={scale <= 0.6}
          startIcon={<ZoomOutIcon />}
          size="small"
        >
          Zoom Out
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={goToPrevPage} 
          disabled={pageNumber <= 1}
          startIcon={<NavigateBeforeIcon />}
          size="small"
        >
          Prev
        </Button>
        
        <Typography>
          Page {pageNumber} of {numPages || '--'}
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={goToNextPage} 
          disabled={pageNumber >= numPages}
          endIcon={<NavigateNextIcon />}
          size="small"
        >
          Next
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={zoomIn} 
          disabled={scale >= 2.0}
          startIcon={<ZoomInIcon />}
          size="small"
        >
          Zoom In
        </Button>
      </Box>
    </Paper>
  );
};

export default PdfViewer;

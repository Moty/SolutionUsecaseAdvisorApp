import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

/**
 * Row component for displaying a single new use case
 */
const Row = ({ useCase, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this use case?')) {
      setLoading(true);
      try {
        await axios.delete(`/api/new-use-cases/${useCase.id}`);
        onDelete(useCase.id);
      } catch (error) {
        console.error('Error deleting use case:', error);
        alert('Failed to delete use case');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {useCase.id}
        </TableCell>
        <TableCell>{useCase.mappedFields.UseCaseName}</TableCell>
        <TableCell>{useCase.mappedFields.UserRole}</TableCell>
        <TableCell>
          <Chip
            label={useCase.status}
            color={getStatusColor(useCase.status)}
            size="small"
          />
        </TableCell>
        <TableCell>{formatDate(useCase.timestamp)}</TableCell>
        <TableCell>
          <IconButton
            color="primary"
            aria-label="edit"
            component="span"
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            aria-label="delete"
            component="span"
            size="small"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Mapped Fields</Typography>
                <Table size="small" aria-label="mapped fields">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Challenge
                      </TableCell>
                      <TableCell>{useCase.mappedFields.Challenge}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Enablers
                      </TableCell>
                      <TableCell>{useCase.mappedFields.Enablers}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Key Benefits
                      </TableCell>
                      <TableCell>{useCase.mappedFields.KeyBenefits}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Mapped Solution
                      </TableCell>
                      <TableCell>{useCase.mappedFields.MappedSolution}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Extracted Fields</Typography>
                <Table size="small" aria-label="extracted fields">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Focus Area
                      </TableCell>
                      <TableCell>{useCase.extractedFields.focusArea}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Process/Activity
                      </TableCell>
                      <TableCell>{useCase.extractedFields.process}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Affected Users
                      </TableCell>
                      <TableCell>{useCase.extractedFields.affected}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Improvement Reason
                      </TableCell>
                      <TableCell>{useCase.extractedFields.improvement}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        How to Improve
                      </TableCell>
                      <TableCell>{useCase.extractedFields.howToImprove}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
              
              {useCase.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Notes</Typography>
                  <Typography variant="body2">{useCase.notes}</Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">PDF File</Typography>
                <Typography variant="body2">{useCase.pdfFileName}</Typography>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

/**
 * NewUseCasesList Component
 * 
 * This component displays a list of new use cases that have been saved from unmatched PDFs.
 * It allows users to view, edit, and delete new use cases.
 */
const NewUseCasesList = () => {
  const [useCases, setUseCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load new use cases
  useEffect(() => {
    const fetchNewUseCases = async () => {
      try {
        const response = await axios.get('/api/new-use-cases');
        setUseCases(response.data);
      } catch (error) {
        console.error('Error fetching new use cases:', error);
        setError('Failed to load new use cases');
      } finally {
        setLoading(false);
      }
    };

    fetchNewUseCases();
  }, []);

  // Handle delete
  const handleDelete = (id) => {
    setUseCases(prevUseCases => prevUseCases.filter(useCase => useCase.id !== id));
  };

  // Refresh list
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/new-use-cases');
      setUseCases(response.data);
    } catch (error) {
      console.error('Error refreshing new use cases:', error);
      setError('Failed to refresh new use cases');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          New Use Cases Repository
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : useCases.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Typography color="text.secondary">
            No new use cases found
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
          <Table aria-label="new use cases table" size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>User Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {useCases.map((useCase) => (
                <Row key={useCase.id} useCase={useCase} onDelete={handleDelete} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default NewUseCasesList;

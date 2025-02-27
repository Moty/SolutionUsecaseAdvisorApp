import React from 'react';
import { Button, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getExportUrl } from '../utils/api';

/**
 * ExportButton component for exporting filtered solutions as CSV
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 */
const ExportButton = ({ filters }) => {
  // Generate the export URL with current filters
  const exportUrl = getExportUrl(filters);
  
  return (
    <Tooltip title="Download filtered results as CSV file">
      <Button
        variant="outlined"
        color="primary"
        startIcon={<FileDownloadIcon />}
        href={exportUrl}
        download="sap-solutions.csv"
        target="_blank"
        rel="noopener noreferrer"
      >
        Export to CSV
      </Button>
    </Tooltip>
  );
};

export default ExportButton;

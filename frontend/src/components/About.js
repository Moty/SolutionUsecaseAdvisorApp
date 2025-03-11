import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Avatar, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Link,
  Tooltip
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';

/**
 * About component to display information about the application and developers
 */
const About = () => {
  // List of developers
  const developers = [
    {
      name: 'Mordechai (Moty) Moshin',
      email: 'm.moshin@sap.com',
      role: 'SAP Business AI Regional Expert'
    },
    {
      name: 'Louenas Hamdi',
      email: 'louenas.hamdi@sap.com',
      role: 'S/4HANA BTP Advisor'
    }
  ];

  // Function to generate avatar from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', py: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <InfoIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" component="h1">
          About SAP Solution Advisor
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Application Overview
        </Typography>
        <Typography variant="body1" paragraph>
          SAP Solution Advisor is a web-based, mobile-friendly application designed to help SAP consultants
          and external partners identify the best SAP solutions for specific business challenges.
        </Typography>
        <Typography variant="body1" paragraph>
          The application enables users to search, filter, and compare various SAP solutions, 
          manage favorites, add personal notes, and rate solutions for future reference.
        </Typography>
        <Typography variant="body1">
          It also includes PDF matching capabilities to find similar solutions based on uploaded documents.
        </Typography>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Development Team
      </Typography>

      <Grid container spacing={3}>
        {developers.map((developer, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card elevation={2}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getInitials(developer.name)}
                  </Avatar>
                }
                title={developer.name}
                subheader={developer.role}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="Send email">
                    <IconButton 
                      size="small" 
                      color="primary"
                      component={Link}
                      href={`mailto:${developer.email}`}
                      aria-label={`Email ${developer.name}`}
                    >
                      <EmailIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {developer.email}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} SAP SE. All rights reserved.
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default About;
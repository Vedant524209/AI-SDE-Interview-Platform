import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

const FeatureCards: React.FC = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: '#ffffff' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom 
          sx={{ mb: 6, fontWeight: 700, color: '#2a394f' }}
        >
          Key Features
        </Typography>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                height: '100%', 
                border: '1px solid #f0f0f0',
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                AI-Powered Interviews
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Practice with our AI interviewer that provides realistic interview experiences and personalized feedback.
              </Typography>
            </Paper>
          </div>
          
          <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                height: '100%', 
                border: '1px solid #f0f0f0',
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                Performance Analytics
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Get detailed insights on your performance with video analysis, speech patterns, and answer quality metrics.
              </Typography>
            </Paper>
          </div>
          
          <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                height: '100%', 
                border: '1px solid #f0f0f0',
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                Industry-Specific Questions
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Practice with questions tailored to your industry and role, from software engineering to product management.
              </Typography>
            </Paper>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default FeatureCards; 
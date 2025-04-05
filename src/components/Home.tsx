import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Navbar from './Navbar';

interface HomeProps {
  onLogout: () => void;
  userEmail?: string;
}

const Home: React.FC<HomeProps> = ({ onLogout, userEmail }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar onLogout={onLogout} />
      
      <Container sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
            Welcome to InterviewXpert
            {userEmail && <span style={{ color: '#1976d2' }}> {userEmail}</span>}
          </Typography>
          
          <Typography variant="body1" paragraph>
            Your preparation for technical interviews starts here. Get ready to excel in your next interview with our comprehensive platform.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3, 
            mt: 2 
          }}>
            {/* Dashboard Card */}
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                flex: 1,
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Interview Dashboard
              </Typography>
              <Typography variant="body2">
                Access your personalized dashboard to track your progress, schedule practice interviews, and manage your preparation.
              </Typography>
            </Paper>
            
            {/* Profile Card */}
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                flex: 1,
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Profile
              </Typography>
              <Typography variant="body2">
                Update your profile information, manage your account settings, and customize your interview preparation experience.
              </Typography>
            </Paper>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home; 
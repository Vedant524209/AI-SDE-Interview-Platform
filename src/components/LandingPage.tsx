import React from 'react';
import { Box, Button, Container, Typography, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/');
    onLogin();
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Simple Navbar for Landing Page */}
      <Box 
        sx={{ 
          backgroundColor: 'white', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
          py: 1.5 
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                component="img" 
                src="/logo.svg" 
                alt="InterviewXpert Logo" 
                sx={{ height: 36, mr: 1 }}
              />
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: '#1976d2' }}>
                InterviewXpert
              </Typography>
            </Box>
            
            <Box>
              <Button 
                variant="text" 
                color="primary" 
                sx={{ mr: 2 }}
                onClick={handleLoginClick}
              >
                Log In
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleLoginClick}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom 
          sx={{ mb: 6, fontWeight: 700, color: '#2a394f' }}
        >
          Why InterviewXpert?
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
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
          </Grid>
          
          <Grid item xs={12} md={4}>
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
          </Grid>
          
          <Grid item xs={12} md={4}>
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
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: '#f5f7fa', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ fontWeight: 700, color: '#2a394f' }}
            >
              Ready to ace your next interview?
            </Typography>
            <Typography variant="h6" color="textSecondary" paragraph sx={{ mb: 4 }}>
              Join thousands of professionals who have improved their interview skills with InterviewXpert.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleLoginClick}
              sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#2a394f', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  component="img" 
                  src="/logo.svg" 
                  alt="InterviewXpert Logo" 
                  sx={{ height: 36, mr: 1, filter: 'brightness(0) invert(1)' }}
                />
                <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                  InterviewXpert
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Helping you prepare for your next video interview with AI-powered mock interviews and feedback.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                Product
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button color="inherit" sx={{ p: 0, textTransform: 'none', opacity: 0.8 }}>
                    Features
                  </Button>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button color="inherit" sx={{ p: 0, textTransform: 'none', opacity: 0.8 }}>
                    Pricing
                  </Button>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button color="inherit" sx={{ p: 0, textTransform: 'none', opacity: 0.8 }}>
                    FAQ
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                Company
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button color="inherit" sx={{ p: 0, textTransform: 'none', opacity: 0.8 }}>
                    About Us
                  </Button>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button color="inherit" sx={{ p: 0, textTransform: 'none', opacity: 0.8 }}>
                    Contact
                  </Button>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button color="inherit" sx={{ p: 0, textTransform: 'none', opacity: 0.8 }}>
                    Careers
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Subscribe to our newsletter
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                Get the latest news and updates from InterviewXpert.
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <Paper
                  component="form"
                  sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
                >
                  <Box
                    component="input"
                    placeholder="Your email address"
                    sx={{
                      ml: 1,
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.875rem',
                      p: '8px 0',
                    }}
                  />
                  <Button variant="contained" size="small" sx={{ ml: 1 }}>
                    Subscribe
                  </Button>
                </Paper>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ pt: 4, mt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © {new Date().getFullYear()} InterviewXpert. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 
import React, { useState } from 'react';
import { Box, Typography, Container, Button, Paper, Divider, Chip, Stack } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

interface InterviewPageProps {
  onLogout: () => void;
}

const InterviewPage: React.FC<InterviewPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(false);

  const handleStartInterview = () => {
    setIsStarted(true);
    navigate('/interview-session');
  };

  const handleContinueInterview = () => {
    navigate('/interview-session');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar onLogout={onLogout} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#2a394f', mb: 1 }}>
            Software Engineer
          </Typography>
          <Typography variant="h6" component="h2" sx={{ color: '#637381', mb: 4 }}>
            Practice with AI-powered interviews
          </Typography>
          
          {!isStarted && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                backgroundColor: '#1a2634', 
                color: 'white',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👋</Box>
                <Typography variant="h6">
                  You have 1 mock interview available
                </Typography>
              </Box>
            </Paper>
          )}
          
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <AccessTimeIcon sx={{ color: '#637381', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                45 minutes coding interview
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Solve algorithmic and data structure problems designed to test your problem-solving skills
              </Typography>
              
              {!isStarted ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={handleStartInterview}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                >
                  Start Interview
                </Button>
              ) : (
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ fontWeight: 600 }}
                    onClick={handleContinueInterview}
                  >
                    Continue Interview
                  </Button>
                  <Chip 
                    label="In Progress" 
                    color="warning" 
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
          
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 3, color: '#2a394f' }}>
              What to expect
            </Typography>
            
            <Stack spacing={3}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <PersonIcon sx={{ color: '#1976d2', mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      AI-Interviewer
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      The AI-powered bot will pose challenging and dynamic questions to you, just like in a real interview
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <QuizIcon sx={{ color: '#1976d2', mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Real interview questions
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Get questions on real world topics like arrays, strings, linked lists, trees and graphs
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <FeedbackIcon sx={{ color: '#1976d2', mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Personalized feedback
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Get detailed feedback on your performance so you can ace your next job interview
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </Box>
          
          {!isStarted && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={handleStartInterview}
                sx={{ 
                  px: 6,
                  py: 2,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Try for free
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default InterviewPage; 
import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ebf5 100%)',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background gradient waves */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -160,
          left: 0,
          right: 0,
          height: '300px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(228, 235, 245, 0.4) 100%)',
          transform: 'skewY(-3deg)',
          zIndex: 0
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            mb: 8
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: '#2a394f',
              fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' }
            }}
          >
            Get video-interview-ready with InterviewXpert
          </Typography>

          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 400,
              color: '#637381',
              maxWidth: '900px',
              mb: 5,
              lineHeight: 1.5
            }}
          >
            Be confident when you face your next virtual interview. Try our video assessments for mock and pre-interviews.
          </Typography>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                backgroundColor: '#ff5722',
                '&:hover': {
                  backgroundColor: '#e64a19'
                }
              }}
              onClick={() => navigate('/')}
            >
              Sign up for free
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderColor: '#546e7a',
                color: '#546e7a',
                '&:hover': {
                  borderColor: '#37474f',
                  backgroundColor: 'rgba(84, 110, 122, 0.04)'
                }
              }}
              onClick={() => navigate('/dashboard')}
            >
              Try mock interviews
            </Button>
          </Stack>
        </Box>

        {/* Dashboard image */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Box
            component="img"
            src="/dashboard-mockup.png"
            alt="InterviewXpert Dashboard"
            sx={{
              width: '100%',
              maxWidth: '1000px',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection; 
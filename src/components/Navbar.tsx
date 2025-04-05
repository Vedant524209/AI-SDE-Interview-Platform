import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  Avatar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo on the left */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/home" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src="/logo.svg" 
                alt="InterviewXpert" 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  marginRight: 1,
                  backgroundColor: 'white',
                  p: 0.5
                }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{ 
                  fontWeight: 700, 
                  letterSpacing: '0.5px'
                }}
              >
                InterviewXpert
              </Typography>
            </Link>
          </Box>

          {/* Navigation links on the right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              startIcon={<VideoCallIcon />}
              component={Link}
              to="/interviews"
            >
              Mock Interviews
            </Button>
            <Button 
              color="inherit" 
              startIcon={<DashboardIcon />}
              component={Link}
              to="/dashboard"
            >
              Dashboard
            </Button>
            <Button 
              color="inherit" 
              startIcon={<PersonIcon />}
              component={Link}
              to="/profile"
            >
              Profile
            </Button>
            <Button 
              color="secondary" 
              variant="contained"
              onClick={onLogout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 
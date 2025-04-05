import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeatureCards from './FeatureCards';

interface HomeProps {
  onLogout: () => void;
  userEmail?: string;
}

const Home: React.FC<HomeProps> = ({ onLogout, userEmail }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar onLogout={onLogout} />
      <HeroSection />
      <FeatureCards />
    </Box>
  );
};

export default Home; 
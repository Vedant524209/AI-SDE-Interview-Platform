import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Home from './components/Home';
import LandingPage from './components/LandingPage';
import InterviewPage from './components/InterviewPage';
import InterviewSession from './components/InterviewSession';
import SessionReport from './components/SessionReport';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ff5722',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  // For development/testing, set isAuthenticated to true by default
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>('test@example.com');
  const [showAuthPage, setShowAuthPage] = useState<boolean>(false);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setShowAuthPage(true);
  };
  
  const handleShowAuth = () => {
    setShowAuthPage(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app-container">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Home onLogout={handleLogout} userEmail={userEmail} />
                ) : (
                  <Auth onLoginSuccess={handleLogin} />
                )
              } 
            />
            <Route 
              path="/landing" 
              element={<LandingPage onLogin={handleShowAuth} />} 
            />
            <Route 
              path="/home" 
              element={
                isAuthenticated ? 
                <Home onLogout={handleLogout} userEmail={userEmail} /> : 
                <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/interviews" 
              element={
                isAuthenticated ? 
                <InterviewPage onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/interview-session" 
              element={<InterviewSession onLogout={handleLogout} />} 
            />
            <Route 
              path="/report/:sessionId" 
              element={
                isAuthenticated ? 
                <SessionReport onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <div>Dashboard page (Coming soon)</div> : 
                <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/profile" 
              element={
                isAuthenticated ? 
                <div>Profile page (Coming soon)</div> : 
                <Navigate to="/" replace />
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

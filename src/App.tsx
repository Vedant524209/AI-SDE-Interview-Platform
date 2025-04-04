import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Auth from './components/Auth';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <Auth />
      </div>
    </ThemeProvider>
  );
}

export default App;

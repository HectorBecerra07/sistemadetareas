
import { createTheme } from '@mui/material/styles';

// A modern theme with a blue and green color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A vibrant blue
    },
    secondary: {
      main: '#4caf50', // A calming green
    },
    success: {
      main: '#2e7d32',
      lighter: '#e8f5e9',
      darker: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      lighter: '#fff8e1',
      darker: '#e65100',
    },
    error: {
      main: '#d32f2f',
      lighter: '#fdecea',
      darker: '#b71c1c',
    },
    background: {
      default: '#f5f5f5', // A light grey background
      paper: '#ffffff', // White for paper elements
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
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
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

export default theme;

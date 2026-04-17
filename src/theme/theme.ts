import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0',
      light: '#42A5F5',
      dark: '#1040D9',
      contrastText: '#fff',
    },
    secondary: {
      main: '#C62828',
      light: '#E53935',
      dark: '#B71C1C',
      contrastText: '#fff',
    },
    success: {
      main: '#2E7D32',
      light: '#81C784',
      dark: '#1B5E20',
    },
    warning: {
      main: '#F57F17',
      light: '#FBC02D',
      dark: '#E65100',
    },
    info: {
      main: '#00695C',
      light: '#4DB6AC',
      dark: '#004D40',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#B71C1C',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    divider: '#E0E0E0',
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      disabled: '#999999',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontSize: '32px',
      fontWeight: 900,
      lineHeight: 1.2,
      color: '#1A1A1A',
    },
    h2: {
      fontSize: '22px',
      fontWeight: 800,
      lineHeight: 1.3,
      color: '#1A1A1A',
    },
    h3: {
      fontSize: '16px',
      fontWeight: 800,
      color: '#1A1A1A',
    },
    h4: {
      fontSize: '15px',
      fontWeight: 800,
      color: '#1A1A1A',
    },
    h5: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#1A1A1A',
    },
    h6: {
      fontSize: '12px',
      fontWeight: 700,
      color: '#1A1A1A',
    },
    body1: {
      fontSize: '15px',
      lineHeight: 1.6,
      color: '#333333',
    },
    body2: {
      fontSize: '13.5px',
      lineHeight: 1.6,
      color: '#333333',
    },
    subtitle1: {
      fontSize: '14px',
      fontStyle: 'italic',
      color: '#555555',
    },
    subtitle2: {
      fontSize: '12px',
      color: '#999999',
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.5px',
    },
    caption: {
      fontSize: '11px',
      color: '#999999',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
          transition: 'all 0.15s ease',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        },
      },
    },
  },
});

export default theme;

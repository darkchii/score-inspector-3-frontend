import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './main.css';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from './providers/AuthProvider.jsx';
import { ApiProvider } from './providers/ApiProvider.jsx';
import { ProfileProvider } from './providers/ProfileProvider.jsx';
import { ScoreViewProvider } from './providers/ScoreViewProvider.jsx';
import { SearchProvider } from './providers/SearchProvider.jsx';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { pink } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: pink[500],
      light: pink[300],
      dark: pink[700],
    },
  },
  //force white text on modals
  components: {
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          color: 'white',
        },
      },
    },
  },
});

const _providers = [
  ApiProvider,
  AuthProvider,
  ProfileProvider,
  ScoreViewProvider,
  SearchProvider
]

const _wrapWithProviders = (children) => {
  return _providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>
  }, children);
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename='/'>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {_wrapWithProviders(<App />)}
    </ThemeProvider>
  </BrowserRouter>,
)

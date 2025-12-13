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

const _providers = [
  ApiProvider,
  AuthProvider,
  ProfileProvider,
  ScoreViewProvider
]

const _wrapWithProviders = (children) => {
  return _providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>
  }, children);
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename='/'>
    {_wrapWithProviders(<App />)}
  </BrowserRouter>,
)

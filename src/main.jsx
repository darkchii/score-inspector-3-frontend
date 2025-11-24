import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './main.css';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from './Providers/AuthProvider.jsx';
import { ApiProvider } from './Providers/ApiProvider.jsx';
import { ProfileProvider } from './Providers/ProfileProvider.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename='/'>
    <ApiProvider>
      <AuthProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </AuthProvider>
    </ApiProvider>
  </BrowserRouter>,
)

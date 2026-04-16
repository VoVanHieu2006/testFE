import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './app/styles/index.css'; // cho biet dung css chung
import { AppProvider } from './app/providers/AppContext';

createRoot(document.getElementById('root')).render(
  <StrictMode> {/* Kiểm tra cú pháp */}
    <AppProvider>
        <App />
    </AppProvider>
  </StrictMode>
);
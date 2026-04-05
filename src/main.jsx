import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './app/styles/index.css'; // cho biet dung css chung

createRoot(document.getElementById('root')).render(
  <StrictMode> {/* Kiểm tra cú pháp */}
    <App />
  </StrictMode>
);
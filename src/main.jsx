import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './app/styles/index.css'; // cho biet dung css chung
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode> {/* Kiểm tra cú pháp */}
    <BrowserRouter> {/* Thông báo app được quản lý bởi router*/}
        <App />
    </BrowserRouter> 
  </StrictMode>
);
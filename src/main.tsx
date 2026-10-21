import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully ignore HMR / WebSocket errors in iframe environment
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (String(event.reason).includes('WebSocket') || String(event.reason).includes('vite'))) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import './index.css';

// 🛡️ Global Cross-Origin Script Error Protection
// Prevents 3rd-party ad scripts, trackers, or service worker unhandled exceptions from crashing the app
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      // Cross-origin scripts trigger generic "Script error." with no line numbers
      if (
        event.message === 'Script error.' ||
        !event.filename ||
        (event.filename && !event.filename.includes(window.location.host))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '');
    if (
      reasonStr.includes('Script error') ||
      reasonStr.includes('Failed to fetch') ||
      reasonStr.includes('service-worker') ||
      reasonStr.includes('NetworkError')
    ) {
      event.preventDefault();
      return true;
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import BugsnagPerformance from '@bugsnag/browser-performance';

// --- Bugsnag Setup ---
Bugsnag.start({
  apiKey: '05fe04ebc304ae56dcdc160914d06c1c',
  plugins: [new BugsnagPluginReact()]
});

BugsnagPerformance.start({ apiKey: '05fe04ebc304ae56dcdc160914d06c1c' });

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

// --- Custom Fallback Component ---
// This component will be displayed when an error is caught.
const ErrorFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'sans-serif'
  }}>
    <h2>Oops! Something went wrong.</h2>
    <p>We have been notified of the issue and are working to fix it.</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Reload Page
    </button>
  </div>
);

// --- Render the App ---
// Pass your custom component to the FallbackComponent prop.
ReactDOM.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>,
  document.getElementById('root')
);

serviceWorker.unregister();
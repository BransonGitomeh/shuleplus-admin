import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import BugsnagPerformance from '@bugsnag/browser-performance';
import { useState } from 'react';
// import ErrorBoundary from 'react-error-boundary';

// --- Bugsnag Setup ---
Bugsnag.start({
  apiKey: '05fe04ebc304ae56dcdc160914d06c1c',
  plugins: [new BugsnagPluginReact()]
});

BugsnagPerformance.start({ apiKey: '05fe04ebc304ae56dcdc160914d06c1c' });

// ========================================================================
// --- 1. Bugsnag Setup (as provided in your original code) ---
// ========================================================================
Bugsnag.start({
  apiKey: '05fe04ebc304ae56dcdc160914d06c1c', // Your actual API key
  plugins: [new BugsnagPluginReact()]
});

BugsnagPerformance.start({ apiKey: '05fe04ebc304ae56dcdc160914d06c1c' }); // Your actual API key



// ========================================================================
// --- 3. Custom ErrorBoundary Implementation (for improved design) ---
// Custom error boundary component with support for error fallback component
// ========================================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    Bugsnag.notify(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}


// Create a reusable ErrorBoundary component from the Bugsnag plugin

// ========================================================================
// --- 2. Custom Error Fallback Component (with improved design) ---
// This is the beautiful error page that will be displayed to the user.
// ========================================================================
const ErrorFallback = () => (
  <div style={{
    // Full screen styles
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
    color: '#333',
    textAlign: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  }}>
    <div style={{
      // Content card styles
      backgroundColor: '#ffffff',
      padding: '40px 50px',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      maxWidth: '500px',
    }}>
      <h1 style={{
        fontSize: '3rem',
        color: '#d9534f',
        margin: '0 0 10px 0',
      }}>
        Oops!
      </h1>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'normal',
        color: '#555',
        margin: '0 0 25px 0',
      }}>
        Something went wrong.
      </h2>
      <p style={{
        fontSize: '1rem',
        color: '#777',
        lineHeight: '1.6',
        marginBottom: '30px',
      }}>
        We're sorry for the inconvenience. Our team has been automatically
        notified of this issue. Please reload the page to continue.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          // Button styles
          padding: '12px 30px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'background-color 0.2s ease-in-out',
        }}
        // Basic hover effect without CSS classes
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
      >
        Reload Page
      </button>
    </div>
  </div>
);

// ========================================================================
// --- 3. A Component that Intentionally Crashes ---
// This component will throw an error when its state is updated.
// ========================================================================
const CrashingComponent = () => {

  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('I was told to crash!');
  }

  return (
    <button
      onClick={() => setShouldThrow(true)}
      style={{
        padding: '10px 20px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        marginTop: '20px',
      }}
    >
      Click to Trigger a Render Error
    </button>
  );
};




// ========================================================================
// --- 5. Render the App with the Error Boundary ---
// We wrap our main App in the ErrorBoundary. If App (or any child) crashes,
// the ErrorFallback component will be shown instead.
// ========================================================================
ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
      <CrashingComponent />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);


serviceWorker.unregister();
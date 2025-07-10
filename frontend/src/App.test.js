/**
 * Basic App component test
 */

import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the AuthContext to avoid provider issues
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false
  })
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ children }) => <div data-testid="route">{children}</div>,
  Navigate: () => <div data-testid="navigate" />,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn()
  }
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    
    // Check if the app renders with basic structure
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  test('contains required providers', () => {
    render(<App />);
    
    // Verify that the app has the necessary providers
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});

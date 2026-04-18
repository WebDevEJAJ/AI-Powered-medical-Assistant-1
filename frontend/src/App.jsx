import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ResultsPage from './pages/ResultsPage';
import SettingsPage from './pages/SettingsPage';
import userService from './services/userService';

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children }) => {
  const user = userService.getStoredUser();
  return user ? children : <Navigate to="/" />;
};

/**
 * Main App Router
 */
export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
  );
}

export default App;

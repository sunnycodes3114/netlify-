// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NhostReactProvider } from '@nhost/react';
import { nhost } from './lib/nhost'; // Nhost client instance

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AuthGate from './components/AuthGate';   // AuthGate that renders children
import { ApolloWrapper } from './lib/apollo';   // Apollo provider
import ChangePassword from './components/ChangePassword'; // NEW

function App() {
  return (
    <NhostReactProvider nhost={nhost}>
      <ApolloWrapper>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Protected route */}
            <Route
              path="/dashboard"
              element={
                <AuthGate>
                  <Dashboard />
                </AuthGate>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ApolloWrapper>
    </NhostReactProvider>
  );
}

export default App;

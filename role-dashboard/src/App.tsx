import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Users } from '@/pages/Users';
import { UserForm } from '@/pages/UserForm';
import { Settings } from '@/pages/Settings';
import { Unauthorized } from '@/pages/Unauthorized';

function App() {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ==================== PROTECTED ROUTES ==================== */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route
          index
          element={
            <ProtectedRoute permission="dashboard:read">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Users */}
        <Route
          path="users"
          element={
            <ProtectedRoute permission="users:read">
              <Users />
            </ProtectedRoute>
          }
        />

        {/* Create User */}
        <Route
          path="users/new"
          element={
            <ProtectedRoute permission="users:create">
              <UserForm />
            </ProtectedRoute>
          }
        />

        {/* Edit User */}
        <Route
          path="users/edit/:id"
          element={
            <ProtectedRoute permission="users:update">
              <UserForm />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="settings"
          element={
            <ProtectedRoute permission="settings:read">
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all route */}
      <Route
        path="*"
        element={<NavigateToLogin />}
      />
    </Routes>
  );
}

/**
 * Redirect unknown URLs to login.
 */
const NavigateToLogin: React.FC = () => {
  return <></>;
};

export default App;
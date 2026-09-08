import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

import { UserRole } from '@/types';
import { api } from '@/api/client';
import { ROLE_LABELS } from '@/utils/roles';
import { useAuth } from '@/hooks/useAuth';


// Allowed roles for each current user role

const getAllowedRoles = (currentRole: UserRole): UserRole[] => {
  switch (currentRole) {
    case 'admin':
      return ['admin', 'manager', 'editor', 'viewer'];

    case 'manager':
      return ['editor', 'viewer'];

    case 'editor':
      return ['editor', 'viewer'];

    case 'viewer':
      return [];

    default:
      return [];
  }
};


// ─────────────────────────────────────────────
// User Form
// ─────────────────────────────────────────────

export const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const isEditing = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'viewer' as UserRole,
    isActive: true,
  });


  // ─────────────────────────────────────────────
  // Get roles available to current user
  // ─────────────────────────────────────────────

  const allowedRoles: UserRole[] = currentUser
    ? getAllowedRoles(currentUser.role)
    : [];


  // ─────────────────────────────────────────────
  // Load user when editing
  // ─────────────────────────────────────────────

  useEffect(() => {
    const loadUser = async () => {
      if (!isEditing || !id) {
        setIsLoading(false);
        return;
      }

      try {
        const users = await api.getUsers();

        const user = users.find((u) => u.id === id);

        if (user) {
          setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [id, isEditing]);


  // ─────────────────────────────────────────────
  // Handle input changes
  // ─────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };


  // ─────────────────────────────────────────────
  // Handle submit
  // ─────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      if (isEditing && id) {
        // ───────────────────────────────────────
        // UPDATE USER
        // ───────────────────────────────────────

        await api.updateUser(id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        });
      } else {
        // ───────────────────────────────────────
        // CREATE USER
        // ───────────────────────────────────────

        await api.createUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        });
      }

      navigate('/users');
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">
          Loading user...
        </div>
      </div>
    );
  }


  // ─────────────────────────────────────────────
  // Page
  // ─────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/users')}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>


      {/* Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isEditing
              ? 'Update the user information below.'
              : 'Create a new user account.'}
          </p>
        </div>


        {/* Form */}
        <form onSubmit={handleSubmit}>

          <div className="p-6 space-y-5">

            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter first name"
              />
            </div>


            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter last name"
              />
            </div>


            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter email address"
              />
            </div>


            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {allowedRoles.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>

              {/* Explanation */}
              {currentUser?.role === 'manager' && (
                <p className="mt-1 text-xs text-gray-500">
                  Managers can assign Manager, Editor, or Viewer roles.
                </p>
              )}

              {currentUser?.role === 'editor' && (
                <p className="mt-1 text-xs text-gray-500">
                  Editors can assign Editor or Viewer roles.
                </p>
              )}
            </div>


            {/* Active */}
            <div className="flex items-center gap-3">

              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />

              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Active User
              </label>

            </div>

          </div>


          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">

            <button
              type="button"
              onClick={() => navigate('/users')}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />

              {isSubmitting
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create User'}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};
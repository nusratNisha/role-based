import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/utils/roles';
import { Shield, Bell, Lock } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const canUpdateSettings = user ? hasPermission(user.role, 'settings:update') : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your system preferences and security settings</p>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Security</h3>
              <p className="text-sm text-gray-500">Password and authentication settings</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-semibold text-gray-900">Two-factor authentication</p>
              <p className="text-sm text-gray-500 mt-0.5">Add an extra layer of security to your account</p>
            </div>
            <button 
              disabled={!canUpdateSettings}
              className="px-5 py-2.5 text-sm font-semibold text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Enable
            </button>
          </div>

          <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-semibold text-gray-900">Change password</p>
              <p className="text-sm text-gray-500 mt-0.5">Update your password regularly for security</p>
            </div>
            <button 
              disabled={!canUpdateSettings}
              className="px-5 py-2.5 text-sm font-semibold text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">Configure alert preferences</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {['Email notifications', 'Push notifications', 'Weekly reports'].map((item) => (
            <div key={item} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900">{item}</span>
              <input 
                type="checkbox" 
                defaultChecked 
                disabled={!canUpdateSettings}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
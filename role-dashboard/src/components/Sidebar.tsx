import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/utils/roles';
import { RoleBadge } from './RoleBadge';

interface SidebarProps {
  isOpen: boolean; 
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { 
      to: '/', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      permission: 'dashboard:read' as const 
    },
    { 
      to: '/users', 
      label: 'Users', 
      icon: Users, 
      permission: 'users:read' as const 
    },
    { 
      to: '/settings', 
      label: 'Settings', 
      icon: Settings, 
      permission: 'settings:read' as const 
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    user ? hasPermission(user.role, item.permission) : false
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center gap-3">
            {/* <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div> */}
            <span className="font-bold text-lg text-primary-900">RBAC DashBoard</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-primary-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-primary-900" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-700'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-transparent">
            <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <RoleBadge role={user.role} />
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full mt-4 px-3 py-2.5 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
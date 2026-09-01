import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-6">
        <button className="relative p-2.5 text-gray-600 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        </button>
        
        {user && (
          <div className="hidden md:flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Welcome back</p>
              <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
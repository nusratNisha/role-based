import React from 'react';
import { UserRole } from '@/types';
import { ROLE_LABELS } from '@/utils/roles';

interface RoleBadgeProps {
  role: UserRole;
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  manager: 'bg-amber-100 text-amber-800 border-amber-200',
  editor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  viewer: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
};
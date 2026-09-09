import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { User } from '@/types';
import { api } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/utils/roles';
import { RoleBadge } from '@/components/RoleBadge';

export const Users: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canCreate = currentUser ? hasPermission(currentUser.role, 'users:create') : false;
  const canUpdate = currentUser ? hasPermission(currentUser.role, 'users:update') : false;
  const canDelete = currentUser ? hasPermission(currentUser.role, 'users:delete') : false;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await api.getUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    setDeletingId(id);
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-2">Manage system users and assign roles</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/users/new')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-xs">User</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-xs">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-xs">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-xs">Created</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-700 uppercase tracking-wide text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {user.isActive ? '🟢 Active' : '⚫ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { FlaskConical, Pencil, Plus, Trash2 } from 'lucide-react';
import { Project, ProjectStatus, User } from '@/types';
import { api } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/utils/roles';

const statuses: ProjectStatus[] = ['planning', 'active', 'completed', 'archived'];

const statusLabel = (status: ProjectStatus) => status.charAt(0).toUpperCase() + status.slice(1);

export const Projects: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [assignedToId, setAssignedToId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canCreate = currentUser ? hasPermission(currentUser.role, 'projects:create') : false;
  const canUpdate = currentUser ? hasPermission(currentUser.role, 'projects:update') : false;
  const canDelete = currentUser ? hasPermission(currentUser.role, 'projects:delete') : false;
  const canAssign = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  useEffect(() => {
    const load = async () => {
      try {
        const projectData = await api.getProjects();
        setProjects(projectData);
        if (canAssign) setUsers(await api.getUsers());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load projects');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [canAssign]);

  const resetForm = () => {
    setEditingProject(null);
    setShowForm(false);
    setName('');
    setDescription('');
    setStatus('planning');
    setAssignedToId(currentUser?.id ?? '');
    setError('');
  };

  const editProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
    setName(project.name);
    setDescription(project.description ?? '');
    setStatus(project.status);
    setAssignedToId(project.assignedToId);
    setError('');
  };

  const saveProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setError('');
    try {
      const projectData = { name, description, status, assignedToId: assignedToId || currentUser.id };
      if (editingProject) {
        const updated = await api.updateProject(editingProject.id, projectData);
        setProjects(projects.map(project => project.id === updated.id ? updated : project));
      } else {
        const created = await api.createProject(projectData);
        setProjects([created, ...projects]);
      }
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save project');
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      setProjects(projects.filter(project => project.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete project');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lab Projects</h1>
          <p className="text-gray-500 mt-2">Track laboratory work and project ownership</p>
        </div>
        {canCreate && !editingProject && (
          <button onClick={() => { setShowForm(true); setAssignedToId(currentUser?.id ?? ''); setError(''); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
            <Plus className="w-5 h-5" /> New Project
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {(showForm || editingProject) && (
        <form onSubmit={saveProject} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{editingProject ? 'Edit project' : 'Create project'}</h2>
            {editingProject && <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-900">Cancel</button>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">Name<input required value={name} onChange={event => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
            <label className="text-sm font-medium text-gray-700">Status<select value={status} onChange={event => setStatus(event.target.value as ProjectStatus)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">{statuses.map(option => <option key={option} value={option}>{statusLabel(option)}</option>)}</select></label>
          </div>
          <label className="block text-sm font-medium text-gray-700">Description<textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
          {canAssign ? <label className="block text-sm font-medium text-gray-700">Assigned user<select required value={assignedToId} onChange={event => setAssignedToId(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">Select a user</option>{users.map(projectUser => <option key={projectUser.id} value={projectUser.id}>{projectUser.firstName} {projectUser.lastName} ({projectUser.role})</option>)}</select></label> : <p className="text-sm text-gray-500">This project will be assigned to you.</p>}
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : editingProject ? 'Save changes' : 'Create project'}</button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {projects.length === 0 ? <div className="py-16 text-center text-gray-500"><FlaskConical className="mx-auto mb-3 h-10 w-10 text-gray-300" />No projects assigned yet.</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-6 py-4 text-left">Project</th><th className="px-6 py-4 text-left">Status</th><th className="px-6 py-4 text-left">Assigned</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{projects.map(project => { const assignedUser = users.find(projectUser => projectUser.id === project.assignedToId); return <tr key={project.id} className="hover:bg-gray-50"><td className="px-6 py-4"><p className="font-semibold text-gray-900">{project.name}</p><p className="text-gray-500">{project.description || 'No description'}</p></td><td className="px-6 py-4"><span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{statusLabel(project.status)}</span></td><td className="px-6 py-4 text-gray-600">{assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : project.assignedToId === currentUser?.id ? 'You' : 'Assigned user'}</td><td className="px-6 py-4"><div className="flex justify-end gap-2">{canUpdate && <button onClick={() => editProject(project)} title="Edit project" className="rounded-lg p-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600"><Pencil className="h-4 w-4" /></button>}{canDelete && <button onClick={() => void removeProject(project.id)} title="Delete project" className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</div></td></tr>; })}</tbody></table></div>}
      </div>
    </div>
  );
};

'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import { Users2, Plus, Pencil, Trash2, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
}

const ROLES = ['ADMIN', 'EDITOR', 'VIEWER'];
const roleColors: Record<string, string> = { ADMIN: 'text-danger', EDITOR: 'text-accent', VIEWER: 'text-text-secondary' };

const emptyForm = { email: '', name: '', password: '', role: 'EDITOR' };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users').then((r) => r.json()).then(({ data }) => setUsers(data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ email: u.email, name: u.name || '', password: '', role: u.role }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      const payload: any = { name: form.name, role: form.role };
      if (form.password) payload.password = form.password;
      await fetch(`/api/admin/users/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false);
    setShowModal(false);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchUsers();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar title="User Management" subtitle="Admin panel access control" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary"><Users2 size={15} /><span>{users.length} users</span></div>
          <button onClick={openCreate} className="btn-primary"><Plus size={15} />Invite User</button>
        </div>

        {loading ? (
          <div className="glass-card h-48 animate-pulse" />
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-border bg-surface-alt/50">
                <tr>
                  <th className="table-head">User</th>
                  <th className="table-head">Role</th>
                  <th className="table-head hidden md:table-cell">Last Login</th>
                  <th className="table-head text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-accent text-xs font-semibold">{(u.name || u.email)[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{u.name || '—'}</div>
                          <div className="text-xs text-text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${roleColors[u.role] || ''}`}>
                        <Shield size={12} />
                        {u.role}
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell text-xs text-text-muted">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-accent/10 text-text-muted hover:text-accent transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass-card w-full max-w-sm p-6 space-y-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editing ? 'Edit User' : 'Invite User'}</h2>
            <div><label className="label">Name</label><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
            <div><label className="label">Email *</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editing} /></div>
            <div><label className="label">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" /></div>
            <div>
              <label className="label">Role</label>
              <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <p className="text-xs text-text-muted mt-1">ADMIN: full access · EDITOR: content · VIEWER: read-only</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving || (!form.email) || (!editing && !form.password)} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 animate-slide-up text-center space-y-4">
            <Trash2 size={32} className="text-danger mx-auto" />
            <h2 className="text-lg font-semibold">Remove this user?</h2>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

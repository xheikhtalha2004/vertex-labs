'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import { Plus, Pencil, Trash2, FolderOpen, Star } from 'lucide-react';

const CATEGORIES = ['CFD', 'FEA', 'THERMAL', 'MECHANICAL_DESIGN', 'ELECTRONICS', 'SOFTWARE', 'OTHER'];

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  imageUrl?: string;
  featured: boolean;
  active: boolean;
  order: number;
}

const emptyForm = {
  title: '', category: 'OTHER', description: '', tech: [] as string[],
  imageUrl: '', imageAlt: '', featured: false, active: true, order: 0, slug: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');

  const fetchProjects = () => {
    setLoading(true);
    fetch('/api/admin/projects').then((r) => r.json()).then(({ data }) => setProjects(data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setTechInput(''); setShowModal(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ title: p.title, category: p.category, description: p.description, tech: p.tech, imageUrl: p.imageUrl || '', imageAlt: '', featured: p.featured, active: p.active, order: p.order, slug: '' });
    setTechInput(p.tech.join(', '));
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const tech = techInput.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = { ...form, tech };
    const url = editing ? `/api/admin/projects/${editing.id}` : '/api/admin/projects';
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) { setShowModal(false); fetchProjects(); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    if (res.ok) { setDeleteId(null); fetchProjects(); }
  };

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar title="Projects" subtitle="Portfolio case studies" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {['All', ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filter === c ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:border-accent/50'}`}>
                {c.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus size={15} /> Add Project</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-36 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-16 text-text-muted">
            <FolderOpen size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No projects found. Add your first project.</p>
            <button onClick={openCreate} className="btn-primary mt-4 text-sm"><Plus size={14} />Add Project</button>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-border bg-surface-alt/50">
                <tr>
                  <th className="table-head">Title</th>
                  <th className="table-head">Category</th>
                  <th className="table-head hidden md:table-cell">Tech</th>
                  <th className="table-head">Featured</th>
                  <th className="table-head">Status</th>
                  <th className="table-head text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell font-medium text-white">
                      <div className="flex items-center gap-2">
                        {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-8 h-8 rounded object-cover" />}
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td className="table-cell"><span className="badge bg-accent/10 text-accent border-accent/20">{p.category.replace('_', ' ')}</span></td>
                    <td className="table-cell hidden md:table-cell text-xs">{p.tech.slice(0, 3).join(', ')}{p.tech.length > 3 ? '...' : ''}</td>
                    <td className="table-cell">{p.featured && <Star size={14} className="text-yellow-400" />}</td>
                    <td className="table-cell"><span className={`text-xs ${p.active ? 'text-success' : 'text-text-muted'}`}>{p.active ? 'Active' : 'Hidden'}</span></td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-accent/10 text-text-muted hover:text-accent transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"><Trash2 size={13} /></button>
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
          <div className="glass-card w-full max-w-lg p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editing ? 'Edit Project' : 'Add Project'}</h2>
            <div><label className="label">Title *</label><input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. F1 Rear Wing CFD Study" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div><label className="label">Order</label><input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div><label className="label">Description *</label><textarea className="input-field resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="label">Technologies (comma-separated)</label><input className="input-field" value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="ANSYS, OpenFOAM, Python" /></div>
            <div><label className="label">Image URL</label><input className="input-field" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.description} className="btn-primary">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 animate-slide-up text-center space-y-4">
            <Trash2 size={32} className="text-danger mx-auto" />
            <h2 className="text-lg font-semibold">Delete Project?</h2>
            <p className="text-text-secondary text-sm">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

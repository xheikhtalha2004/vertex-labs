'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical, Layers } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  features: string[];
  order: number;
  active: boolean;
}

const emptyForm: Omit<Service, 'id'> = {
  title: '',
  description: '',
  icon: '',
  features: [],
  order: 0,
  active: true,
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [featuresInput, setFeaturesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchServices = () => {
    setLoading(true);
    fetch('/api/admin/services')
      .then((r) => r.json())
      .then(({ data }) => setServices(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFeaturesInput('');
    setShowModal(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description, icon: s.icon || '', features: s.features, order: s.order, active: s.active });
    setFeaturesInput(s.features.join('\n'));
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const features = featuresInput.split('\n').map((f) => f.trim()).filter(Boolean);
    const payload = { ...form, features };
    const url = editing ? `/api/admin/services/${editing.id}` : '/api/admin/services';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setShowModal(false);
      fetchServices();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    if (res.ok) { setDeleteId(null); fetchServices(); }
  };

  const toggleActive = async (s: Service) => {
    await fetch(`/api/admin/services/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    });
    fetchServices();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar title="Services" subtitle="Manage service offerings" />

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Layers size={15} />
            <span>{services.length} services</span>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> Add Service
          </button>
        </div>

        {loading ? (
          <div className="glass-card overflow-hidden animate-pulse h-48" />
        ) : services.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-16 text-text-muted">
            <Layers size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No services yet. Add your first service.</p>
            <button onClick={openCreate} className="btn-primary mt-4 text-sm"><Plus size={14} />Add Service</button>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-border bg-surface-alt/50">
                <tr>
                  <th className="table-head w-8"></th>
                  <th className="table-head">Title</th>
                  <th className="table-head hidden md:table-cell">Description</th>
                  <th className="table-head">Features</th>
                  <th className="table-head">Order</th>
                  <th className="table-head">Status</th>
                  <th className="table-head text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="table-cell"><GripVertical size={14} className="text-text-muted cursor-grab" /></td>
                    <td className="table-cell font-medium text-white">{s.title}</td>
                    <td className="table-cell hidden md:table-cell max-w-xs">
                      <span className="line-clamp-2 text-xs">{s.description}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-xs text-text-muted">{s.features.length} items</span>
                    </td>
                    <td className="table-cell font-mono text-xs">{s.order}</td>
                    <td className="table-cell">
                      <button onClick={() => toggleActive(s)} className="flex items-center gap-1 text-xs">
                        {s.active
                          ? <><ToggleRight size={18} className="text-success" /><span className="text-success">Active</span></>
                          : <><ToggleLeft size={18} className="text-text-muted" /><span className="text-text-muted">Inactive</span></>
                        }
                      </button>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-accent/10 text-text-muted hover:text-accent transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass-card w-full max-w-lg p-6 space-y-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editing ? 'Edit Service' : 'Add Service'}</h2>

            <div>
              <label className="label">Title *</label>
              <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. CFD Analysis" />
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea className="input-field resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what this service entails..." />
            </div>

            <div>
              <label className="label">Features (one per line)</label>
              <textarea className="input-field resize-none font-mono text-xs" rows={4} value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} placeholder="Full mesh independence study&#10;Automated reporting&#10;Peer-review validation" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Icon Name</label>
                <input className="input-field" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. Wind" />
              </div>
              <div>
                <label className="label">Order</label>
                <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
              <span className="text-sm text-text-secondary">Active (visible on public site)</span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.description} className="btn-primary">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 animate-slide-up text-center space-y-4">
            <Trash2 size={32} className="text-danger mx-auto" />
            <h2 className="text-lg font-semibold">Delete Service?</h2>
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

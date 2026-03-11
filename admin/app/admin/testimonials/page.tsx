'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  authorOrg?: string;
  rating: number;
  active: boolean;
  featured: boolean;
}

const emptyForm = { quote: '', authorName: '', authorRole: '', authorOrg: '', authorAvatar: '', rating: 5, active: true, featured: false, order: 0 };

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/admin/testimonials').then((r) => r.json()).then(({ data }) => setItems(data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ quote: t.quote, authorName: t.authorName, authorRole: t.authorRole || '', authorOrg: t.authorOrg || '', authorAvatar: '', rating: t.rating, active: t.active, featured: t.featured, order: 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/admin/testimonials/${editing.id}` : '/api/admin/testimonials';
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { setShowModal(false); fetchItems(); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    if (res.ok) { setDeleteId(null); fetchItems(); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar title="Testimonials" subtitle="Client quotes and reviews" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">{items.length} testimonials</span>
          <button onClick={openCreate} className="btn-primary"><Plus size={15} /> Add Testimonial</button>
        </div>

        {loading ? <div className="glass-card h-48 animate-pulse" /> : items.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-16 text-text-muted">
            <Star size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No testimonials yet.</p>
            <button onClick={openCreate} className="btn-primary mt-4 text-sm"><Plus size={14} />Add Testimonial</button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((t) => (
              <div key={t.id} className="glass-card p-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < t.rating ? 'text-yellow-400 fill-current' : 'text-border'} />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      {t.featured && <span className="badge badge-new text-[10px]">Featured</span>}
                      <span className={`text-xs ${t.active ? 'text-success' : 'text-text-muted'}`}>{t.active ? 'Active' : 'Hidden'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary italic line-clamp-2">"{t.quote}"</p>
                  <div className="mt-2 text-xs font-medium">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ''}{t.authorOrg ? ` at ${t.authorOrg}` : ''}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-accent/10 text-text-muted hover:text-accent transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass-card w-full max-w-lg p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <div><label className="label">Quote *</label><textarea className="input-field resize-none" rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="What the client said..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Author Name *</label><input className="input-field" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} /></div>
              <div><label className="label">Rating (1–5)</label><input type="number" min={1} max={5} className="input-field" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Role</label><input className="input-field" value={form.authorRole} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} placeholder="e.g. CTO" /></div>
              <div><label className="label">Organization</label><input className="input-field" value={form.authorOrg} onChange={(e) => setForm({ ...form, authorOrg: e.target.value })} placeholder="e.g. AeroSpace Dynamics" /></div>
            </div>
            <div><label className="label">Author Avatar URL</label><input className="input-field" value={form.authorAvatar} onChange={(e) => setForm({ ...form, authorAvatar: e.target.value })} placeholder="https://..." /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.quote || !form.authorName} className="btn-primary">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Testimonial'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 animate-slide-up text-center space-y-4">
            <Trash2 size={32} className="text-danger mx-auto" />
            <h2 className="text-lg font-semibold">Delete Testimonial?</h2>
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

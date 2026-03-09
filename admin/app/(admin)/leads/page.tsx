'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import { MessageSquare, Mail, Building, Clock, ChevronDown, Trash2, StickyNote } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType?: string;
  message: string;
  status: string;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  source?: string;
}

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST'];
const statusStyles: Record<string, string> = {
  NEW: 'badge-new', CONTACTED: 'badge-contacted', QUALIFIED: 'badge-qualified',
  PROPOSAL: 'bg-purple-500/15 text-purple-400 border border-purple-500/20 badge',
  CLOSED_WON: 'badge-won', CLOSED_LOST: 'badge-lost',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchLeads = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'All') params.set('status', statusFilter);
    if (search) params.set('search', search);
    fetch(`/api/admin/leads?${params}`).then((r) => r.json()).then(({ data }) => setLeads(data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, [statusFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/leads/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) });
    setSaving(false);
    setSelected((prev) => prev ? { ...prev, notes } : null);
    setLeads((prev) => prev.map((l) => l.id === selected.id ? { ...l, notes } : l));
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    if (res.ok) { setDeleteId(null); setSelected(null); fetchLeads(); }
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <Topbar title="Leads / CRM" subtitle="Contact form submissions and pipeline" />

      <div className="p-6 space-y-5 flex-1">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input-field w-64"
            placeholder="Search name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            {['All', ...STATUSES].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${statusFilter === s ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:border-accent/50'}`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 h-full">
          {/* Leads table */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="glass-card h-64 animate-pulse" />
            ) : leads.length === 0 ? (
              <div className="glass-card flex flex-col items-center justify-center py-16 text-text-muted">
                <MessageSquare size={32} className="mb-3 opacity-30" />
                <p className="text-sm">No leads found.</p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-border bg-surface-alt/50">
                    <tr>
                      <th className="table-head">Contact</th>
                      <th className="table-head hidden md:table-cell">Type</th>
                      <th className="table-head">Status</th>
                      <th className="table-head hidden md:table-cell">Date</th>
                      <th className="table-head"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className={`table-row cursor-pointer ${selected?.id === lead.id ? 'bg-accent/5' : ''}`} onClick={() => { setSelected(lead); setNotes(lead.notes || ''); }}>
                        <td className="table-cell">
                          <div className="font-medium text-white text-sm">{lead.name}</div>
                          <div className="text-xs text-text-muted">{lead.email}</div>
                          {lead.company && <div className="text-xs text-text-muted flex items-center gap-1"><Building size={10} />{lead.company}</div>}
                        </td>
                        <td className="table-cell hidden md:table-cell text-xs">{lead.projectType || '—'}</td>
                        <td className="table-cell">
                          <div className="relative group">
                            <span className={`text-xs ${statusStyles[lead.status] || 'badge'}`}>{lead.status.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="table-cell hidden md:table-cell text-xs text-text-muted">
                          <div className="flex items-center gap-1"><Clock size={10} />{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</div>
                        </td>
                        <td className="table-cell">
                          <button onClick={(e) => { e.stopPropagation(); setDeleteId(lead.id); }} className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Lead detail panel */}
          <div>
            {selected ? (
              <div className="glass-card p-5 space-y-4 sticky top-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{selected.name}</h3>
                    <a href={`mailto:${selected.email}`} className="text-xs text-accent hover:underline flex items-center gap-1"><Mail size={11} />{selected.email}</a>
                  </div>
                  <span className={`text-xs ${statusStyles[selected.status] || 'badge'}`}>{selected.status.replace('_', ' ')}</span>
                </div>

                {selected.company && <div className="text-xs text-text-secondary flex items-center gap-1.5"><Building size={12} className="text-text-muted" />{selected.company}</div>}
                {selected.projectType && <div className="text-xs font-mono bg-surface-alt px-2 py-1 rounded text-text-secondary">{selected.projectType}</div>}

                <div>
                  <label className="label">Message</label>
                  <p className="text-xs text-text-secondary bg-surface-alt rounded-lg p-3 leading-relaxed">{selected.message}</p>
                </div>

                <div>
                  <label className="label">Update Status</label>
                  <select className="input-field text-xs" value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label flex items-center gap-1.5"><StickyNote size={11} />Notes</label>
                  <textarea className="input-field resize-none text-xs" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add internal notes..." />
                  <button onClick={saveNotes} disabled={saving} className="btn-primary w-full justify-center mt-2 text-xs">{saving ? 'Saving...' : 'Save Notes'}</button>
                </div>

                <div className="text-[10px] text-text-muted font-mono">
                  Source: {selected.source || 'contact_form'} · {formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })}
                </div>
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center py-12 text-text-muted text-sm">
                <MessageSquare size={24} className="mb-2 opacity-30" />
                <span>Click a lead to view details</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 animate-slide-up text-center space-y-4">
            <Trash2 size={32} className="text-danger mx-auto" />
            <h2 className="text-lg font-semibold">Delete this lead?</h2>
            <p className="text-text-secondary text-sm">This cannot be undone.</p>
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

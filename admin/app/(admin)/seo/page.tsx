'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import { Search, Save, Plus } from 'lucide-react';

const DEFAULT_PAGES = [
  { slug: 'home', title: 'Home' },
  { slug: 'services', title: 'Services' },
  { slug: 'projects', title: 'Projects / Archive' },
  { slug: 'contact', title: 'Contact' },
];

interface SeoPage {
  id?: string;
  pageSlug: string;
  pageTitle: string;
  metaTitle?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  keywords?: string;
  noIndex: boolean;
}

export default function SeoPage() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [selected, setSelected] = useState<SeoPage | null>(null);
  const [form, setForm] = useState<Partial<SeoPage>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/seo')
      .then((r) => r.json())
      .then(({ data }) => {
        const existing: SeoPage[] = data || [];
        // Merge with defaults to ensure all pages appear
        const merged = DEFAULT_PAGES.map((dp) => {
          const found = existing.find((p) => p.pageSlug === dp.slug);
          return found || { pageSlug: dp.slug, pageTitle: dp.title, noIndex: false };
        });
        setPages(merged);
        setSelected(merged[0]);
        setForm(merged[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (page: SeoPage) => {
    setSelected(page);
    setForm(page);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!form.pageSlug) return;
    setSaving(true);
    const res = await fetch('/api/admin/seo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, pageSlug: form.pageSlug }),
    });
    const { data } = await res.json();
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setPages((prev) => prev.map((p) => p.pageSlug === data.pageSlug ? data : p));
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const charCount = (val?: string, max?: number) =>
    val ? `${val.length}${max ? `/${max}` : ''}` : `0${max ? `/${max}` : ''}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar title="SEO Manager" subtitle="Per-page meta, OG tags, and search settings" />
      <div className="p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Page selector */}
          <div className="space-y-2">
            <label className="label">Pages</label>
            {loading ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-surface rounded-lg animate-pulse" />)}</div>
            ) : (
              pages.map((page) => (
                <button
                  key={page.pageSlug}
                  onClick={() => handleSelect(page)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-150 border ${selected?.pageSlug === page.pageSlug ? 'bg-accent/15 text-white border-accent/30' : 'border-border text-text-secondary hover:text-white hover:bg-surface-alt'}`}
                >
                  <div className="flex items-center gap-2">
                    <Search size={13} className={selected?.pageSlug === page.pageSlug ? 'text-accent' : 'text-text-muted'} />
                    {page.pageTitle}
                  </div>
                  <div className="text-[10px] font-mono text-text-muted mt-0.5">/{page.pageSlug}</div>
                </button>
              ))
            )}
          </div>

          {/* SEO form */}
          {selected && (
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">/{form.pageSlug}</h2>
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : saved ? '✓ Saved' : <><Save size={14} />Save</>}
                </button>
              </div>

              <div className="form-section">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Basic SEO</h3>

                <div>
                  <label className="label flex justify-between">
                    <span>Page Title</span>
                  </label>
                  <input className="input-field" value={form.pageTitle || ''} onChange={(e) => setForm({ ...form, pageTitle: e.target.value })} placeholder="e.g. Engineering Services | Vertex Labs" />
                </div>

                <div>
                  <label className="label flex justify-between">
                    <span>Meta Title</span>
                    <span className={`font-mono ${(form.metaTitle?.length || 0) > 60 ? 'text-danger' : 'text-text-muted'}`}>{charCount(form.metaTitle, 70)}</span>
                  </label>
                  <input className="input-field" value={form.metaTitle || ''} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="Overrides page title for search engines (max 70 chars)" />
                </div>

                <div>
                  <label className="label flex justify-between">
                    <span>Meta Description</span>
                    <span className={`font-mono ${(form.description?.length || 0) > 155 ? 'text-danger' : 'text-text-muted'}`}>{charCount(form.description, 160)}</span>
                  </label>
                  <textarea className="input-field resize-none" rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Compelling summary for search results (max 160 chars)" />
                </div>

                <div>
                  <label className="label">Keywords</label>
                  <input className="input-field" value={form.keywords || ''} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="CFD analysis, FEA simulation, engineering services..." />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
                  <input type="checkbox" checked={form.noIndex || false} onChange={(e) => setForm({ ...form, noIndex: e.target.checked })} />
                  <span>No Index (exclude from search engines)</span>
                </label>
              </div>

              <div className="form-section">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Open Graph (Social Sharing)</h3>
                <div>
                  <label className="label flex justify-between">
                    <span>OG Title</span>
                    <span className="font-mono text-text-muted">{charCount(form.ogTitle, 70)}</span>
                  </label>
                  <input className="input-field" value={form.ogTitle || ''} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} placeholder="Title shown when shared on social media" />
                </div>
                <div>
                  <label className="label flex justify-between">
                    <span>OG Description</span>
                    <span className="font-mono text-text-muted">{charCount(form.ogDescription, 200)}</span>
                  </label>
                  <textarea className="input-field resize-none" rows={2} value={form.ogDescription || ''} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })} />
                </div>
                <div>
                  <label className="label">OG Image URL</label>
                  <input className="input-field" value={form.ogImage || ''} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} placeholder="https://... (1200×630 recommended)" />
                  {form.ogImage && <img src={form.ogImage} alt="OG preview" className="mt-2 rounded-lg h-20 object-cover" />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

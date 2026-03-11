'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import { Home, Save, Eye } from 'lucide-react';

interface HomepageData {
  heroHeadline: string;
  heroHighlight: string;
  heroSubcopy: string;
  heroBadge1: string;
  heroBadge2: string;
  heroBadge3: string;
  stat1Value: string; stat1Label: string;
  stat2Value: string; stat2Label: string;
  stat3Value: string; stat3Label: string;
  stat4Value: string; stat4Label: string;
  activeProjectsCount: number;
}

const defaultData: HomepageData = {
  heroHeadline: 'Engineering Solvency at Scale.',
  heroHighlight: 'Solvency',
  heroSubcopy: 'We don\'t "make things pretty." We engineer outcomes.',
  heroBadge1: 'ISO 9001:2015', heroBadge2: 'ON-PREMISE LAB', heroBadge3: 'HPC CLUSTER READY',
  stat1Value: '247+', stat1Label: 'Projects Shipped',
  stat2Value: '99.70%', stat2Label: 'Analysis Precision',
  stat3Value: '$2.4M+', stat3Label: 'Cost Avoided',
  stat4Value: '24/7', stat4Label: 'Lab Access',
  activeProjectsCount: 1,
};

export default function HomepagePage() {
  const [form, setForm] = useState<HomepageData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/homepage')
      .then((r) => r.json())
      .then(({ data }) => { if (data) setForm(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    console.log('Save clicked, form state:', form);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      setSaving(false);
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch (err) {
      console.error('Save error:', err);
      setSaving(false);
    }
  };

  type StringKeys = { [K in keyof HomepageData]: HomepageData[K] extends string ? K : never }[keyof HomepageData];
  const F = ({ label, field, placeholder, multiline }: { label: string; field: StringKeys; placeholder?: string; multiline?: boolean }) => (
    <div>
      <label className="label">{label}</label>
      {multiline ? (
        <textarea className="input-field resize-none" rows={3} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder} />
      ) : (
        <input className="input-field" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder} />
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar title="Homepage Manager" subtitle="Edit hero content, stats, and badges" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary text-sm"><Home size={15} /><span>Live homepage content</span></div>
          <div className="flex gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs"><Eye size={13} />Preview</a>
            <button onClick={handleSave} disabled={saving || loading} className="btn-primary">
              {saving ? 'Saving...' : saved ? '✓ Saved' : <><Save size={14} />Save Changes</>}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card h-32 animate-pulse" />)}</div>
        ) : (
          <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Hero content */}
            <div className="form-section space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Hero Section</h3>
              <F label="Hero Headline" field="heroHeadline" placeholder="Engineering Solvency at Scale." />
              <div>
                <label className="label">Highlighted Word</label>
                <input className="input-field" value={form.heroHighlight} onChange={(e) => setForm({ ...form, heroHighlight: e.target.value })} placeholder="Solvency" />
                <p className="text-xs text-text-muted mt-1">This word will be highlighted with the gradient color in the headline.</p>
              </div>
              <F label="Hero Sub-copy" field="heroSubcopy" multiline placeholder="We don't 'make things pretty.' We engineer outcomes." />

              <div>
                <label className="label">Preview</label>
                <div className="bg-surface-alt rounded-lg p-4 border border-border">
                  <h1 className="text-2xl font-bold leading-tight">
                    {form.heroHeadline.includes(form.heroHighlight)
                      ? form.heroHeadline.split(form.heroHighlight).map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && <span className="text-gradient">{form.heroHighlight}</span>}
                          </span>
                        ))
                      : form.heroHeadline
                    }
                  </h1>
                  <p className="text-sm text-text-secondary mt-2">{form.heroSubcopy}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Stats */}
              <div className="form-section">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Hero Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {([1, 2, 3, 4] as const).map((n) => (
                    <div key={n} className="p-3 bg-surface-alt rounded-lg border border-border">
                      <label className="label">Stat {n}</label>
                      <input className="input-field mb-1.5" value={String(form[`stat${n}Value` as keyof HomepageData])} onChange={(e) => setForm({ ...form, [`stat${n}Value`]: e.target.value })} placeholder="Value" />
                      <input className="input-field text-xs" value={String(form[`stat${n}Label` as keyof HomepageData])} onChange={(e) => setForm({ ...form, [`stat${n}Label`]: e.target.value })} placeholder="Label" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="form-section">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Trust Badges</h3>
                <div className="space-y-2">
                  {([1, 2, 3] as const).map((n) => (
                    <input key={n} className="input-field text-xs" value={String(form[`heroBadge${n}` as keyof HomepageData])} onChange={(e) => setForm({ ...form, [`heroBadge${n}`]: e.target.value })} placeholder={`Badge ${n}`} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {[form.heroBadge1, form.heroBadge2, form.heroBadge3].filter(Boolean).map((b, i) => (
                    <span key={i} className="font-mono text-[10px] uppercase tracking-wider text-text-secondary bg-surface px-2 py-0.5 rounded-full border border-border">{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Laboratory Metrics */}
          <div className="form-section mt-6">            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Laboratory Metrics</h3>
            <p className="text-xs text-text-muted mb-4">Controls the live metrics strip shown on the public site.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-surface-alt border border-border rounded-lg px-4 py-3">
                <span className="text-sm text-text-secondary font-mono uppercase tracking-wide w-32">Active Projects</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, activeProjectsCount: Math.max(0, form.activeProjectsCount - 1) })}
                    className="w-8 h-8 rounded-md bg-surface border border-border flex items-center justify-center text-text-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors font-bold text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-2xl font-bold tabular-nums">{form.activeProjectsCount}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, activeProjectsCount: form.activeProjectsCount + 1 })}
                    className="w-8 h-8 rounded-md bg-surface border border-border flex items-center justify-center text-text-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors font-bold text-lg leading-none"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] font-mono text-[#4F6DF5] ml-2">🌍 LIVE STATUS</span>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

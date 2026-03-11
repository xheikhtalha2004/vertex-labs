'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import { Settings, Save } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label?: string;
  group?: string;
  type: string;
}

const GROUPS = ['general', 'contact', 'social', 'appearance'];
const GROUP_LABELS: Record<string, string> = {
  general: 'General', contact: 'Contact Information', social: 'Social Media', appearance: 'Appearance',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then(({ data }) => {
        setSettings(data || []);
        const map: Record<string, string> = {};
        (data || []).forEach((s: Setting) => { map[s.key] = s.value; });
        setValues(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = Object.entries(values).map(([key, value]) => ({ key, value }));
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const byGroup = GROUPS.reduce((acc, group) => {
    acc[group] = settings.filter((s) => s.group === group);
    return acc;
  }, {} as Record<string, Setting[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar title="Site Settings" subtitle="Global site configuration" />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving || loading} className="btn-primary">
            {saving ? 'Saving...' : saved ? '✓ Saved' : <><Save size={14} />Save Changes</>}
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="glass-card h-32 animate-pulse" />)}</div>
        ) : (
          GROUPS.map((group) => {
            const groupSettings = byGroup[group] || [];
            if (groupSettings.length === 0) return null;
            return (
              <div key={group} className="form-section">
                <div className="flex items-center gap-2 mb-5">
                  <Settings size={14} className="text-accent" />
                  <h3 className="text-sm font-semibold">{GROUP_LABELS[group] || group}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupSettings.map((s) => (
                    <div key={s.key}>
                      <label className="label">{s.label || s.key}</label>
                      {s.key === 'primary_color' ? (
                        <div className="flex gap-2 items-center">
                          <input type="color" value={values[s.key] || '#4F6DF5'} onChange={(e) => setValues({ ...values, [s.key]: e.target.value })} className="w-10 h-9 rounded cursor-pointer bg-surface-alt border border-border p-0.5" />
                          <input className="input-field flex-1" value={values[s.key] || ''} onChange={(e) => setValues({ ...values, [s.key]: e.target.value })} placeholder="#4F6DF5" />
                        </div>
                      ) : (
                        <input
                          className="input-field"
                          type={s.key.includes('email') ? 'email' : s.key.includes('url') ? 'url' : 'text'}
                          value={values[s.key] || ''}
                          onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                          placeholder={`Enter ${s.label || s.key}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

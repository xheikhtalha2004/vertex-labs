'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import { LayoutDashboard, MessageSquare, FolderOpen, Layers, Star, Image, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  totalProjects: number;
  totalServices: number;
  totalTestimonials: number;
  totalMedia: number;
}

interface RecentLead {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  userEmail?: string;
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  NEW: 'badge-new',
  CONTACTED: 'badge-contacted',
  QUALIFIED: 'badge-qualified',
  PROPOSAL: 'badge-proposal',
  CLOSED_WON: 'badge-won',
  CLOSED_LOST: 'badge-lost',
};

const actionColor: Record<string, string> = {
  CREATE: 'text-success',
  UPDATE: 'text-warning',
  DELETE: 'text-danger',
  LOGIN: 'text-accent',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setStats(data.stats);
          setRecentLeads(data.recentLeads);
          setAuditLogs(data.recentAuditLogs);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Leads', value: stats.totalLeads, sub: `${stats.newLeads} new`, icon: MessageSquare, href: '/admin/leads', color: 'text-accent' },
        { label: 'Projects', value: stats.totalProjects, sub: 'active', icon: FolderOpen, href: '/admin/projects', color: 'text-purple-400' },
        { label: 'Services', value: stats.totalServices, sub: 'active', icon: Layers, href: '/admin/services', color: 'text-blue-400' },
        { label: 'Testimonials', value: stats.totalTestimonials, sub: 'active', icon: Star, href: '/admin/testimonials', color: 'text-yellow-400' },
        { label: 'Media Assets', value: stats.totalMedia, sub: 'uploaded', icon: Image, href: '/admin/media', color: 'text-pink-400' },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar title="Dashboard" subtitle="Vertex Labs Control Center" />

      <div className="space-y-6 p-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Overview</h2>
            <p className="text-text-secondary text-sm mt-0.5">Real-time CMS + CRM summary</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-surface px-3 py-1.5 rounded-full border border-border">
            <TrendingUp size={12} className="text-success" />
            <span>Live data</span>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="stat-card animate-pulse">
                <div className="w-8 h-8 bg-surface-alt rounded-lg" />
                <div className="h-6 bg-surface-alt rounded w-12" />
                <div className="h-3 bg-surface-alt rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((card) => (
              <Link key={card.label} href={card.href} className="stat-card hover:border-accent/30 transition-colors group">
                <card.icon size={20} className={card.color} />
                <span className="text-2xl font-bold">{card.value}</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{card.label}</span>
                  <ArrowRight size={12} className="text-text-muted group-hover:text-accent transition-colors" />
                </div>
                <span className="text-[10px] text-text-muted font-mono uppercase">{card.sub}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Recent activity grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MessageSquare size={15} className="text-accent" />
                Recent Leads
              </h3>
              <Link href="/admin/leads" className="text-xs text-accent hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-border">
              {recentLeads.length === 0 ? (
                <div className="px-5 py-8 text-center text-text-muted text-sm">No leads yet</div>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="px-5 py-3 hover:bg-surface-alt/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{lead.name}</div>
                        <div className="text-xs text-text-muted">{lead.email}{lead.company ? ` · ${lead.company}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={statusBadge[lead.status] || 'badge'}>{lead.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-text-muted">
                      <Clock size={9} />
                      <span>{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <LayoutDashboard size={15} className="text-accent" />
                Audit Log
              </h3>
            </div>
            <div className="divide-y divide-border">
              {auditLogs.length === 0 ? (
                <div className="px-5 py-8 text-center text-text-muted text-sm">No activity yet</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="px-5 py-3 hover:bg-surface-alt/40 transition-colors">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`font-mono text-xs font-bold ${actionColor[log.action] || 'text-text-secondary'}`}>{log.action}</span>
                      <span className="text-text-secondary">{log.entity}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-text-muted">
                      <Clock size={9} />
                      <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                      {log.userEmail && <span>· {log.userEmail}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Add Service', href: '/admin/services' },
              { label: 'Add Project', href: '/admin/projects' },
              { label: 'Add Testimonial', href: '/admin/testimonials' },
              { label: 'Upload Media', href: '/admin/media' },
              { label: 'Update SEO', href: '/admin/seo' },
              { label: 'Edit Settings', href: '/admin/settings' },
            ].map((a) => (
              <Link key={a.label} href={a.href} className="btn-secondary text-xs py-1.5 px-3">
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

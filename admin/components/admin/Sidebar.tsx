'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, Home, Layers, FolderOpen, Star, Users2,
  Image, Search, Settings, LogOut, ChevronRight, Shield,
  MessageSquare, Zap
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Homepage', href: '/admin/homepage', icon: Home },
  { label: 'Services', href: '/admin/services', icon: Layers },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { label: 'Leads / CRM', href: '/admin/leads', icon: MessageSquare, badge: true },
  { label: 'Media Library', href: '/admin/media', icon: Image },
  { label: 'SEO', href: '/admin/seo', icon: Search },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const adminOnlyItems = [
  { label: 'Users', href: '/admin/users', icon: Users2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface border-r border-border z-50 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 border-2 border-accent rounded flex items-center justify-center flex-shrink-0">
          <span className="text-accent font-bold text-sm">V</span>
        </div>
        <div>
          <div className="font-bold text-sm tracking-tight">VERTEX.LABS</div>
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider px-3 mb-2">Content</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} className={isActive ? 'text-accent' : 'text-text-muted'} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={12} className="text-accent" />}
            </Link>
          );
        })}

        {session?.user?.role === 'ADMIN' && (
          <>
            <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider px-3 mb-2 mt-4">Administration</div>
            {adminOnlyItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={16} className={isActive ? 'text-accent' : 'text-text-muted'} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={12} className="text-accent" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        {/* View public site link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link mb-1 text-xs"
        >
          <Zap size={14} className="text-text-muted" />
          <span>View Public Site</span>
        </a>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-alt mt-1">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent text-xs font-semibold">
              {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{session?.user?.name || 'Admin'}</div>
            <div className="text-[10px] text-text-muted flex items-center gap-1">
              <Shield size={9} />
              <span>{session?.user?.role || 'EDITOR'}</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1 rounded text-text-muted hover:text-danger transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

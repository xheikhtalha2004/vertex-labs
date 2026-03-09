'use client';

import { useSession } from 'next-auth/react';
import { Bell, Search } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-border bg-bg/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-base font-semibold">{title}</h1>
        {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Live status indicator */}
        <div className="flex items-center gap-1.5 text-xs text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle" />
          <span className="font-mono">LIVE</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="text-xs text-text-secondary font-mono">
          {session?.user?.email}
        </div>
      </div>
    </header>
  );
}

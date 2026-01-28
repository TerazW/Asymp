'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  GitBranch,
  Users,
  Settings,
  Zap,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Routing', href: '/routing', icon: GitBranch },
  { name: 'Ownership', href: '/ownership', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-[#0d0d14] border-r border-[#1f1f2e]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-[#1f1f2e]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-white">Asymp</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Status indicator */}
      <div className="px-4 py-4 border-t border-[#1f1f2e]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12121a]">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full pulse-ring"></div>
          </div>
          <span className="text-xs text-gray-400">System operational</span>
        </div>
      </div>

      {/* Settings */}
      <div className="px-3 py-3 border-t border-[#1f1f2e]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}

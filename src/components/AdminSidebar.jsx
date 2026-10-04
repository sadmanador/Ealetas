'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Gem,
  PackageCheck,
  Boxes,
  Users,
  Compass,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  ExternalLink,
  PhoneCall,
} from 'lucide-react';

export default function AdminSidebar({ session }) {
  const pathname = usePathname();

  // If on login page, don't show sidebar
  if (pathname === '/admin/login') {
    return null;
  }

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products & Stock', href: '/admin/products', icon: Gem },
    { name: 'Orders & Logistics', href: '/admin/orders', icon: PackageCheck },
    { name: 'Packaging Items', href: '/admin/packaging', icon: Boxes },
    { name: 'Customer Directory', href: '/admin/customers', icon: Users },
    { name: 'Procure Travel Cost', href: '/admin/procurement', icon: Compass },
    { name: 'Page Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Delivery Settings', href: '/admin/settings', icon: Settings },
    { name: 'My Profile & SMS', href: '/admin/profile', icon: UserCog },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#081a38] text-[#c0d3eb] flex flex-col justify-between shrink-0 border-r border-[#122e5a]">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-[#122e5a]">
          <Link href="/admin" className="block">
            <span className="font-serif text-2xl tracking-[0.15em] text-white block">
              ELETAS
            </span>
            <span className="text-[9px] tracking-[0.3em] text-[#8bb9ee] uppercase block font-medium">
              JEWELS ADMINISTRATION
            </span>
          </Link>
        </div>

        {/* Current Admin badge */}
        <div className="p-3.5 mx-4 my-3 bg-[#0d254c] border border-[#16396e] rounded-lg text-xs space-y-1">
          <div className="font-medium text-white line-clamp-1">{session?.user?.name || 'Administrator'}</div>
          <div className="text-[11px] text-[#8bb9ee] flex items-center gap-1.5">
            <PhoneCall className="w-3 h-3" />
            <span>SMS: {session?.user?.phone || 'Not set'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium transition-all ${
                  isActive
                    ? 'bg-[#0f388a] text-white shadow-md'
                    : 'text-[#8daecf] hover:text-white hover:bg-[#0d254c]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#262420] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 text-xs text-[#9c978f] hover:text-white transition-colors"
        >
          <span>View Public Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

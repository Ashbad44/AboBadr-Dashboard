'use client';

import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">📊</div>
      {LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </a>
      ))}
      <div className="sidebar-footer">
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    </div>
  );
}

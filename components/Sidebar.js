'use client';

import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { useLabels } from '../lib/LabelsContext';
import { useTextStyles, styleToCss } from '../lib/TextStylesContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));

  const LINKS = [
    { href: '/dashboard', label: t('nav_dashboard'), key: 'nav_dashboard', icon: '🏠' },
    { href: '/reports', label: t('nav_annual_report'), key: 'nav_annual_report', icon: '📅' },
    { href: '/branches-report', label: t('nav_branches_report'), key: 'nav_branches_report', icon: '🏢' },
    { href: '/branch-net-income', label: t('nav_branch_net_income'), key: 'nav_branch_net_income', icon: '📉' },
    { href: '/yearly-totals', label: t('nav_yearly_totals'), key: 'nav_yearly_totals', icon: '📆' },
    { href: '/settings', label: t('nav_settings'), key: 'nav_settings', icon: '⚙️' },
    { href: '/summary', label: t('nav_executive_summary'), key: 'nav_executive_summary', icon: '⭐' },
  ];

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
          <span style={ls(link.key)}>{link.label}</span>
        </a>
      ))}
      <div className="sidebar-footer">
        <button onClick={handleSignOut} style={ls('sign_out')}>{t('sign_out')}</button>
      </div>
    </div>
  );
}

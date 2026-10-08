import { DashboardShell } from './shell/DashboardShell';
import sidebarConfig from './shell/sidebarConfig';
import {
  LayoutDashboard,
  Users,
  Building2,
  Trophy,
  Handshake,
  CreditCard,
} from 'lucide-react';

/**
 * SuperAdminLayout — thin config wrapper around the shared
 * DashboardShell (PRD §8.3).
 */
export function SuperAdminLayout({ children }) {
  const sidebar = sidebarConfig({
    portal: 'Super Admin',
    portalIcon: CreditCard,
    brandSuffix: 'Admin',
    main: [
      { label: 'Dashboard', path: '/superadmin/dashboard', icon: LayoutDashboard, end: true },
      { label: 'Players', path: '/superadmin/users', icon: Users },
      { label: 'Organizers KYC', path: '/superadmin/organizers', icon: Building2 },
      { label: 'Tournaments', path: '/superadmin/tournaments', icon: Trophy },
      { label: 'Corporate Sponsors', path: '/superadmin/sponsors', icon: Handshake },
      { label: 'Sponsorships', path: '/superadmin/sponsorships', icon: Handshake },
      { label: 'Payments & Escrow', path: '/superadmin/payments', icon: CreditCard },
    ],
  });

  return (
    <DashboardShell sidebar={sidebar} header={{ title: 'Governance Suite' }}>
      {children}
    </DashboardShell>
  );
}

export default SuperAdminLayout;

import { DashboardShell } from "./shell/DashboardShell";
import sidebarConfig from "./shell/sidebarConfig";
import {
  LayoutDashboard,
  Trophy,
  Handshake,
  BarChart3,
  Building2,
} from "lucide-react";

/**
 * SponsorLayout — thin config wrapper around the shared
 * DashboardShell (PRD §8.3).
 */
export function SponsorLayout({ children }) {
  const sidebar = sidebarConfig({
    portal: 'Sponsor Portal',
    portalIcon: Handshake,
    main: [
      { label: 'Dashboard', path: '/sponsor/dashboard', icon: LayoutDashboard, end: true },
      { label: 'Browse Tournaments', path: '/sponsor/tournaments', icon: Trophy },
      { label: 'My Sponsorships', path: '/sponsor/sponsorships', icon: Handshake },
      { label: 'ROI & Reach', path: '/sponsor/analytics', icon: BarChart3 },
    ],
    account: [
      { label: 'Company Profile', path: '/sponsor/profile', icon: Building2 },
    ],
  });

  return (
    <DashboardShell sidebar={sidebar} header={{ title: 'Sponsor Dashboard' }}>
      {children}
    </DashboardShell>
  );
}

export default SponsorLayout;

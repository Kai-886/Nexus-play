import { DashboardShell } from "./shell/DashboardShell";
import sidebarConfig from "./shell/sidebarConfig";
import {
  LayoutDashboard,
  Trophy,
  PlusCircle,
  History,
  Handshake,
  User,
  Settings,
} from "lucide-react";

/**
 * OrganizerLayout — thin config wrapper around the shared
 * DashboardShell (PRD §8.3). Nav data only; chrome lives in the shell.
 */
export function OrganizerLayout({ children }) {
  const sidebar = sidebarConfig({
    portal: "Organizer Portal",
    portalIcon: Trophy,
    main: [
      { label: "Dashboard", path: "/organizer/dashboard", icon: LayoutDashboard, end: true },
      { label: "Tournaments", path: "/organizer/tournaments", icon: Trophy, end: true },
      { label: "Create Tournament", path: "/organizer/tournaments/create", icon: PlusCircle },
      { label: "History", path: "/organizer/history", icon: History },
      { label: "Sponsors", path: "/organizer/sponsors", icon: Handshake },
    ],
    account: [
      { label: "Profile", path: "/organizer/profile", icon: User },
      { label: "Settings", path: "/organizer/settings", icon: Settings },
    ],
  });

  return (
    <DashboardShell sidebar={sidebar} header={{ title: "Organizer Dashboard" }}>
      {children}
    </DashboardShell>
  );
}

export default OrganizerLayout;

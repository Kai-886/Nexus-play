import { useLocation } from "react-router-dom";
import {
  Gamepad2,
  Trophy,
  ClipboardList,
  User,
  Settings,
} from "lucide-react";

import { DashboardShell } from "./shell/DashboardShell";
import sidebarConfig from "./shell/sidebarConfig";

export const ParticipantLayout = ({ children }) => {
  const location = useLocation();

  /* Page title from the path segment (preserved from the old layout) */
  const getPageTitle = () => {
    const segment = location.pathname.split("/")[2];

    switch (segment) {
      case "tournaments":
        return "Explore Tournaments";

      case "history":
        return "Tournament History";

      case "profile":
        return "Player Profile";

      case "settings":
        return "Account Settings";

      default:
        return "Player Dashboard";
    }
  };

  const sidebar = sidebarConfig({
    portal: 'Student Arena',
    portalIcon: Gamepad2,
    main: [
      { label: 'Dashboard', path: '/participant/dashboard', icon: Gamepad2, end: true },
      { label: 'Tournaments', path: '/participant/tournaments', icon: Trophy },
      { label: 'Participation History', path: '/participant/history', icon: ClipboardList },
    ],
    account: [
      { label: 'Profile', path: '/participant/profile', icon: User },
      { label: 'Settings', path: '/participant/settings', icon: Settings },
    ],
  });

  return (
    <DashboardShell
      sidebar={sidebar}
      header={{ title: getPageTitle() }}
    >
      {children}
    </DashboardShell>
  );
};

export default ParticipantLayout;

import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  Gamepad2,
  LogOut,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { logoutUser } from "../../../services/authService";

/**
 * DashboardShell — PRD §8.3 shared dashboard chrome for all roles.
 *
 * One implementation replaces the four duplicated role layouts:
 *
 *  - Icon rail (w-[76px]) when collapsed, 288px panel when expanded;
 *    active item gets the glow rail; collapsed items show tooltips.
 *  - Desktop: collapsible rail, expanded by default (persisted per
 *    session via sessionStorage). Mobile: overlay drawer, closed on
 *    load, body-scroll locked while open.
 *  - Glass sticky header: search, theme toggle, notifications,
 *    user pill. Portal copy comes from `sidebar` config.
 *  - Page enter choreography: children fade-rise on mount (np-boot),
 *    re-keyed by location.pathname so each route enters fresh.
 *
 * Props:
 *   sidebar   — config from sidebarConfig() (portal, icons, nav items)
 *   header    — { title } or a render fn receiving { user }
 *   children  — page content
 */

/* ---------- Sidebar (rail + panel) ---------- */

function ShellSidebar({ config, expanded, onNavigate }) {
  const { portal, portalIcon: PortalIcon, brandSuffix, main, account } = config;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      await logout();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Failed to logout");
    }
  };

  const itemClass = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "np-nav-active text-white"
        : "theme-subtext hover:theme-text theme-hover"
    } ${expanded ? "" : "justify-center px-0"}`;

  return (
    <aside
      className={`theme-card flex h-screen flex-col border-r theme-border transition-[width] duration-300 [transition-timing-function:var(--ease-out-expo)] ${
        expanded ? "w-[288px]" : "w-[76px]"
      }`}
    >
      {/* Brand */}
      <div
        className={`flex h-16 shrink-0 items-center border-b theme-border px-4 ${
          expanded ? "gap-3" : "justify-center px-0"
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--np-accent)] shadow-md shadow-indigo-600/30">
          {PortalIcon ? (
            <PortalIcon className="h-5 w-5 text-white" />
          ) : (
            <Gamepad2 className="h-5 w-5 text-white" />
          )}
        </div>

        {expanded && (
          <div className="min-w-0">
            <p className="font-display text-base font-bold leading-tight tracking-wide theme-text">
              Nexus
              <span className="text-[var(--np-accent-2)]">{brandSuffix}</span>
            </p>

            <p className="truncate text-[10px] font-bold uppercase tracking-widest theme-subtext">
              {portal}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden p-3">
        {expanded && (
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest theme-subtext">
            Menu
          </p>
        )}

        {main.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            title={!expanded ? item.label : undefined}
            className={itemClass}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />

            {expanded ? (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                <ChevronRight className="np-nav-chevron h-4 w-4 opacity-0" aria-hidden="true" />
              </>
            ) : (
              <span className="np-tooltip" role="tooltip">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}

        {account?.length > 0 && (
          <>
            <div className="!mt-6 border-t theme-border pt-4">
              {expanded && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest theme-subtext">
                  Account
                </p>
              )}

              <div className="space-y-1.5">
                {account.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    title={!expanded ? item.label : undefined}
                    className={itemClass}
                  >
                    <item.icon
                      className="h-[18px] w-[18px] shrink-0"
                      aria-hidden="true"
                    />

                    {expanded ? (
                      <span className="flex-1 truncate">{item.label}</span>
                    ) : (
                      <span className="np-tooltip" role="tooltip">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t theme-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          title={!expanded ? "Logout" : undefined}
          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--np-danger)] transition hover:bg-[color-mix(in_srgb,var(--np-danger)_10%,transparent)] ${
            expanded ? "" : "justify-center px-0"
          }`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />

          {expanded ? (
            <span>Logout</span>
          ) : (
            <span className="np-tooltip" role="tooltip">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

/* ---------- Header ---------- */

function ShellHeader({
  expanded,
  onToggleSidebar,
  profilePath,
  title,
  user,
  initial,
}) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [bellOpen, setBellOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bellRef = useRef(null);

  // Glass-on-scroll: the header turns to glass once content moves under it
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className={`np-header-glass ${scrolled ? "is-scrolled" : ""} sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b theme-border px-4 sm:px-6`}
    >
      {/* Left: toggle + title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="theme-hover hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border theme-border theme-subtext transition hover:theme-text md:flex"
          title={expanded ? "Collapse menu" : "Expand menu"}
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="theme-hover flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border theme-border theme-subtext transition hover:theme-text md:hidden"
          title="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          {typeof title === "function" ? (
            title({ user })
          ) : (
            <h2 className="truncate font-display text-base font-bold tracking-wide theme-text">
              {title}
            </h2>
          )}
        </div>
      </div>

      {/* Right: theme + notifications + profile */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-hover flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg theme-subtext transition hover:theme-text"
          title="Toggle theme"
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
        >
          {/* Moon↔Sun orbit-crossfade — both stay mounted so the swap
              animates; see .np-theme-disc in index.css. */}
          <span
            className="np-theme-disc"
            data-dark={theme === "dark" ? "true" : "false"}
          >
            <Moon className="np-theme-icon np-theme-icon--moon" />
            <Sun className="np-theme-icon np-theme-icon--sun" />
          </span>
        </button>

        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => setBellOpen((prev) => !prev)}
            className="theme-hover relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg theme-subtext transition hover:theme-text"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          {bellOpen && (
            <div className="np-glass absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border theme-border p-4 shadow-xl">
              <p className="np-eyebrow mb-2">Notifications</p>

              <p className="py-6 text-center text-xs theme-subtext">
                No new notifications.
              </p>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[var(--np-stroke)]" />

        <button
          type="button"
          onClick={() => profilePath && navigate(profilePath)}
          className="theme-hover flex cursor-pointer items-center gap-2.5 rounded-xl border theme-border p-1.5 pr-2.5 transition"
          title="Profile"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[var(--np-accent)] to-[var(--np-accent-2)] text-xs font-black text-white">
            {initial}
          </span>

          <span className="hidden text-left sm:block">
            <span className="block text-xs font-bold leading-tight theme-text">
              {user?.name || user?.fullName || "User"}
            </span>

            <span className="block text-[10px] theme-subtext">
              {user?.email || ""}
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}

/* ---------- Shell ---------- */

export function DashboardShell({ sidebar, header, children }) {
  // Desktop rail state persists per session; mobile drawer starts closed
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 768
      ? sessionStorage.getItem("np_sidebar") !== "collapsed"
      : false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  /*
   * Drawer exit choreography — [data-closing] plays the CSS exit, then the
   * drawer unmounts after the ~220ms window. Also clears the body scroll
   * lock at request time so the page is interactive while the drawer recedes.
   */
  const [drawerClosing, setDrawerClosing] = useState(false);
  const drawerTimerRef = useRef(null);

  const closeMobile = () => {
    if (!mobileOpen) return;

    if (drawerTimerRef.current) return;

    document.body.style.overflow = "";
    setDrawerClosing(true);

    drawerTimerRef.current = setTimeout(() => {
      drawerTimerRef.current = null;
      setDrawerClosing(false);
      setMobileOpen(false);
    }, 220);
  };

  useEffect(
    () => () => {
      if (drawerTimerRef.current) {
        clearTimeout(drawerTimerRef.current);
      }
    },
    [],
  );

  const { user } = useAuth();
  const initial = (user?.name || user?.fullName || "U")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Lock body scroll while the mobile drawer is open (released on close request)
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* Desktop toggle flips the rail (persisted); mobile toggle opens the
     drawer. They must never cross — a stray mobileOpen at desktop would
     lock body scroll behind the md:hidden backdrop. */
  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setExpanded((prev) => {
        const next = !prev;
        sessionStorage.setItem("np_sidebar", next ? "expanded" : "collapsed");
        return next;
      });
    } else if (drawerTimerRef.current) {
      /* Re-open cancels an in-flight close (its exit animation would
         otherwise hold the drawer invisible via the forwards fill). */
      clearTimeout(drawerTimerRef.current);
      drawerTimerRef.current = null;
      setDrawerClosing(false);
      setMobileOpen(true);
      /* closeMobile released the scroll lock at request time; since
         mobileOpen never flipped, re-assert the lock for the open drawer. */
      document.body.style.overflow = "hidden";
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  const title = header?.title ?? "Dashboard";

  return (
    <div className="flex min-h-screen w-full theme-bg theme-text">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobile}
          data-closing={drawerClosing ? "" : undefined}
          className="np-drawer-backdrop fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* Desktop rail */}
      <div className="hidden shrink-0 md:block">
        <ShellSidebar
          config={sidebar}
          expanded={expanded}
          onNavigate={() => {}}
        />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="np-drawer fixed inset-y-0 left-0 z-50 md:hidden"
          data-closing={drawerClosing ? "" : undefined}
        >
          <ShellSidebar
            config={sidebar}
            expanded
            onNavigate={closeMobile}
          />
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <ShellHeader
          expanded={expanded}
          onToggleSidebar={toggleSidebar}
          profilePath={
            sidebar.account?.find((item) =>
              item.label.toLowerCase().includes("profile")
            )?.path ?? null
          }
          title={title}
          user={user}
          initial={initial}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div
            key={location.pathname}
            className="np-boot mx-auto w-full max-w-[1500px]"
            style={{ "--boot-delay": "0ms" }}
          >
            {children}
          </div>
        </main>

        <footer className="theme-card mt-auto flex flex-col items-center justify-between gap-2 border-t theme-border px-4 py-4 text-[11px] theme-subtext sm:flex-row sm:px-8">
          <p>
            © {new Date().getFullYear()} NexusPlay Esports · {sidebar.portal}
          </p>

          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--np-success)]" />
            All systems operational
          </p>
        </footer>
      </div>
    </div>
  );
}

export default DashboardShell;

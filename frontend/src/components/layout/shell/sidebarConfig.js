/**
 * Sidebar config schema — PRD §8.3.
 *
 * Every role layout passes one of these to <DashboardShell />:
 *
 * {
 *   portal: "Organizer Portal",        // subtitle under the wordmark
 *   portalIcon: Trophy,                // lucide icon in the brand tile
 *   brandSuffix: "Play",               // colored half of the wordmark
 *   main: [ { label, path, icon, end? } ],
 *   account: [ { label, path, icon } ],
 * }
 *
 * The shell owns: width/collapse behavior, active rail glow,
 * icon-rail tooltips, mobile drawer + backdrop, logout, footer link.
 * Data lives here. Presentation lives in DashboardShell.
 */

export default function sidebarConfig({
  portal,
  portalIcon,
  brandSuffix = "Play",
  main,
  account,
}) {
  return { portal, portalIcon, brandSuffix, main, account };
}

import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import SmoothScroll from "./components/motion/SmoothScroll";
import PageTransition from "./components/motion/PageTransition";
import { ThemeProvider } from "./context/ThemeProvider";
import { AuthProvider } from "./context/AuthProvider";
import { TournamentProvider } from "./context/TournamentProvider";
import { OrganizerLayout } from "./components/layout/OrganizerLayout";
import { ParticipantLayout } from "./components/layout/ParticipantLayout";
import { SponsorLayout } from "./components/layout/SponsorLayout";
import { SuperAdminLayout } from "./components/layout/SuperAdminLayout";

/* =============================================================
   ROUTE-LEVEL CODE SPLITTING (Phase 6, PRD §11)

   Every page is a lazy chunk; the four role layouts + shared
   shell stay in the initial bundle (they are the persistent
   chrome around which pages swap). Chunk fetches usually
   resolve under the PageTransition wipe; first paint of a
   cold route shows the token-styled RouteFallback below.
   ============================================================= */

// Auth Pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx").then((m) => ({ default: m.RegisterPage })));
const PlayerRegisterPage = lazy(() => import("./pages/auth/PlayerRegisterPage.jsx").then((m) => ({ default: m.PlayerRegisterPage })));
const OrganizerRegisterPage = lazy(() => import("./pages/auth/OrganizerRegisterPage").then((m) => ({ default: m.OrganizerRegisterPage })));
const OrganizerProfilePage = lazy(() => import("./pages/auth/OrganizerProfilePage").then((m) => ({ default: m.OrganizerProfilePage })));
const SponsorRegisterPage = lazy(() => import("./pages/auth/SponsorRegisterPage").then((m) => ({ default: m.SponsorRegisterPage })));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage.jsx").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));

// Organizer Pages
const DashboardPage = lazy(() => import("./pages/organizer/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const TournamentsPage = lazy(() => import("./pages/organizer/TournamentsPage").then((m) => ({ default: m.TournamentsPage })));
const CreateTournamentPage = lazy(() => import("./pages/organizer/CreateTournamentPage").then((m) => ({ default: m.CreateTournamentPage })));
const TournamentDetailPage = lazy(() => import("./pages/organizer/TournamentDetailPage").then((m) => ({ default: m.TournamentDetailPage })));
const OrganizerDashboardProfilePage = lazy(() => import("./pages/organizer/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const OrganizerSettingsPage = lazy(() => import("./pages/organizer/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const SponsorsPage = lazy(() => import("./pages/organizer/SponsorPage").then((m) => ({ default: m.SponsorsPage })));
const RegisteredTeamsPage = lazy(() => import("./pages/organizer/RegisteredTeamPage.jsx").then((m) => ({ default: m.RegisteredTeamsPage })));

// Participant Pages
const ParticipantDashboard = lazy(() => import("./pages/participant/ParticipantDashboard").then((m) => ({ default: m.ParticipantDashboard })));
const ParticipantTournaments = lazy(() => import("./pages/participant/ParticipantTournaments").then((m) => ({ default: m.ParticipantTournaments })));
const ParticipantTournamentDetailPage = lazy(() => import("./pages/participant/ParticipantTournamentDetailPage").then((m) => ({ default: m.ParticipantTournamentDetailPage })));
const ParticipantHistory = lazy(() => import("./pages/participant/ParticipantHistory").then((m) => ({ default: m.ParticipantHistory })));
const ParticipantProfilePage = lazy(() => import("./pages/participant/ProfilePage").then((m) => ({ default: m.ParticipantProfilePage })));
const ParticipantSettingsPage = lazy(() => import("./pages/participant/SettingsPage").then((m) => ({ default: m.ParticipantSettingsPage })));

// Sponsor Pages
const SponsorDashboard = lazy(() => import("./pages/sponsor/SponsorDashboard").then((m) => ({ default: m.SponsorDashboard })));
const SponsorTournaments = lazy(() => import("./pages/sponsor/SponsorTournaments").then((m) => ({ default: m.SponsorTournaments })));
const SponsorTournamentDetails = lazy(() => import("./pages/sponsor/SponsorTournamentDetails").then((m) => ({ default: m.SponsorTournamentDetails })));
const MySponsorshipsPage = lazy(() => import("./pages/sponsor/MySponsorshipsPage").then((m) => ({ default: m.MySponsorshipsPage })));
const SponsorProfilePage = lazy(() => import("./pages/sponsor/SponsorProfilePage").then((m) => ({ default: m.SponsorProfilePage })));
const SponsorAnalyticsPage = lazy(() => import("./pages/sponsor/SponsorAnalyticsPage").then((m) => ({ default: m.SponsorAnalyticsPage })));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/SuperAdminDashboard").then((m) => ({ default: m.SuperAdminDashboard })));
const UsersManagementPage = lazy(() => import("./pages/superadmin/UsersManagementPage").then((m) => ({ default: m.UsersManagementPage })));
const OrganizersManagementPage = lazy(() => import("./pages/superadmin/OrganizersManagementPage").then((m) => ({ default: m.OrganizersManagementPage })));
const TournamentsModerationPage = lazy(() => import("./pages/superadmin/TournamentsModerationPage").then((m) => ({ default: m.TournamentsModerationPage })));
const SponsorsManagementPage = lazy(() => import("./pages/superadmin/SponsorsManagementPage").then((m) => ({ default: m.SponsorsManagementPage })));
const PaymentsManagementPage = lazy(() => import("./pages/superadmin/PaymentsManagementPage").then((m) => ({ default: m.PaymentsManagementPage })));
const ReportsPage = lazy(() => import("./pages/superadmin/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const PlatformSettingsPage = lazy(() => import("./pages/superadmin/PlatformSettingsPage").then((m) => ({ default: m.PlatformSettingsPage })));
const SponsorshipsPage = lazy(() => import("./pages/superadmin/SponsorshipsPage").then((m) => ({ default: m.SponsorshipsPage })));

// Protection & Error Handling
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage.jsx").then((m) => ({ default: m.UnauthorizedPage })));

const LandingPage = lazy(() => import("./pages/LandingPage.jsx").then((m) => ({ default: m.LandingPage })));

/* Designed cold-route fallback (anti-slop §5.4) — token spinner,
   theme-agnostic, reserved height so the shell never jumps. */
function RouteFallback() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--np-accent)] border-t-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

// Fallback history
const HistoryPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Tournament History</h1>
    <p className="text-gray-400">Past tournament records.</p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TournamentProvider>
          <Router>
            <Toaster
              position="top-right"
              closeButton
              toastOptions={{
                className: "np-toast",
              }}
            />

            <div className="scroll-progress" aria-hidden="true" />

            <SmoothScroll>
            <PageTransition>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/password/reset/:token"
                element={<ResetPasswordPage />}
              />
              <Route path="/register/player" element={<PlayerRegisterPage />} />

              <Route
                path="/register/organizer"
                element={<OrganizerRegisterPage />}
              />
              <Route
                path="/register/organizer/profile"
                element={<OrganizerProfilePage />}
              />
              <Route
                path="/register/sponsor"
                element={<SponsorRegisterPage />}
              />

              <Route
                path="/participant/*"
                element={
                  <ProtectedRoute roles={["user"]}>
                    <ParticipantLayout>
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<ParticipantDashboard />}
                        />
                        <Route
                          path="tournaments"
                          element={<ParticipantTournaments />}
                        />
                        <Route
                          path="tournaments/:id"
                          element={<ParticipantTournamentDetailPage />}
                        />
                        <Route
                          path="history"
                          element={<ParticipantHistory />}
                        />
                        <Route
                          path="profile"
                          element={<ParticipantProfilePage />}
                        />
                        <Route
                          path="settings"
                          element={<ParticipantSettingsPage />}
                        />
                        <Route
                          path="*"
                          element={
                            <Navigate to="/participant/dashboard" replace />
                          }
                        />
                      </Routes>
                    </ParticipantLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/*"
                element={
                  <ProtectedRoute roles={["organizer"]}>
                    <OrganizerLayout>
                      <Routes>
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route
                          path="tournaments"
                          element={<TournamentsPage />}
                        />
                        <Route
                          path="tournaments/create"
                          element={<CreateTournamentPage />}
                        />
                        <Route
                          path="tournaments/:id"
                          element={<TournamentDetailPage />}
                        />
                        <Route
                          path="tournaments/:id/participants"
                          element={<RegisteredTeamsPage />}
                        />
                        <Route path="history" element={<HistoryPage />} />
                        <Route path="sponsors" element={<SponsorsPage />} />
                        <Route path="profile" element={<OrganizerDashboardProfilePage />} />
                        <Route path="settings" element={<OrganizerSettingsPage />} />
                        <Route
                          path="*"
                          element={
                            <Navigate to="/organizer/dashboard" replace />
                          }
                        />
                      </Routes>
                    </OrganizerLayout>
                  </ProtectedRoute>
                }
              />

              {/* SPONSOR ROUTES */}
              <Route
                path="/sponsor/*"
                element={
                  <ProtectedRoute roles={["sponsor"]}>
                    <SponsorLayout>
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<SponsorDashboard />}
                        />
                        <Route
                          path="tournaments"
                          element={<SponsorTournaments />}
                        />
                        <Route
                          path="tournaments/:id"
                          element={<SponsorTournamentDetails />}
                        />
                        <Route
                          path="sponsorships"
                          element={<MySponsorshipsPage />}
                        />
                        <Route
                          path="profile"
                          element={<SponsorProfilePage />}
                        />
                        <Route
                          path="analytics"
                          element={<SponsorAnalyticsPage />}
                        />
                        <Route
                          path="*"
                          element={<Navigate to="/sponsor/dashboard" replace />}
                        />
                      </Routes>
                    </SponsorLayout>
                  </ProtectedRoute>
                }
              />

              {/* SUPER ADMIN ROUTES */}
              <Route
                path="/superadmin/*"
                element={
                  <ProtectedRoute roles={["superadmin", "admin"]}>
                    <SuperAdminLayout>
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<SuperAdminDashboard />}
                        />
                        <Route path="users" element={<UsersManagementPage />} />
                        <Route
                          path="organizers"
                          element={<OrganizersManagementPage />}
                        />
                        <Route
                          path="tournaments"
                          element={<TournamentsModerationPage />}
                        />
                        <Route
                          path="sponsorships"
                          element={<SponsorshipsPage />}
                        />
                        <Route
                          path="sponsors"
                          element={<SponsorsManagementPage />}
                        />
                        <Route
                          path="payments"
                          element={<PaymentsManagementPage />}
                        />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route
                          path="settings"
                          element={<PlatformSettingsPage />}
                        />
                        <Route
                          path="*"
                          element={
                            <Navigate to="/superadmin/dashboard" replace />
                          }
                        />
                      </Routes>
                    </SuperAdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* ADMIN ALIAS */}
              <Route
                path="/admin/*"
                element={<Navigate to="/superadmin/dashboard" replace />}
              />

              {/* ROOT & FALLBACK */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
            </PageTransition>
            </SmoothScroll>
          </Router>
        </TournamentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

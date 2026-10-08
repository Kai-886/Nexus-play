import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getAllOrganizers,
  updateOrganizerStatus,
  getAllTournamentsAdmin,
  updateTournamentStatus,
  toggleTournamentFeatured,
  deleteTournamentAdmin,
  getAllSponsorsAdmin,
  updateSponsorStatus,
  getAllPayments,
  getReports,
} from "../controller/adminController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Guard all admin routes with authentication and admin/superadmin roles
router.use(isAuthenticatedUser, authorizeRoles("admin", "superadmin"));

// Platform Stats
router.get("/stats", getDashboardStats);

// User Governance
router.route("/users").get(getAllUsers);
router.route("/users/:id/status").patch(updateUserStatus);
router.route("/users/:id/role").patch(updateUserRole);

// Organizer KYC
router.route("/organizers").get(getAllOrganizers);
router.route("/organizers/:id/status").patch(updateOrganizerStatus);

// Tournament Moderation
router.route("/tournaments").get(getAllTournamentsAdmin);
router.route("/tournaments/:id/status").patch(updateTournamentStatus);
router.route("/tournaments/:id/featured").patch(toggleTournamentFeatured);
router.route("/tournaments/:id").delete(deleteTournamentAdmin);

// Sponsor Audit
router.route("/sponsors").get(getAllSponsorsAdmin);
router.route("/sponsors/:id/status").patch(updateSponsorStatus);

// Payments & Ledger
router.route("/payments").get(getAllPayments);

// Strategic Reports
router.route("/reports").get(getReports);

export default router;

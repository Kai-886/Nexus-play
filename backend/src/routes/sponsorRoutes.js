import express from "express";

import {
  getMySponsorProfile,
  updateSponsorProfile,
  sponsorTournament,
  getMySponsorships,
  getTournamentSponsors,
  getOrganizerSponsors,
  updateSponsorshipStatus,
  getAllSponsors,
} from "../controller/sponsorController.js";

import {
  isAuthenticatedUser,
  authorizeRoles,
} from "../middleware/auth.js";

const router = express.Router();


// ============================================================
// PUBLIC SPONSOR LIST
// ============================================================

router
  .route("/")
  .get(getAllSponsors);


// ============================================================
// SPONSOR PROFILE
// ============================================================

router
  .route("/me")
  .get(
    isAuthenticatedUser,
    authorizeRoles("sponsor", "superadmin"),
    getMySponsorProfile
  )
  .put(
    isAuthenticatedUser,
    authorizeRoles("sponsor", "superadmin"),
    updateSponsorProfile
  );



router
  .route("/sponsorships")
  .get(
    isAuthenticatedUser,
    authorizeRoles("sponsor", "superadmin"),
    getMySponsorships
  );



router
  .route("/tournaments/:id/sponsors")
  .post(
    isAuthenticatedUser,
    authorizeRoles("sponsor"),
    sponsorTournament
  )

  // View sponsors of tournament
  .get(
    getTournamentSponsors
  );


// ============================================================
// ORGANIZER SPONSORSHIP MANAGEMENT
// ============================================================

router
  .route("/organizer/sponsors")
  .get(
    isAuthenticatedUser,
    authorizeRoles("organizer", "superadmin"),
    getOrganizerSponsors
  );


router
  .route("/organizer/sponsors/:id/status")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("organizer", "superadmin"),
    updateSponsorshipStatus
  );


export default router;
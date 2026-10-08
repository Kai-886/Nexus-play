import express from "express";

import { authorizeRoles, isAuthenticatedUser } from "../middleware/auth.js";
import { createOrganizerProfile, getOrganizerDashboard, getOrganizerProfile, updateOrganizerProfile } from "../controller/organizerController.js";
import { getMyTournaments } from "../controller/tournamentController.js";

const router = express.Router();

router.post(
    "/profile",
    isAuthenticatedUser,
    authorizeRoles("organizer"),
    createOrganizerProfile
);


router.put(
    "/profile",
    isAuthenticatedUser,
    authorizeRoles("organizer"),
    updateOrganizerProfile
);

// Organizer dashboard
router.get(
    "/dashboard",
    isAuthenticatedUser,
    authorizeRoles("organizer"),
    getOrganizerDashboard
);

router.get(
    "/profile",
    isAuthenticatedUser,
    authorizeRoles("organizer"),
    getOrganizerProfile
);
 




export default router;
import express from "express";

import {
    getAllOrganizers,
    getOrganizer,
    verifyOrganizer,
    rejectOrganizer,
    suspendOrganizer,
    getSponsor,
    verifySponsor,
    rejectSponsor,
    suspendSponsor,
    getAllSponsorships,
    getSponsorship,
    getSuperAdminProfile,
    getDashboardStats,
    updateUserRole,
    getAllSponsors,
    getAllTournaments,
    getTournament,
    updateTournamentStatus,
    deleteTournament,
    getPayment,
    getAllPayments,
    getAllPlayers,
    getPlayer,
} from "../controller/superAdminController.js";

import {
    isAuthenticatedUser,
    authorizeRoles,
} from "../middleware/auth.js";

const router = express.Router();

router.get(
    "/profile",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getSuperAdminProfile
);

router.get(
    "/dashboard",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getDashboardStats
);

router.get(
    "/players",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getAllPlayers
);

router.get(
    "/players/:id",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getPlayer
);

router.put(
    "/players/:id/role",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    updateUserRole
);

router.get(
    "/organizers",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getAllOrganizers
);

router.get(
    "/organizers/:id",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getOrganizer
);

router.put(
    "/organizers/:id/verify",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    verifyOrganizer
);

router.put(
    "/organizers/:id/reject",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    rejectOrganizer
);

router.put(
    "/organizers/:id/suspend",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    suspendOrganizer
);

router.get(
    "/sponsors",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getAllSponsors
);

router.get(
    "/sponsors/:id",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getSponsor
);

router.put(
    "/sponsors/:id/verify",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    verifySponsor
);

router.get(
    "/sponsorships",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getAllSponsorships
);

router.get(
    "/sponsorships/:id",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getSponsorship
);

router.put(
    "/sponsors/:id/reject",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    rejectSponsor
);

router.put(
    "/sponsors/:id/suspend",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    suspendSponsor
);

router.get(
    "/tournaments",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getAllTournaments
);

router.get(
    "/tournaments/:id",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getTournament
);

router.put(
    "/tournaments/:id/status",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    updateTournamentStatus
);

router.delete(
    "/tournaments/:id",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    deleteTournament
);

router.get(
    "/payments",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getAllPayments
);

router.get(
    "/payments/:id",
    isAuthenticatedUser,
    authorizeRoles("superadmin"),
    getPayment
);

export default router;
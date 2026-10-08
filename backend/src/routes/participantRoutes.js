import express from "express";

import {
    getParticipantProfile,
    updateParticipantProfile,
    getParticipationHistory,
} from "../controller/participantController.js";

import {
    isAuthenticatedUser,
    authorizeRoles,
} from "../middleware/auth.js";

const router = express.Router();




router.get(
    "/profile",
    isAuthenticatedUser,
    authorizeRoles("user"),
    getParticipantProfile
);

router.put(
    "/profile",
    isAuthenticatedUser,
    authorizeRoles("user"),
    updateParticipantProfile
);


router.get(
    "/history",
    isAuthenticatedUser,
    authorizeRoles("user"),
    getParticipationHistory
);


export default router;
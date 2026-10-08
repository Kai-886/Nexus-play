import express from 'express';
import { changePassword, forgotPassword, getUserProfile, loginUser, logoutUser, registerOrganizer, registerSponsor, registerUser, resetPassword } from '../controller/authController.js';
import { authorizeRoles, isAuthenticatedUser } from '../middleware/auth.js';
import { getMyTournaments } from '../controller/tournamentController.js';

const router = express.Router();

// user routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/me").get(isAuthenticatedUser, getUserProfile)
router.route("/logout").get(logoutUser)
router.route("/password/update").put(isAuthenticatedUser, changePassword);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

// organizer routes
router.route("/organizer/register").post(registerOrganizer);

// sponsor routes
router.route("/sponsor/register").post(registerSponsor);

export default router;
import express from "express";
import {
    createEntryFeeOrder,
    verifyEntryFeePayment,
    runSandboxCheckout,
} from "../controller/paymentController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

router
    .route("/payments/order")
    .post(isAuthenticatedUser, authorizeRoles("user"), createEntryFeeOrder);

router
    .route("/payments/verify")
    .post(isAuthenticatedUser, authorizeRoles("user"), verifyEntryFeePayment);

router
    .route("/payments/sandbox/checkout")
    .post(
        isAuthenticatedUser,
        authorizeRoles("user"),
        runSandboxCheckout
    );

export default router;
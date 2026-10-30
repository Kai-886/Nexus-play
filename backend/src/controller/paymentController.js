import mongoose from "mongoose";

import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Tournament from "../models/tournament.js";
import Payment from "../models/payment.js";
import Registration from "../models/Registration.js";
import {
    createOrder,
    verifySignature,
    sandboxCheckout,
    paymentMode,
} from "../services/paymentGateway.js";

// POST /api/v1/payments/order  { tournamentId }
// Creates a gateway order for the tournament's entry fee and records a
// pending Payment row (so abandoned attempts show up in the ledger).
export const createEntryFeeOrder = catchAsyncErrors(
    async (req, res, next) => {
        const { tournamentId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return next(new ErrorHandler("Invalid tournament ID", 400));
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return next(new ErrorHandler("Tournament not found", 404));
        }

        if (tournament.status !== "published") {
            return next(
                new ErrorHandler(
                    "Registration is not available for this tournament",
                    400
                )
            );
        }

        if (
            tournament.registrationDeadline &&
            new Date() > new Date(tournament.registrationDeadline)
        ) {
            return next(
                new ErrorHandler(
                    "Registration deadline has already passed",
                    400
                )
            );
        }

        const entryFee = Number(tournament.entryFee) || 0;
        if (entryFee <= 0) {
            return next(
                new ErrorHandler(
                    "This tournament has no entry fee - no payment is needed",
                    400
                )
            );
        }

        // Already registered? No payment should be taken.
        const existing = await Registration.findOne({
            user: req.user._id,
            tournament: tournament._id,
            status: "registered",
        });
        if (existing) {
            return next(
                new ErrorHandler(
                    "You are already registered for this tournament",
                    400
                )
            );
        }

        // Razorpay rejects orders below 100 paise — validate up front.
        const amountPaise = Math.round(entryFee * 100);
        if (amountPaise < 100) {
            return next(
                new ErrorHandler(
                    "Entry fee must be at least ₹1 (100 paise)",
                    400
                )
            );
        }

        const order = await createOrder({
            amountPaise,
            receipt: `entry_${tournament._id}_${req.user._id}`.slice(0, 40),
            notes: {
                tournamentId: String(tournament._id),
                userId: String(req.user._id),
            },
        });

        await Payment.create({
            transactionId: order.orderId,
            orderId: order.orderId,
            userId: req.user._id,
            tournamentId: tournament._id,
            type: "Registration Fee Pool",
            entity: order.mode === "razorpay" ? "razorpay" : "sandbox",
            tournament: tournament.title,
            amount: entryFee,
            method: "Awaiting checkout",
            status: "pending",
        });

        res.status(201).json({
            success: true,
            mode: order.mode,
            keyId: order.keyId,
            orderId: order.orderId,
            amount: order.amount, // paise
            currency: order.currency,
            entryFee,
        });
    }
);

// POST /api/v1/payments/verify  { orderId, paymentId, signature }
export const verifyEntryFeePayment = catchAsyncErrors(
    async (req, res, next) => {
        const { orderId, paymentId, signature } = req.body;

        if (!orderId || !paymentId || !signature) {
            return next(
                new ErrorHandler(
                    "orderId, paymentId and signature are required",
                    400
                )
            );
        }

        // Look up by the stable order id: after success, transactionId is
        // rewritten to the payment id, so transactionId alone would make a
        // retried verification 404 instead of idempotently succeeding.
        const payment = await Payment.findOne({
            $or: [{ orderId }, { transactionId: orderId }],
            userId: req.user._id,
        });

        if (!payment) {
            return next(new ErrorHandler("Payment order not found", 404));
        }

        // Idempotent: a verified payment verifies once.
        if (payment.status === "success") {
            return res.status(200).json({
                success: true,
                verified: true,
                orderId: payment.orderId,
                paymentId,
            });
        }

        const ok = verifySignature({ orderId, paymentId, signature });

        if (!ok) {
            payment.status = "failed";
            payment.method = "Signature mismatch";
            await payment.save();

            return next(
                new ErrorHandler(
                    "Payment verification failed - you have not been charged",
                    400
                )
            );
        }

        payment.status = "success";
        payment.transactionId = paymentId;
        payment.method = paymentMode() === "razorpay" ? "Razorpay" : "Sandbox Checkout";
        await payment.save();

        res.status(200).json({
            success: true,
            verified: true,
            orderId: payment.orderId,
            paymentId,
        });
    }
);

// POST /api/v1/payments/sandbox/checkout  { orderId }
// Local stand-in for the hosted gateway checkout, sandbox mode only.
export const runSandboxCheckout = catchAsyncErrors(
    async (req, res, next) => {
        if (paymentMode() !== "sandbox") {
            return next(new ErrorHandler("Not found", 404));
        }

        const { orderId } = req.body;
        if (!orderId) {
            return next(new ErrorHandler("orderId is required", 400));
        }

        const payment = await Payment.findOne({
            transactionId: orderId,
            userId: req.user._id,
            status: "pending",
        });
        if (!payment) {
            return next(new ErrorHandler("Pending order not found", 404));
        }

        const result = sandboxCheckout(orderId);

        res.status(200).json({
            success: true,
            ...result,
        });
    }
);
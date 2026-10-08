
import mongoose from "mongoose";

import Registration from "../models/Registration.js";
import Tournament from "../models/tournament.js";

import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

// Register participant or team in a tournament
export const registerParticipant = catchAsyncErrors(
    async (req, res, next) => {
        const { tournamentId } = req.params;

        const {
            registrationType,
            teamName,
            players,
            captainContact,
            agreements,
        } = req.body;

        // Validate tournament ID
        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return next(
                new ErrorHandler("Invalid tournament ID", 400)
            );
        }

        // Find tournament
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return next(
                new ErrorHandler("Tournament not found", 404)
            );
        }

        // Only published tournaments accept registrations
        if (tournament.status !== "published") {
            return next(
                new ErrorHandler(
                    "Registration is not available for this tournament",
                    400
                )
            );
        }

        // Check registration deadline
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

        // Validate registration type
        if (!["solo", "team"].includes(registrationType)) {
            return next(
                new ErrorHandler(
                    "Registration type must be either solo or team",
                    400
                )
            );
        }

        // Registration type must match tournament type
        if (registrationType !== tournament.tournamentType) {
            return next(
                new ErrorHandler(
                    `This tournament only accepts ${tournament.tournamentType} registrations`,
                    400
                )
            );
        }

        // Validate clan/team name for both registration types
        if (!teamName || teamName.trim() === "") {
            return next(
                new ErrorHandler(
                    "Clan name is required for registration",
                    400
                )
            );
        }

        // Validate players array
        if (!Array.isArray(players) || players.length === 0) {
            return next(
                new ErrorHandler(
                    "At least one player is required",
                    400
                )
            );
        }

        // Validate player count
        const requiredPlayers =
            registrationType === "solo" ? 1 : 4;

        if (players.length !== requiredPlayers) {
            return next(
                new ErrorHandler(
                    registrationType === "solo"
                        ? "Solo registration must contain exactly one player"
                        : "Team registration must contain exactly four players, including the captain",
                    400
                )
            );
        }

        // Validate player details
        for (const player of players) {
            if (
                !player.fullName ||
                !player.gameUid ||
                !player.email ||
                !player.phone
            ) {
                return next(
                    new ErrorHandler(
                        "Every player must have fullName, gameUid, email and phone",
                        400
                    )
                );
            }
        }

        // Logged-in user must be the captain
        const loggedInUserId = req.user._id.toString();

        const captainIncluded = players.some(
            (player) =>
                player.user &&
                player.user.toString() === loggedInUserId
        );

        if (!captainIncluded) {
            return next(
                new ErrorHandler(
                    "The logged-in user must be included as the captain",
                    400
                )
            );
        }

        // Prevent multiple account IDs in the same registration
        const linkedUserIds = players
            .filter((player) => player.user)
            .map((player) => player.user.toString());

        const uniqueUserIds = new Set(linkedUserIds);

        if (uniqueUserIds.size !== linkedUserIds.length) {
            return next(
                new ErrorHandler(
                    "The same NexusPlay account cannot be used for multiple players",
                    400
                )
            );
        }

        // Prevent duplicate game UIDs inside the registration
        const gameUids = players.map((player) =>
            player.gameUid.trim().toLowerCase()
        );

        const uniqueGameUids = new Set(gameUids);

        if (uniqueGameUids.size !== gameUids.length) {
            return next(
                new ErrorHandler(
                    "Duplicate game UID / IGN is not allowed",
                    400
                )
            );
        }

        // Validate captain contact
        if (
            !captainContact ||
            !captainContact.whatsapp ||
            captainContact.whatsapp.trim() === ""
        ) {
            return next(
                new ErrorHandler(
                    "WhatsApp contact is required",
                    400
                )
            );
        }

        // Validate agreements
        const requiredAgreements = [
            "antiCheat",
            "rulebook",
            "identityVerification",
            "mediaConsent",
            "professionalConduct",
            "guardianConsent",
            "captainResponsibility",
        ];

        for (const agreement of requiredAgreements) {
            if (!agreements || agreements[agreement] !== true) {
                return next(
                    new ErrorHandler(
                        `You must accept the ${agreement} agreement`,
                        400
                    )
                );
            }
        }

        // Prevent the same captain from registering twice
        const existingRegistration = await Registration.findOne({
            user: req.user._id,
            tournament: tournamentId,
            status: "registered",
        });

        if (existingRegistration) {
            return next(
                new ErrorHandler(
                    "You are already registered for this tournament",
                    400
                )
            );
        }

        // Prevent linked users from registering in another clan
        if (linkedUserIds.length > 0) {
            const existingPlayerRegistration =
                await Registration.findOne({
                    tournament: tournamentId,
                    status: "registered",
                    "players.user": {
                        $in: linkedUserIds,
                    },
                });

            if (existingPlayerRegistration) {
                return next(
                    new ErrorHandler(
                        "One or more players are already registered for this tournament",
                        400
                    )
                );
            }
        }

        // Check tournament capacity
        // One registration = one clan/entry
        if (
            tournament.currentParticipants >=
            tournament.maxParticipants
        ) {
            return next(
                new ErrorHandler(
                    "Tournament registration is full",
                    400
                )
            );
        }

        // Create registration
        const registration = await Registration.create({
            user: req.user._id,
            tournament: tournamentId,
            registrationType,
            teamName: teamName.trim(),
            players,
            captainContact,
            agreements,
        });

        // Count one registered clan/entry
        tournament.currentParticipants += 1;

        await tournament.save();

        res.status(201).json({
            success: true,
            message: "Registration completed successfully",
            registration,
        });
    }
);

// Get all registrations of logged-in user
export const getMyRegistrations = catchAsyncErrors(
    async (req, res, next) => {
        const registrations = await Registration.find({
            user: req.user._id,
        })
            .populate(
                "tournament",
                "title game tournamentType startDate endDate venue status"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: registrations.length,
            registrations,
        });
    }
);

// Get logged-in user's registration for a tournament
export const getMyRegistration = catchAsyncErrors(
    async (req, res, next) => {
        const { tournamentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return next(
                new ErrorHandler("Invalid tournament ID", 400)
            );
        }

        const registration = await Registration.findOne({
            user: req.user._id,
            tournament: tournamentId,
            status: "registered",
        }).populate(
            "tournament",
            "title game tournamentType startDate endDate venue status"
        );

        if (!registration) {
            return next(
                new ErrorHandler(
                    "You are not registered for this tournament",
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            registration,
        });
    }
);

// Cancel logged-in user's registration
export const cancelRegistration = catchAsyncErrors(
    async (req, res, next) => {
        const { tournamentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return next(
                new ErrorHandler("Invalid tournament ID", 400)
            );
        }

        const registration = await Registration.findOne({
            user: req.user._id,
            tournament: tournamentId,
            status: "registered",
        });

        if (!registration) {
            return next(
                new ErrorHandler(
                    "Active registration not found",
                    404
                )
            );
        }

        registration.status = "cancelled";

        await registration.save();

        // Decrease count by one registered clan/entry
        await Tournament.findByIdAndUpdate(
            tournamentId,
            {
                $inc: {
                    currentParticipants: -1,
                },
            }
        );

        res.status(200).json({
            success: true,
            message: "Registration cancelled successfully",
        });
    }
);



export const getTournamentRegistrations = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    if (!tournamentId) {
      return res.status(400).json({
        success: false,
        message: "Tournament ID is required",
      });
    }

    const registrations = await Registration.find({
      tournament: tournamentId,
      status: { $ne: "cancelled" },
    })
      .populate("user", "name email")
      .populate("players.user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};
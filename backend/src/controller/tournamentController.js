import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Tournament from "../models/tournament.js"
import ErrorHandler from "../utils/ErrorHandler.js";
import APIFeatures from "../utils/apiFeatures.js";
import Organizer from "../models/organizer.js";

// Create tournament
// POST /api/v1/tournaments

export const createTournament = catchAsyncErrors(
    async (req, res, next) => {
        const {
            title,
            game,
            tournamentType,
            description,
            rules,
            tournamentMode,
            venue,
            cityRegion,
            startDate,
            endDate,
            registrationDeadline,
            entryFee,
            prizePool,
            prizes,
            maxParticipants,
            teamSize,
            status,
        } = req.body;

        // Only draft and published are allowed during creation
        const tournamentStatus = status || "draft";

        if (!["draft", "published"].includes(tournamentStatus)) {
            return next(
                new ErrorHandler(
                    "Tournament can only be created as draft or published",
                    400
                )
            );
        }

        if (tournamentType === "team" && !teamSize) {
            return next(
                new ErrorHandler(
                    "Team size is required for team tournaments",
                    400
                )
            );
        }

        if (tournamentType === "solo" && teamSize) {
            return next(
                new ErrorHandler(
                    "Team size is not required for solo tournaments",
                    400
                )
            );
        }

        const organizer = await Organizer.findOne({
            userId: req.user._id,
        });

        if (!organizer) {
            return next(
                new ErrorHandler(
                    "Organizer profile not found",
                    404
                )
            );
        }

        const tournament = await Tournament.create({
            title,
            game,
            tournamentType,
            description,
            rules,
            tournamentMode,
            venue,
            cityRegion,
            startDate,
            endDate,
            registrationDeadline,
            entryFee,
            prizePool,
            prizes,
            maxParticipants,
            currentParticipants: 0,
            teamSize,
            organizer: organizer._id,
            status: tournamentStatus,
        });

        res.status(201).json({
            success: true,
            message: "Tournament created successfully",
            tournament,
        });
    }
);


// Get all tournaments
// GET /api/v1/tournaments
// &scope=landing → public landing page feed: published/ongoing only,
// no auth, fields trimmed for display
export const getAllTournaments = catchAsyncErrors(
    async (req, res, next) => {
        const apiFilters = new APIFeatures(
            Tournament.find(),
            req.query
        )
            .search()
            .filter()
            .dateFilter()
            .sort();

        if (req.query.scope === "landing") {
            apiFilters.query
                .where("status")
                .in(["published", "ongoing"])
                .select(
                    "title game venue cityRegion startDate endDate prizePool entryFee tournamentType tournamentMode maxParticipants currentParticipants status"
                )
                .sort({ startDate: 1 });

            const landingTournaments = await apiFilters.query.limit(8);

            return res.status(200).json({
                success: true,
                count: landingTournaments.length,
                totalTournaments: landingTournaments.length,
                tournaments: landingTournaments,
            });
        }

        const resPerPage = 4;

        const totalTournaments =
            await apiFilters.query.clone().countDocuments();

        // apiFilters.pagination(resPerPage);

         const tournaments = await apiFilters.query.populate(
            "organizer",
            "organizationName organizationType verificationStatus"
        );

        const currentPage = Number(req.query.page) || 1;

        const totalPages = Math.ceil(
            totalTournaments / resPerPage
        );

        res.status(200).json({
            success: true,
            count: tournaments.length,
            totalTournaments,
            // currentPage,
            // totalPages,
            tournaments,
        });
    }
);


// Get single tournament
// GET /api/v1/tournaments/:id

export const getTournament = catchAsyncErrors(
    async (req, res, next) => {
        const tournament = await Tournament.findById(
            req.params.id
        );

        if (!tournament) {
            return next(
                new ErrorHandler(
                    "Tournament not available",
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            tournament,
        });
    }
);


// Update tournament details or status
// PUT /api/v1/tournaments/:id

export const updateTournament = catchAsyncErrors(
    async (req, res, next) => {
        const allowedFields = [
            "title",
            "game",
            "tournamentType",
            "description",
            "rules",
            "tournamentMode",
            "venue",
            "cityRegion",
            "startDate",
            "endDate",
            "registrationDeadline",
            "entryFee",
            "prizePool",
            "prizes",
            "maxParticipants",
            "teamSize",
            "status",
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                req.tournament[field] = req.body[field];
            }
        }

        await req.tournament.save();

        res.status(200).json({
            success: true,
            message: "Tournament updated successfully",
            tournament: req.tournament,
        });
    }
);


// Delete tournament
// DELETE /api/v1/tournaments/:id

export const deleteTournament = catchAsyncErrors(
    async (req, res, next) => {
        await req.tournament.deleteOne();

        res.status(200).json({
            success: true,
            message: "Tournament deleted successfully",
        });
    }
);


// Get current organizer tournaments
// GET /api/v1/tournaments/me

export const getMyTournaments = catchAsyncErrors(
    async (req, res, next) => {
        const organizer = await Organizer.findOne({
            userId: req.user._id,
        });

        if (!organizer) {
            return next(
                new ErrorHandler(
                    "Organizer profile not found",
                    404
                )
            );
        }

        const tournaments = await Tournament.find({
            organizer: organizer._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tournaments.length,
            tournaments,
        });
    }
);



import User from "../models/user.js";
import Organizer from "../models/organizer.js";
import Sponsor from "../models/sponsor.js";
import Tournament from "../models/tournament.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Sponsorship from "../models/sponsorship.js";

export const getSuperAdminProfile = catchAsyncErrors(
    async (req, res, next) => {
        const superAdmin = await User.findOne({
            _id: req.user._id,
            role: "superadmin",
        }).select("-password");

        if (!superAdmin) {
            return next(
                new ErrorHandler("Superadmin not found", 404)
            );
        }

        res.status(200).json({
            success: true,
            superAdmin,
        });
    }
);

export const getDashboardStats = catchAsyncErrors(
    async (req, res) => {
        const [
            totalUsers,
            totalOrganizers,
            totalSponsors,
            totalTournaments,
            pendingOrganizers,
            pendingSponsors,
            verifiedOrganizers,
            verifiedSponsors,
            activeTournaments,
            pendingTournaments,
            completedTournaments,
        ] = await Promise.all([
            User.countDocuments(),
            Organizer.countDocuments(),
            Sponsor.countDocuments(),
            Tournament.countDocuments(),
            Organizer.countDocuments({
                verificationStatus: "pending",
            }),
            Sponsor.countDocuments({
                status: "pending",
            }),
            Organizer.countDocuments({
                verificationStatus: "verified",
            }),
            Sponsor.countDocuments({
                status: "verified",
            }),
            Tournament.countDocuments({
                status: "ongoing",
            }),
            Tournament.countDocuments({
                status: "draft",
            }),
            Tournament.countDocuments({
                status: "completed",
            }),
        ]);

        const [
            recentUsers,
            recentOrganizers,
            recentSponsors,
            recentTournaments,
        ] = await Promise.all([
            User.find()
                .select("name email role createdAt")
                .sort({ createdAt: -1 })
                .limit(5),

            Organizer.find()
                .select("organizationName verificationStatus createdAt")
                .sort({ createdAt: -1 })
                .limit(5),

            Sponsor.find()
                .select("companyName brandName status createdAt")
                .sort({ createdAt: -1 })
                .limit(5),

            Tournament.find()
                .select("title game status createdAt")
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalOrganizers,
                totalSponsors,
                totalTournaments,
                pendingApprovals:
                    pendingOrganizers + pendingSponsors,
                pendingOrganizers,
                pendingSponsors,
                verifiedOrganizers,
                verifiedSponsors,
                activeTournaments,
                pendingTournaments,
                completedTournaments,
            },
            recentUsers,
            recentOrganizers,
            recentSponsors,
            recentTournaments,
        });
    }
);

export const getAllPlayers = catchAsyncErrors(
    async (req, res) => {
        const players = await User.find({ role: "user" })
            .select("-password -resetPasswordToken -resetPasswordExpire")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: players.length,
            players,
        });
    }
);

export const getPlayer = catchAsyncErrors(
    async (req, res, next) => {
        const player = await User.findOne({
            _id: req.params.id,
            role: "user",
        }).select("-password -resetPasswordToken -resetPasswordExpire");

        if (!player) {
            return next(
                new ErrorHandler("Player not found", 404)
            );
        }

        res.status(200).json({
            success: true,
            player,
        });
    }
);

export const updateUserRole = catchAsyncErrors(
    async (req, res, next) => {
        const { role } = req.body;

        const allowedRoles = [
            "user",
            "organizer",
            "sponsor",
            "superadmin",
        ];

        if (!allowedRoles.includes(role)) {
            return next(
                new ErrorHandler("Invalid user role", 400)
            );
        }

        if (
            req.params.id === req.user._id.toString() &&
            role !== "superadmin"
        ) {
            return next(
                new ErrorHandler(
                    "You cannot remove your own superadmin role",
                    400
                )
            );
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return next(
                new ErrorHandler("User not found", 404)
            );
        }

        user.role = role;

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password -resetPasswordToken -resetPasswordExpire");

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user: updatedUser,
        });
    }
);

export const getAllOrganizers = catchAsyncErrors(
    async (req, res) => {
        const organizers = await Organizer.find()
            .populate("userId", "name email mobileNumber")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: organizers.length,
            organizers,
        });
    }
);

export const getOrganizer = catchAsyncErrors(
    async (req, res, next) => {
        const organizer = await Organizer.findById(req.params.id)
            .select("+aadhaarNumber +panNumber")
            .populate(
                "userId",
                "name email mobileNumber avatar createdAt"
            );

        if (!organizer) {
            return next(
                new ErrorHandler(
                    "Organizer not found",
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            organizer,
        });
    }
);

export const verifyOrganizer = catchAsyncErrors(
    async (req, res, next) => {
        const organizer = await Organizer.findById(req.params.id)
            .select("+aadhaarNumber +panNumber");

        if (!organizer) {
            return next(
                new ErrorHandler(
                    "Organizer not found",
                    404
                )
            );
        }

        if (
            !organizer.aadhaarNumber ||
            !organizer.panNumber
        ) {
            return next(
                new ErrorHandler(
                    "Organizer profile is incomplete. Aadhaar and PAN details are required before verification.",
                    400
                )
            );
        }

        organizer.verificationStatus = "verified";

        await organizer.save();

        res.status(200).json({
            success: true,
            message: "Organizer verified successfully",
            organizer,
        });
    }
);

export const rejectOrganizer = catchAsyncErrors(
    async (req, res, next) => {
        const organizer = await Organizer.findById(
            req.params.id
        );

        if (!organizer) {
            return next(
                new ErrorHandler(
                    "Organizer not found",
                    404
                )
            );
        }

        if (organizer.verificationStatus === "rejected") {
            return next(
                new ErrorHandler(
                    "Organizer is already rejected",
                    400
                )
            );
        }

        organizer.verificationStatus = "rejected";

        await organizer.save();

        res.status(200).json({
            success: true,
            message: "Organizer rejected successfully",
            organizer,
        });
    }
);

export const suspendOrganizer = catchAsyncErrors(
    async (req, res, next) => {
        const organizer = await Organizer.findById(
            req.params.id
        );

        if (!organizer) {
            return next(
                new ErrorHandler(
                    "Organizer not found",
                    404
                )
            );
        }

        if (organizer.verificationStatus === "suspended") {
            return next(
                new ErrorHandler(
                    "Organizer is already suspended",
                    400
                )
            );
        }

        organizer.verificationStatus = "suspended";

        await organizer.save();

        res.status(200).json({
            success: true,
            message: "Organizer suspended successfully",
            organizer,
        });
    }
);

export const getAllSponsors = catchAsyncErrors(
    async (req, res) => {
        const sponsors = await Sponsor.find()
            .select("+aadhaarNumber +panNumber")
            .populate(
                "userId",
                "name email mobileNumber"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: sponsors.length,
            sponsors,
        });
    }
);

export const getSponsor = catchAsyncErrors(
    async (req, res, next) => {
        const sponsor = await Sponsor.findById(req.params.id)
            .select("+aadhaarNumber +panNumber")
            .populate(
                "userId",
                "name email mobileNumber avatar createdAt"
            );

        if (!sponsor) {
            return next(
                new ErrorHandler(
                    "Sponsor not found",
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            sponsor,
        });
    }
);

export const verifySponsor = catchAsyncErrors(
    async (req, res, next) => {
        const sponsor = await Sponsor.findById(req.params.id)
            .select("+aadhaarNumber +panNumber");

        if (!sponsor) {
            return next(
                new ErrorHandler(
                    "Sponsor not found",
                    404
                )
            );
        }

        if (
            !sponsor.aadhaarNumber ||
            !sponsor.panNumber
        ) {
            return next(
                new ErrorHandler(
                    "Sponsor profile is incomplete. Aadhaar and PAN are required.",
                    400
                )
            );
        }

        sponsor.status = "verified";

        await sponsor.save();

        res.status(200).json({
            success: true,
            message: "Sponsor verified successfully",
            sponsor,
        });
    }
);

export const rejectSponsor = catchAsyncErrors(
    async (req, res, next) => {
        const sponsor = await Sponsor.findById(
            req.params.id
        );

        if (!sponsor) {
            return next(
                new ErrorHandler(
                    "Sponsor not found",
                    404
                )
            );
        }

        sponsor.status = "rejected";

        await sponsor.save();

        res.status(200).json({
            success: true,
            message: "Sponsor rejected successfully",
            sponsor,
        });
    }
);

export const suspendSponsor = catchAsyncErrors(
    async (req, res, next) => {
        const sponsor = await Sponsor.findById(
            req.params.id
        );

        if (!sponsor) {
            return next(
                new ErrorHandler(
                    "Sponsor not found",
                    404
                )
            );
        }

        sponsor.status = "suspended";

        await sponsor.save();

        res.status(200).json({
            success: true,
            message: "Sponsor suspended successfully",
            sponsor,
        });
    }
);

export const getAllSponsorships = catchAsyncErrors(
    async (req, res) => {
        const sponsorships = await Sponsorship.find()
            .populate(
                "sponsorId",
                "companyName brandName industry contactEmail contactPhone representativeName"
            )
            .populate(
                "sponsorUserId",
                "name email mobileNumber"
            )
            .populate(
                "tournamentId",
                "title game tournamentType venue cityRegion startDate endDate status"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: sponsorships.length,
            sponsorships,
        });
    }
);

export const getSponsorship = catchAsyncErrors(
    async (req, res, next) => {
        const sponsorship = await Sponsorship.findById(
            req.params.id
        )
            .populate(
                "sponsorId",
                "companyName brandName industry contactEmail contactPhone representativeName website"
            )
            .populate(
                "sponsorUserId",
                "name email mobileNumber avatar createdAt"
            )
            .populate(
                "tournamentId",
                "title game tournamentType venue cityRegion startDate endDate registrationDeadline status"
            );

        if (!sponsorship) {
            return next(
                new ErrorHandler(
                    "Sponsorship not found",
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            sponsorship,
        });
    }
);


export const getAllTournaments = catchAsyncErrors(
    async (req, res) => {
        const tournaments = await Tournament.find()
            .populate(
                "organizer",
                "organizationName organizationType verificationStatus"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tournaments.length,
            tournaments,
        });
    }
);

export const getTournament = catchAsyncErrors(
    async (req, res, next) => {
        const tournament = await Tournament.findById(
            req.params.id
        ).populate(
            "organizer",
            "organizationName organizationType verificationStatus"
        );

        if (!tournament) {
            return next(
                new ErrorHandler(
                    "Tournament not found",
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

export const updateTournamentStatus = catchAsyncErrors(
    async (req, res, next) => {
        const { status } = req.body;

        const allowedStatuses = [
            "draft",
            "published",
            "ongoing",
            "completed",
            "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return next(
                new ErrorHandler(
                    "Invalid tournament status",
                    400
                )
            );
        }

        const tournament = await Tournament.findById(
            req.params.id
        );

        if (!tournament) {
            return next(
                new ErrorHandler(
                    "Tournament not found",
                    404
                )
            );
        }

        tournament.status = status;

        await tournament.save();

        const updatedTournament =
            await Tournament.findById(tournament._id).populate(
                "organizer",
                "organizationName organizationType verificationStatus"
            );

        res.status(200).json({
            success: true,
            message: `Tournament marked as ${status}`,
            tournament: updatedTournament,
        });
    }
);

export const deleteTournament = catchAsyncErrors(
    async (req, res, next) => {
        const tournament = await Tournament.findById(
            req.params.id
        );

        if (!tournament) {
            return next(
                new ErrorHandler(
                    "Tournament not found",
                    404
                )
            );
        }

        await tournament.deleteOne();

        res.status(200).json({
            success: true,
            message: "Tournament deleted successfully",
        });
    }
);


export const getAllPayments = catchAsyncErrors(
    async (req, res) => {
        const payments = await Sponsorship.find({
            paymentStatus: {
                $ne: "not_required",
            },
        })
            .populate(
                "sponsorId",
                "companyName brandName industry contactEmail representativeName"
            )
            .populate(
                "sponsorUserId",
                "name email mobileNumber"
            )
            .populate(
                "tournamentId",
                "title game tournamentType venue startDate endDate status"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments,
        });
    }
);

export const getPayment = catchAsyncErrors(
    async (req, res, next) => {
        const payment = await Sponsorship.findOne({
            _id: req.params.id,
            paymentStatus: {
                $ne: "not_required",
            },
        })
            .populate(
                "sponsorId",
                "companyName brandName industry contactEmail contactPhone representativeName website"
            )
            .populate(
                "sponsorUserId",
                "name email mobileNumber"
            )
            .populate(
                "tournamentId",
                "title game tournamentType venue startDate endDate registrationDeadline status"
            );

        if (!payment) {
            return next(
                new ErrorHandler(
                    "Payment not found",
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            payment,
        });
    }
);
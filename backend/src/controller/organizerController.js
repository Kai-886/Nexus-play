import Organizer from "../models/organizer.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Tournament from "../models/tournament.js";

export const createOrganizerProfile = catchAsyncErrors(
    async (req, res, next) => {
        const {
            organizationName,
            organizationType,
            description,
            address,
            contactEmail,
            contactPhone,
        } = req.body;

        // Validate required fields
        if (
            !organizationName ||
            !organizationType ||
            !address ||
            !contactEmail ||
            !contactPhone
        ) {
            return next(
                new ErrorHandler(
                    "Please provide all required organizer profile details",
                    400
                )
            );
        }

        // Check user role
        if (req.user.role !== "organizer") {
            return next(
                new ErrorHandler(
                    "Only organizers can create an organizer profile",
                    403
                )
            );
        }

        // Check whether profile already exists
        const existingOrganizer = await Organizer.findOne({
            userId: req.user._id,
        });

        if (existingOrganizer) {
            return next(
                new ErrorHandler(
                    "Organizer profile already exists",
                    400
                )
            );
        }

        // Create organizer profile
        const organizer = await Organizer.create({
            organizerId: `ORG-${Date.now()}`,
            userId: req.user._id,

            organizationName,
            organizationType,
            description,
            address,

            contactEmail,
            contactPhone,

            verificationStatus: "pending",
        });

        // Mark profile as complete
        req.user.isProfileComplete = true;
        await req.user.save();

        res.status(201).json({
            success: true,
            message: "Organizer profile submitted for verification",

            organizer: {
                _id: organizer._id,
                organizerId: organizer.organizerId,
                organizationName: organizer.organizationName,
                organizationType: organizer.organizationType,
                description: organizer.description,
                address: organizer.address,
                contactEmail: organizer.contactEmail,
                contactPhone: organizer.contactPhone,
                verificationStatus: organizer.verificationStatus,
            },
        });
    }
);

// Get organizer dashboard data
// GET /api/v1/tournaments/dashboard
export const getOrganizerDashboard = catchAsyncErrors(
    async (req, res, next) => {
        // Find organizer profile using logged-in user
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

        const organizerId = organizer._id;

        // Fetch dashboard statistics and recent tournaments
        const [
            totalTournaments,
            draftTournaments,
            publishedTournaments,
            ongoingTournaments,
            completedTournaments,
            cancelledTournaments,
            totalParticipants,
            recentTournaments,
        ] = await Promise.all([
            // Total tournaments
            Tournament.countDocuments({
                organizer: organizerId,
            }),

            // Draft tournaments
            Tournament.countDocuments({
                organizer: organizerId,
                status: "draft",
            }),

            // Published tournaments
            Tournament.countDocuments({
                organizer: organizerId,
                status: "published",
            }),

            // Ongoing tournaments
            Tournament.countDocuments({
                organizer: organizerId,
                status: "ongoing",
            }),

            // Completed tournaments
            Tournament.countDocuments({
                organizer: organizerId,
                status: "completed",
            }),

            // Cancelled tournaments
            Tournament.countDocuments({
                organizer: organizerId,
                status: "cancelled",
            }),

            // Total participants across all organizer tournaments
            Tournament.aggregate([
                {
                    $match: {
                        organizer: organizerId,
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$currentParticipants",
                        },
                    },
                },
            ]),

            // Five most recently created tournaments
            Tournament.find({
                organizer: organizerId,
            })
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

        res.status(200).json({
            success: true,

            stats: {
                totalTournaments,
                draftTournaments,
                publishedTournaments,
                ongoingTournaments,
                completedTournaments,
                cancelledTournaments,

                totalParticipants:
                    totalParticipants.length > 0
                        ? totalParticipants[0].total
                        : 0,
            },

            recentTournaments,
        });
    }
);

export const updateOrganizerProfile = catchAsyncErrors(
    async (req, res, next) => {
        const {
            organizationName,
            organizationType,
            description,
            address,
            representativeName,
            contactEmail,
            contactPhone,
            aadhaarNumber,
            panNumber,
        } = req.body;

        // Find organizer profile
        const organizer = await Organizer.findOne({
            userId: req.user._id,
        }).select("+aadhaarNumber +panNumber");

        if (!organizer) {
            return next(
                new ErrorHandler(
                    "Organizer profile not found",
                    404
                )
            );
        }

        // Validate required fields
        if (
            !organizationName ||
            !organizationType ||
            !address ||
            !contactEmail ||
            !contactPhone ||
            !aadhaarNumber ||
            !panNumber
        ) {
            return next(
                new ErrorHandler(
                    "Please provide all required organizer profile details",
                    400
                )
            );
        }

        // Validate Aadhaar number
        const aadhaarRegex = /^\d{12}$/;

        if (!aadhaarRegex.test(aadhaarNumber)) {
            return next(
                new ErrorHandler(
                    "Aadhaar number must contain exactly 12 digits",
                    400
                )
            );
        }

        // Validate PAN number
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

        if (!panRegex.test(panNumber)) {
            return next(
                new ErrorHandler(
                    "Please enter a valid PAN number",
                    400
                )
            );
        }

        // Update organizer profile
        organizer.organizationName = organizationName;
        organizer.organizationType = organizationType;
        organizer.description = description;
        organizer.address = address;

        organizer.representativeName = representativeName;

        organizer.contactEmail = contactEmail;
        organizer.contactPhone = contactPhone;

        organizer.aadhaarNumber = aadhaarNumber;
        organizer.panNumber = panNumber.toUpperCase();

        // Resubmission requires verification again
        if (
            organizer.verificationStatus === "rejected" ||
            organizer.verificationStatus === "pending"
        ) {
            organizer.verificationStatus = "pending";
        }

        await organizer.save();

        // Mark profile as complete
        req.user.isProfileComplete = true;
        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Organizer profile updated successfully",

            organizer: {
                _id: organizer._id,
                organizerId: organizer.organizerId,
                organizationName: organizer.organizationName,
                organizationType: organizer.organizationType,
                description: organizer.description,
                address: organizer.address,
                representativeName: organizer.representativeName,
                contactEmail: organizer.contactEmail,
                contactPhone: organizer.contactPhone,
                verificationStatus: organizer.verificationStatus,
            },
        });
    }
);


export const getOrganizerProfile = catchAsyncErrors(
    async (req, res, next) => {
        const organizer = await Organizer.findOne({
            userId: req.user._id,
        });

        if (!organizer) {
            return res.status(200).json({
                success: true,
                profileExists: false,
                organizer: null,
            });
        }

        res.status(200).json({
            success: true,
            profileExists: true,
            organizer: {
                _id: organizer._id,
                organizerId: organizer.organizerId,
                organizationName: organizer.organizationName,
                organizationType: organizer.organizationType,
                description: organizer.description,
                address: organizer.address,
                representativeName: organizer.representativeName,
                contactEmail: organizer.contactEmail,
                contactPhone: organizer.contactPhone,
                verificationStatus: organizer.verificationStatus,
            },
        });
    }
);
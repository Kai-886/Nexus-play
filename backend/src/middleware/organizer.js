import Organizer from "../models/organizer.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const isOrganizerVerified = catchAsyncErrors(
    async (req, res, next) => {

        // Check user role
        if (req.user.role !== "organizer") {
            return next(
                new ErrorHandler(
                    "Only organizers can perform this action",
                    403
                )
            );
        }

        // Find organizer profile
        const organizer = await Organizer.findOne({
            userId: req.user._id,
        });

        if (!organizer) {
            return next(
                new ErrorHandler(
                    "Please complete your organizer profile first",
                    403
                )
            );
        }

        // Check profile completion
        if (!req.user.isProfileComplete) {
            return next(
                new ErrorHandler(
                    "Please complete your organizer profile first",
                    403
                )
            );
        }

        // Check verification status
        if (organizer.verificationStatus !== "verified") {

            switch (organizer.verificationStatus) {

                case "pending":
                    return next(
                        new ErrorHandler(
                            "Your organizer profile is pending verification",
                            403
                        )
                    );

                case "rejected":
                    return next(
                        new ErrorHandler(
                            "Your organizer profile has been rejected",
                            403
                        )
                    );

                case "suspended":
                    return next(
                        new ErrorHandler(
                            "Your organizer account has been suspended",
                            403
                        )
                    );

                default:
                    return next(
                        new ErrorHandler(
                            "Your organizer profile is not verified",
                            403
                        )
                    );
            }
        }

        // Organizer is verified
        req.organizer = organizer;

        next();
    }
);
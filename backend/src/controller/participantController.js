import User from "../models/user.js";
import Registration from "../models/Registration.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";


// =====================================================
// GET PARTICIPANT PROFILE
// =====================================================

export const getParticipantProfile = catchAsyncErrors(
    async (req, res, next) => {

        if (req.user.role !== "user") {
            return next(
                new ErrorHandler(
                    "Only participants can access participant profile",
                    403
                )
            );
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return next(
                new ErrorHandler("Participant not found", 404)
            );
        }

        res.status(200).json({
            success: true,
            user,
        });
    }
);


// =====================================================
// UPDATE PARTICIPANT PROFILE
// =====================================================

export const updateParticipantProfile = catchAsyncErrors(
    async (req, res, next) => {

        if (req.user.role !== "user") {
            return next(
                new ErrorHandler(
                    "Only participants can update participant profile",
                    403
                )
            );
        }

        const {
            mobileNumber,
            college,
            collegeId,
            upiId,
        } = req.body;

        const updateData = {};


        // -----------------------------
        // Mobile Number
        // -----------------------------

        if (mobileNumber !== undefined) {

            const cleanedMobile = mobileNumber?.trim();

            if (cleanedMobile) {

                if (!/^[0-9]{10}$/.test(cleanedMobile)) {
                    return next(
                        new ErrorHandler(
                            "Please enter a valid 10-digit mobile number",
                            400
                        )
                    );
                }

                updateData.mobileNumber = cleanedMobile;

            } else {

                updateData.mobileNumber = null;

            }
        }


        // -----------------------------
        // College
        // -----------------------------

        if (college !== undefined) {

            updateData.college =
                college?.trim() || null;
        }


        // -----------------------------
        // College ID
        // -----------------------------

        if (collegeId !== undefined) {

            updateData.collegeId =
                collegeId?.trim() || null;
        }


        // -----------------------------
        // UPI ID
        // -----------------------------

        if (upiId !== undefined) {

            const cleanedUpi =
                upiId?.trim().toLowerCase();

            if (cleanedUpi) {

                const upiRegex =
                    /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;

                if (!upiRegex.test(cleanedUpi)) {
                    return next(
                        new ErrorHandler(
                            "Please enter a valid UPI ID, for example username@upi",
                            400
                        )
                    );
                }

                updateData.upiId = cleanedUpi;

            } else {

                updateData.upiId = null;

            }
        }


        // -----------------------------
        // Update User
        // -----------------------------

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!user) {
            return next(
                new ErrorHandler(
                    "Participant not found",
                    404
                )
            );
        }


        res.status(200).json({
            success: true,
            message: "Participant profile updated successfully",
            user,
        });
    }
);


// =====================================================
// PARTICIPATION HISTORY
// =====================================================

export const getParticipationHistory = catchAsyncErrors(
    async (req, res, next) => {

        if (req.user.role !== "user") {
            return next(
                new ErrorHandler(
                    "Only participants can access participation history",
                    403
                )
            );
        }

        const registrations =
            await Registration.find({
                user: req.user._id,
                status: "registered",
            })
                .populate(
                    "tournament",
                    "title game tournamentType startDate endDate venue entryFee prizePool status"
                )
                .sort({ createdAt: -1 });


        res.status(200).json({
            success: true,
            count: registrations.length,
            registrations,
        });
    }
);
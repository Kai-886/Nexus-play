import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import User from "../models/user.js";
import Sponsor from "../models/sponsor.js";
import { getResetPasswordTemplate } from "../utils/emailTemplate.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import crypto from 'crypto'
// Register user -> /api/v1/register

export const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists"
        });
    }

    const user = await User.create({ name, email, password });

    sendToken(user, 201, res);

})

export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Enter User and password !", 401));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid user or password", 401));
    }

    // check if password is matching
    const isPasswordMatching = await user.comparePassword(password);

    if (!isPasswordMatching) {
        return next(new ErrorHandler("Invalid user or password", 401));
    }

    sendToken(user, 200, res);
})

export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});

export const logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
})


export const changePassword = catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(new ErrorHandler("provided old password, new password and confirm password", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("newPassword and confirmPassword must match ", 400));
    }

    const user = await User.findById(req.user._id).select("+oldPassword");

    if (!user) {
        return next(new ErrorHandler("Old password is incorrect", 401));
    }

    user.password = newPassword;

    await user.save();

    sendToken(user, 200, res);
})


// Forgot password -> /api/v1/auth/password/forgot
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(
            new ErrorHandler("User not found with this email", 404)
        );
    }

    // Get reset password token
    const resetPasswordToken = await user.getResetPasswordToken();

    await user.save();

    // Create reset password URL
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetPasswordToken}`;

    const message = getResetPasswordTemplate(user.name, resetUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: "Nexus-Play Password Recovery",
            message,
        });

        res.status(200).json({
            success: true,
            message: `Password reset link sent to ${user.email}`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset password -> /api/v1/auth/password/reset/:token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHandler(
                "Password reset token is invalid or has expired",
                400
            )
        );
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(
            new ErrorHandler("Passwords do not match", 400)
        );
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

// Register an organizer -> /api/v1/auth/organizer/register
export const registerOrganizer = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(
            new ErrorHandler(
                "Please provide name, email and password",
                400
            )
        );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return next(
            new ErrorHandler("User already exists", 400)
        );
    }

    const user = await User.create({
        name,
        email,
        password,
        role: "organizer",
        isProfileComplete: false,
    });

    sendToken(user, 201, res);
});

// Register sponsor -> /api/v1/auth/sponsor/register
export const registerSponsor = catchAsyncErrors(
    async (req, res, next) => {
        const {
            name,
            email,
            password,
            companyName,
            industry,
            website,
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !companyName
        ) {
            return next(
                new ErrorHandler(
                    "Please provide name, company name, email and password",
                    400
                )
            );
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return next(
                new ErrorHandler(
                    "User with this email already exists",
                    400
                )
            );
        }

        const user = await User.create({
            name,
            email,
            password,
            role: "sponsor",
            isProfileComplete: false,
        });

        await Sponsor.create({
            userId: user._id,
            companyName,
            representativeName: name,
            industry: industry || "Gaming & Esports",
            website: website || "",
            contactEmail: email,
            status: "pending",
        });

        sendToken(user, 201, res);
    }
);

import mongoose from "mongoose";

const sponsorshipSchema = new mongoose.Schema(
    {
        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },

        sponsorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sponsor",
            required: true,
        },

        sponsorUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        tournamentTitle: {
            type: String,
            required: true,
            trim: true,
        },

        game: {
            type: String,
            required: true,
            trim: true,
        },

        amount: {
            type: Number,
            required: [true, "Please provide sponsorship amount"],
            min: [1, "Sponsorship amount must be greater than 0"],
        },

        requirements: {
            type: String,
            required: [true, "Please provide sponsorship requirements"],
            trim: true,
        },

        message: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "active",
                "completed",
            ],
            default: "pending",
        },

        paymentStatus: {
            type: String,
            enum: [
                "not_required",
                "pending",
                "paid",
                "failed",
                "refunded",
            ],
            default: "not_required",
        },

        transactionId: {
            type: String,
            default: null,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        rejectionReason: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Sponsorship = mongoose.model("Sponsorship", sponsorshipSchema);

export default Sponsorship;
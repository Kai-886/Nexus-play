import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Tournament title is required"],
            trim: true,
        },

        game: {
            type: String,
            required: [true, "Game is required"],
            trim: true,
        },

        tournamentType: {
            type: String,
            enum: ["solo", "team"],
            required: [true, "Tournament type is required"],
        },

        description: {
            type: String,
            required: [true, "Tournament description is required"],
            trim: true,
        },

        rules: {
            type: String,
            required: [true, "Tournament rules are required"],
            trim: true,
        },

        tournamentMode: {
            type: String,
            required: [true, "Tournament mode is required"],
            trim: true,
        },

        venue: {
            type: String,
            required: [true, "Tournament venue is required"],
            trim: true,
        },

        cityRegion: {
            type: String,
            required: [true, "City or region is required"],
            trim: true,
        },

        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },

        endDate: {
            type: Date,
            required: [true, "End date is required"],
        },

        registrationDeadline: {
            type: Date,
            required: [true, "Registration deadline is required"],
        },

        entryFee: {
            type: Number,
            required: [true, "Entry fee is required"],
            min: [0, "Entry fee cannot be negative"],
        },

        prizePool: {
            type: Number,
            required: [true, "Prize pool is required"],
            min: [0, "Prize pool cannot be negative"],
        },

        prizes: [
            {
                position: {
                    type: Number,
                    required: true,
                    min: 1,
                },

                amount: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],

        maxParticipants: {
            type: Number,
            required: [true, "Maximum participants is required"],
            min: [2, "Tournament must allow at least 2 participants"],
        },

        teamSize: {
            type: Number,
            min: [1, "Team size must be at least 1"],
        },

        currentParticipants: {
            type: Number,
            default: 0,
            min: [0, "Participants cannot be negative"],
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organizer",
            required: [true, "Tournament organizer is required"],
        },

        status: {
            type: String,
            enum: [
                "draft",
                "published",
                "ongoing",
                "completed",
                "cancelled",
            ],
            default: "draft",
        },
    },
    {
        timestamps: true,
    }
);

const Tournament =
    mongoose.models.Tournament ||
    mongoose.model("Tournament", tournamentSchema);

export default Tournament;
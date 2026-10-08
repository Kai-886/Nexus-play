
import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
    {
        // User who submits the registration (captain)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },

        // Tournament for which registration is made
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament",
            required: [true, "Tournament is required"],
        },

        // Solo or team registration
        registrationType: {
            type: String,
            enum: ["solo", "team"],
            required: [true, "Registration type is required"],
        },

        // Clan/team name required for both solo and team
        teamName: {
            type: String,
            required: [true, "Clan name is required"],
            trim: true,
        },

        // Player information
        // Solo: 1 player
        // Team: 4 players (captain included)
        players: {
            type: [
                {
                    // Optional for players without a NexusPlay account
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null,
                    },

                    fullName: {
                        type: String,
                        required: [true, "Player full name is required"],
                        trim: true,
                    },

                    gameUid: {
                        type: String,
                        required: [true, "Game UID / IGN is required"],
                        trim: true,
                    },

                    email: {
                        type: String,
                        required: [true, "Player email is required"],
                        trim: true,
                        lowercase: true,
                    },

                    phone: {
                        type: String,
                        required: [true, "Player phone number is required"],
                        trim: true,
                    },
                },
            ],
            required: [true, "Players are required"],
            validate: {
                validator: function (players) {
                    return Array.isArray(players) && players.length > 0;
                },
                message: "At least one player is required",
            },
        },

        // Captain's contact details
        captainContact: {
            whatsapp: {
                type: String,
                required: [true, "WhatsApp contact is required"],
                trim: true,
            },

            alternatePhone: {
                type: String,
                trim: true,
                default: "",
            },

            discordId: {
                type: String,
                trim: true,
                default: "",
            },
        },

        // Registration agreements
        agreements: {
            antiCheat: {
                type: Boolean,
                required: true,
                default: false,
            },

            rulebook: {
                type: Boolean,
                required: true,
                default: false,
            },

            identityVerification: {
                type: Boolean,
                required: true,
                default: false,
            },

            mediaConsent: {
                type: Boolean,
                required: true,
                default: false,
            },

            professionalConduct: {
                type: Boolean,
                required: true,
                default: false,
            },

            guardianConsent: {
                type: Boolean,
                required: true,
                default: false,
            },

            captainResponsibility: {
                type: Boolean,
                required: true,
                default: false,
            },
        },

        status: {
            type: String,
            enum: ["registered", "cancelled"],
            default: "registered",
        },
    },
    {
        timestamps: true,
    }
);

// One active registration per captain for a tournament
registrationSchema.index(
    {
        user: 1,
        tournament: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            status: "registered",
        },
    }
);

const Registration = mongoose.model(
    "Registration",
    registrationSchema
);

export default Registration;
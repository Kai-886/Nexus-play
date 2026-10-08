import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema(
    {
        organizerId: {
            type: String,
            unique: true,
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        organizationName: {
            type: String,
            required: [true, "Please enter organization name"],
            trim: true,
        },

        organizationType: {
            type: String,
            required: [true, "Please select organization type"],
            enum: [
                "college",
                "gaming_cafe",
                "company",
                "sports_club",
                "esports_organization",
                "content_creator",
                "other",
            ],
        },

        description: {
            type: String,
            trim: true,
        },

        address: {
            type: String,
            required: [true, "Please enter organization address"],
            trim: true,
        },

        representativeName: {
            type: String,
            trim: true,
        },


        contactEmail: {
            type: String,
            required: [true, "Please enter contact email"],
            lowercase: true,
            trim: true,
        },

        contactPhone: {
            type: String,
            required: [true, "Please enter contact phone"],
            trim: true,
        },

        aadhaarNumber: {
            type: String,
            // required: [true, "Please enter Aadhaar number"],
            trim: true,
            select: false,
        },

        panNumber: {
            type: String,
            // required: [true, "Please enter PAN number"],
            uppercase: true,
            trim: true,
            select: false,
        },
        
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected", "suspended"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const Organizer = mongoose.model("Organizer", organizerSchema);

export default Organizer;
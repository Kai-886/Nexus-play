import mongoose from "mongoose";

const sponsorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: [true, "Please provide company name"],
      trim: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      default: "Gaming & Esports",
    },
    website: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      required: [true, "Please provide contact email"],
    },
    contactPhone: {
      type: String,
      default: "",
    },
    budgetRange: {
      type: String,
      default: "$10,000 - $25,000",
    },
    preferredGames: [
      {
        type: String,
      },
    ],
    preferredLocations: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      default: "",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "active", "rejected", "suspended"],
      default: "pending",
    },
    totalInvested: {
      type: Number,
      default: 0,
    },

    representativeName: {
      type: String,
      trim: true,
    },

    aadhaarNumber: {
      type: String,
      trim: true,
      select: false,
    },

    panNumber: {
      type: String,
      uppercase: true,
      trim: true,
      select: false,
    },

  },
  {
    timestamps: true,
  }
);

const Sponsor = mongoose.model("Sponsor", sponsorSchema);

export default Sponsor;

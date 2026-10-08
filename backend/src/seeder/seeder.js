import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/user.js";

dotenv.config();

const createSuperAdmin = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected");

        // Check if superadmin already exists
        const existingSuperAdmin = await User.findOne({
            role: "superadmin",
        });

        if (existingSuperAdmin) {
            console.log("Superadmin already exists");
            process.exit(0);
        }

        // Create superadmin
        const superAdmin = await User.create({
            name: "NexusPlay Superadmin",
            email: process.env.SUPERADMIN_EMAIL,
            password: process.env.SUPERADMIN_PASSWORD,
            role: "superadmin",
        });

        console.log("Superadmin created successfully");
        console.log(`Email: ${superAdmin.email}`);

        process.exit(0);
    } catch (error) {
        console.error("Error creating superadmin:", error);
        process.exit(1);
    }
};

createSuperAdmin();
import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/user.js";

dotenv.config();

// Fail fast with a clear message instead of hitting mongoose validation errors
const missingEnv = ["SUPERADMIN_EMAIL", "SUPERADMIN_PASSWORD"].filter(
    (key) => !process.env[key]
);

if (missingEnv.length > 0) {
    console.error(
        `Seeder aborted: missing required environment variable(s): ${missingEnv.join(", ")}`
    );
    console.error(
        "Add them to backend/.env (see backend/.env.example) and re-run: node src/seeder/seeder.js"
    );
    process.exit(1);
}

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
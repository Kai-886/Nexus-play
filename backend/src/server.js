import dotevn from 'dotenv';
import app from "./app.js";
import { connectDatabase } from './config/database.js';
import { startTournamentScheduler } from "./utils/tournamentScheduler.js";

dotevn.config();

const PORT = Number(process.env.PORT) || 5000;

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION! Shutting down...");
    console.error(err.name, err.message);

    process.exit(1);
});

import User from "./models/user.js";

async function startServer() {
    try {
        await connectDatabase();

        // Seed root Super Admin if not present
        try {
            const adminEmail = "admin@nexusplay.gg";
            const adminUser = await User.findOne({ email: adminEmail.toLowerCase() });
            if (!adminUser) {
                await User.create({
                    name: "Super Admin Root",
                    email: adminEmail.toLowerCase(),
                    password: "admin123",
                    role: "superadmin",
                });
                console.log("Root Super Admin account initialized: admin@nexusplay.gg / admin123");
            } else if (adminUser.role !== "superadmin") {
                adminUser.role = "superadmin";
                await adminUser.save({ validateBeforeSave: false });
                console.log("User admin@nexusplay.gg upgraded to superadmin");
            }
        } catch (seedErr) {
            console.warn("Super admin seed check:", seedErr.message);
        }

        process.on("unhandledRejection", (err) => {
            console.error("UNHANDLED REJECTION! Shutting down...");
            console.error(err.name, err.message);

            server.close(() => {
                process.exit(1);
            });
        });

        startTournamentScheduler();


        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    }
    catch (err) {
        console.error("Unable to start server:", err.message);

        process.exit(1);
    }
};

startServer();



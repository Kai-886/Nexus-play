// Vercel serverless entry point.
// Connects to Atlas once per warm instance, ensures the root superadmin
// exists (idempotent), starts the tournament status cron, then hands the
// request to the Express app exported from src/app.js.
import app from "../src/app.js";
import { connectDatabase } from "../src/config/database.js";
import { startTournamentScheduler } from "../src/utils/tournamentScheduler.js";
import User from "../src/models/user.js";

let initialized = false;
let initPromise = null;

async function ensureRootAdmin() {
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
        } else if (adminUser.role !== "superadmin") {
            adminUser.role = "superadmin";
            await adminUser.save({ validateBeforeSave: false });
        }
    } catch (seedErr) {
        console.warn("Super admin seed check:", seedErr.message);
    }
}

async function ensureInitialized() {
    if (initialized) return;
    if (!initPromise) {
        initPromise = (async () => {
            await connectDatabase();
            await ensureRootAdmin();
            startTournamentScheduler();
            initialized = true;
        })();
    }
    try {
        await initPromise;
    } catch (err) {
        initPromise = null; // allow retry on next cold-start failure
        throw err;
    }
}

export default async function handler(req, res) {
    try {
        await ensureInitialized();
    } catch (err) {
        console.error("Initialization failed:", err.message);
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ success: false, message: "Service unavailable" }));
    }
    return app(req, res);
}

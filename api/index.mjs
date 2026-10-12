// Vercel serverless entry point (must live in a root api/ dir for Vercel's
// `functions` config to recognize it). Wires runtime dependencies so Vercel
// traces and bundles them, then hands off to the real handler in backend/.
import "dotenv/config";
import "../backend/src/config/database.js";
import "../backend/src/models/user.js";
import "../backend/src/utils/tournamentScheduler.js";

export { default } from "../backend/api/index.js";

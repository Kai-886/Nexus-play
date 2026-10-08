/**
 * One-off demo seed for the landing bento.
 * Usage: node src/seeder/seedDemoTournaments.js
 * Safe to re-run: skips if published tournaments already exist.
 * Requires MongoDB running (npm run db in another terminal).
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Tournament from "../models/tournament.js";
import Organizer from "../models/organizer.js";
import User from "../models/user.js";

dotenv.config();

const day = 86400000;

async function seed() {
    await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nexusPlay"
    );
    console.log("MongoDB connected");

    // Skip if already seeded
    const existing = await Tournament.countDocuments({
        status: { $in: ["published", "ongoing"] },
    });
    if (existing > 0) {
        console.log(
            `Found ${existing} published/ongoing tournament(s) already - seed skipped.`
        );
        await mongoose.disconnect();
        return;
    }

    // Reuse the root superadmin as the organizer owner (schema requires one)
    const admin = await User.findOne({ role: "superadmin" });
    if (!admin) {
        console.error("No superadmin found. Start the backend once first.");
        await mongoose.disconnect();
        process.exit(1);
    }

    let organizer = await Organizer.findOne({ userId: admin._id });
    if (!organizer) {
        organizer = await Organizer.create({
            organizerId: "ORG-SEED-0001",
            userId: admin._id,
            organizationName: "NexusPlay Studios",
            organizationType: "esports_organization",
            description: "In-house tournament operations for the NexusPlay platform.",
            address: "NexusPlay HQ, WeWork Galaxy, Residency Road, Bengaluru 560025",
            representativeName: "Tournament Operations",
            contactEmail: "tournaments@nexusplay.gg",
            contactPhone: "+91 80 4000 1234",
            verificationStatus: "verified",
        });
        console.log("Demo organizer created");
    }

    const now = Date.now();
    const inDays = (d) => new Date(now + d * day);

    const demos = [
        {
            title: "NexusPlay Valorant Open",
            game: "VALORANT",
            tournamentType: "team",
            tournamentMode: "5v5 Double Elimination",
            description:
                "Open-bracket Valorant showdown. 64 teams, single weekend, one champion.",
            rules: "Standard Radiant ruleset. Teams must check in 30 minutes before first match.",
            venue: "NSCI Dome",
            cityRegion: "Mumbai, MH",
            startDate: inDays(3),
            endDate: inDays(4),
            registrationDeadline: inDays(2),
            entryFee: 499,
            prizePool: 50000,
            prizes: [
                { position: 1, amount: 30000 },
                { position: 2, amount: 15000 },
                { position: 3, amount: 5000 },
            ],
            maxParticipants: 64,
            teamSize: 5,
            currentParticipants: 41,
            status: "published",
            organizer: organizer._id,
        },
        {
            title: "BGMI Champions Cup",
            game: "BGMI",
            tournamentType: "team",
            tournamentMode: "Squad Battle Royale",
            description:
                "Six-match lobby series across Erangel, Miramar and Sanhok. Finals broadcast live.",
            rules: "Emulators prohibited. Device check at registration desk.",
            venue: "Online",
            cityRegion: "India",
            startDate: inDays(6),
            endDate: inDays(6),
            registrationDeadline: inDays(5),
            entryFee: 0,
            prizePool: 100000,
            prizes: [
                { position: 1, amount: 60000 },
                { position: 2, amount: 30000 },
                { position: 3, amount: 10000 },
            ],
            maxParticipants: 100,
            teamSize: 4,
            currentParticipants: 88,
            status: "published",
            organizer: organizer._id,
        },
        {
            title: "CS2 Invitational",
            game: "CS2",
            tournamentType: "team",
            tournamentMode: "5v5 Swiss Rounds",
            description:
                "Invite-only Swiss stage feeding into a single-elimination playoff bracket.",
            rules: "VAC-verified accounts only. Anti-cheat client mandatory.",
            venue: "KTPO Convention Centre",
            cityRegion: "Bangalore, KA",
            startDate: inDays(10),
            endDate: inDays(11),
            registrationDeadline: inDays(8),
            entryFee: 999,
            prizePool: 75000,
            prizes: [
                { position: 1, amount: 45000 },
                { position: 2, amount: 20000 },
                { position: 3, amount: 10000 },
            ],
            maxParticipants: 32,
            teamSize: 5,
            currentParticipants: 24,
            status: "published",
            organizer: organizer._id,
        },
        {
            title: "Free Fire Community Clash",
            game: "FREE FIRE",
            tournamentType: "solo",
            tournamentMode: "Solo Battle Royale",
            description:
                "Open solo queue clash. Three lobbies, points across kills and placement.",
            rules: "One account per player. Team-ups result in instant disqualification.",
            venue: "Online",
            cityRegion: "India",
            startDate: inDays(14),
            endDate: inDays(14),
            registrationDeadline: inDays(12),
            entryFee: 0,
            prizePool: 25000,
            prizes: [
                { position: 1, amount: 15000 },
                { position: 2, amount: 7000 },
                { position: 3, amount: 3000 },
            ],
            maxParticipants: 48,
            teamSize: 1,
            currentParticipants: 19,
            status: "published",
            organizer: organizer._id,
        },
        {
            title: "Rocket League Turbo Series",
            game: "Rocket League",
            tournamentType: "team",
            tournamentMode: "3v3 Round Robin",
            description:
                "Weekly round-robin series with relegation. Season 2 qualifiers.",
            rules: "Cross-play enabled. Boost meter standard competitive settings.",
            venue: "Online",
            cityRegion: "India",
            startDate: inDays(18),
            endDate: inDays(19),
            registrationDeadline: inDays(16),
            entryFee: 199,
            prizePool: 18000,
            prizes: [
                { position: 1, amount: 10000 },
                { position: 2, amount: 5500 },
                { position: 3, amount: 2500 },
            ],
            maxParticipants: 24,
            teamSize: 3,
            currentParticipants: 8,
            status: "published",
            organizer: organizer._id,
        },
    ];

    const created = await Tournament.insertMany(demos);
    console.log(`Seeded ${created.length} demo tournaments`);
    created.forEach((t) =>
        console.log(`  - ${t.title} (${t.game}) ₹${t.prizePool}`)
    );

    await mongoose.disconnect();
    console.log("Done");
}

seed().catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
});

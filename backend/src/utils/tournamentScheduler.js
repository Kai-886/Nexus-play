import cron from "node-cron";
import Tournament from "../models/tournament.js";

const updateTournamentStatuses = async () => {
    try {
        const now = new Date();

        // 1. Published tournaments whose start date has arrived
        const ongoingResult = await Tournament.updateMany(
            {
                status: "published",
                startDate: { $lte: now },
                endDate: { $gt: now },
            },
            {
                $set: { status: "ongoing" },
            }
        );

        // 2. Published or ongoing tournaments whose end date has arrived
        const completedResult = await Tournament.updateMany(
            {
                status: { $in: ["published", "ongoing"] },
                endDate: { $lte: now },
            },
            {
                $set: { status: "completed" },
            }
        );

        if (ongoingResult.modifiedCount > 0) {
            console.log(
                `${ongoingResult.modifiedCount} tournament(s) moved to ongoing`
            );
        }

        if (completedResult.modifiedCount > 0) {
            console.log(
                `${completedResult.modifiedCount} tournament(s) moved to completed`
            );
        }
    } catch (error) {
        console.error("Tournament scheduler error:", error.message);
    }
};

export const startTournamentScheduler = () => {
    cron.schedule("* * * * *", updateTournamentStatuses);

    console.log("Tournament scheduler started");
};
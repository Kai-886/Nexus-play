import Organizer from "../models/organizer.js";
import Tournament from "../models/tournament.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";

export const isTournamentOwner = catchAsyncErrors(
    async (req, res, next) => {
        const organizer = await Organizer.findOne({
            userId: req.user._id,
        });

        if (!organizer) {
            return next(new ErrorHandler("Organizer profile not found",404));
        }
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return next(new ErrorHandler("Tournament not found",404));
        }

        if (tournament.organizer.toString() !== organizer._id.toString()) {
            return next(new ErrorHandler("You are not authorized to modify this tournament",403));
        }

        req.tournament = tournament;

        next();
    }
);

import Sponsor from "../models/sponsor.js";
import Sponsorship from "../models/sponsorship.js";
import Tournament from "../models/tournament.js";
import Organizer from "../models/organizer.js";
import Payment from "../models/payment.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";


// @route   GET /api/v1/sponsors/me
// @desc    Get current logged in sponsor profile
export const getMySponsorProfile = catchAsyncErrors(
  async (req, res, next) => {
    const sponsor = await Sponsor.findOne({
      userId: req.user._id,
    });

    if (!sponsor) {
      return next(
        new ErrorHandler("Sponsor not found", 404)
      );
    }

    res.status(200).json({
      success: true,
      data: sponsor,
    });
  }
);


export const updateSponsorProfile = catchAsyncErrors(
  async (req, res, next) => {

    const {
      companyName,
      brandName,
      industry,
      website,
      contactEmail,
      contactPhone,
      budgetRange,
      preferredGames,
      preferredLocations,
      description,
      logoUrl,
      representativeName,
      aadhaarNumber,
      panNumber,
    } = req.body;

    if (
      !companyName ||
      !contactEmail ||
      !aadhaarNumber ||
      !panNumber
    ) {
      return next(
        new ErrorHandler(
          "Company name, email, Aadhaar and PAN are required",
          400
        )
      );
    }

    const aadhaarRegex = /^\d{12}$/;

    if (!aadhaarRegex.test(aadhaarNumber)) {
      return next(
        new ErrorHandler(
          "Aadhaar number must contain exactly 12 digits",
          400
        )
      );
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

    if (!panRegex.test(panNumber)) {
      return next(
        new ErrorHandler(
          "Please enter a valid PAN number",
          400
        )
      );
    }

    let sponsor = await Sponsor.findOne({
      userId: req.user._id,
    });

    if (!sponsor) {

      sponsor = await Sponsor.create({
        userId: req.user._id,
        companyName,
        brandName,
        industry,
        website,
        contactEmail,
        contactPhone,
        budgetRange,
        preferredGames,
        preferredLocations,
        description,
        logoUrl,
        representativeName,
        aadhaarNumber,
        panNumber: panNumber.toUpperCase(),
        status: "pending",
      });

    } else {

      sponsor.companyName = companyName || sponsor.companyName;

      if (brandName !== undefined)
        sponsor.brandName = brandName;

      if (industry !== undefined)
        sponsor.industry = industry;

      if (website !== undefined)
        sponsor.website = website;

      if (contactEmail !== undefined)
        sponsor.contactEmail = contactEmail;

      if (contactPhone !== undefined)
        sponsor.contactPhone = contactPhone;

      if (budgetRange !== undefined)
        sponsor.budgetRange = budgetRange;

      if (preferredGames !== undefined)
        sponsor.preferredGames = preferredGames;

      if (preferredLocations !== undefined)
        sponsor.preferredLocations = preferredLocations;

      if (description !== undefined)
        sponsor.description = description;

      if (logoUrl !== undefined)
        sponsor.logoUrl = logoUrl;

      if (representativeName !== undefined)
        sponsor.representativeName = representativeName;

      if (aadhaarNumber !== undefined)
        sponsor.aadhaarNumber = aadhaarNumber;

      if (panNumber !== undefined)
        sponsor.panNumber = panNumber.toUpperCase();

      // Updating KYC/profile information
      // requires verification again.
      sponsor.status = "pending";

      await sponsor.save();
    }

    res.status(200).json({
      success: true,
      data: sponsor,
    });
  }
);


export const sponsorTournament = catchAsyncErrors(
  async (req, res, next) => {

    const tournamentId = req.params.id;

    // ----------------------------------------------------
    // 1. Find tournament
    // ----------------------------------------------------

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return next(
        new ErrorHandler("Tournament not found", 404)
      );
    }

    // ----------------------------------------------------
    // 2. Tournament must be published
    // ----------------------------------------------------

    if (tournament.status !== "published") {
      return next(
        new ErrorHandler(
          "Sponsorship is available only for published tournaments",
          400
        )
      );
    }

    // ----------------------------------------------------
    // 3. Find sponsor profile
    // ----------------------------------------------------

    const sponsor = await Sponsor.findOne({
      userId: req.user._id,
    });

    if (!sponsor) {
      return next(
        new ErrorHandler(
          "Sponsor profile not found",
          404
        )
      );
    }

    // ----------------------------------------------------
    // 4. Only verified sponsors can sponsor
    // ----------------------------------------------------

    if (sponsor.status !== "verified") {
      return next(
        new ErrorHandler(
          "Only verified sponsors can submit sponsorship requests",
          403
        )
      );
    }

    // ----------------------------------------------------
    // 5. Get request data
    // ----------------------------------------------------

    const {
      amount,
      requirements,
      message = "",
    } = req.body;

    // ----------------------------------------------------
    // 6. Validate amount
    // ----------------------------------------------------

    if (!amount || Number(amount) <= 0) {
      return next(
        new ErrorHandler(
          "Please provide a valid sponsorship amount",
          400
        )
      );
    }

    // ----------------------------------------------------
    // 7. Validate requirements
    // ----------------------------------------------------

    if (
      !requirements ||
      requirements.trim().length === 0
    ) {
      return next(
        new ErrorHandler(
          "Please provide your sponsorship requirements",
          400
        )
      );
    }

    // ----------------------------------------------------
    // 8. Prevent duplicate active/pending request
    // ----------------------------------------------------

    const existingSponsorship = await Sponsorship.findOne({
      tournamentId: tournament._id,
      sponsorId: sponsor._id,
      status: {
        $in: [
          "pending",
          "approved",
          "active",
        ],
      },
    });

    if (existingSponsorship) {
      return next(
        new ErrorHandler(
          "You already have a sponsorship request for this tournament",
          400
        )
      );
    }

    // ----------------------------------------------------
    // 9. Create sponsorship request
    // ----------------------------------------------------

    const sponsorship = await Sponsorship.create({
      tournamentId: tournament._id,
      sponsorId: sponsor._id,
      sponsorUserId: req.user._id,

      tournamentTitle: tournament.title,
      game: tournament.game,

      amount: Number(amount),

      requirements: requirements.trim(),

      message: message
        ? message.trim()
        : "",

      status: "pending",

      // Payment is NOT required yet.
      // It will become pending after organizer approval.
      paymentStatus: "not_required",
    });

    res.status(201).json({
      success: true,
      message:
        "Sponsorship request submitted successfully",
      data: sponsorship,
    });
  }
);


export const getMySponsorships = catchAsyncErrors(
  async (req, res, next) => {

    const sponsorships = await Sponsorship.find({
      sponsorUserId: req.user._id,
    })
      .populate(
        "tournamentId",
        "title game tournamentType startDate endDate venue status"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: sponsorships.length,
      data: sponsorships,
    });
  }
);


export const getTournamentSponsors = catchAsyncErrors(
  async (req, res, next) => {

    const sponsors = await Sponsorship.find({
      tournamentId: req.params.id,

      status: {
        $in: [
          "approved",
          "active",
          "completed",
        ],
      },
    })
      .populate(
        "sponsorId",
        "companyName brandName logoUrl industry"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: sponsors.length,
      data: sponsors,
    });
  }
);

export const getOrganizerSponsors = catchAsyncErrors(
  async (req, res, next) => {

    const organizer = await Organizer.findOne({
      userId: req.user._id,
    });

    if (!organizer) {
      return next(
        new ErrorHandler(
          "Organizer profile not found",
          404
        )
      );
    }

    const tournaments = await Tournament.find({
      organizer: organizer._id,
    }).select("_id");

    const tournamentIds = tournaments.map(
      (tournament) => tournament._id
    );

    const sponsorships = await Sponsorship.find({
      tournamentId: {
        $in: tournamentIds,
      },
    })
      .populate(
        "tournamentId",
        "title game tournamentType startDate endDate venue organizer"
      )
      .populate(
        "sponsorId",
        "companyName brandName industry website logoUrl"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: sponsorships.length,
      data: sponsorships,
    });
  }
);


export const updateSponsorshipStatus = catchAsyncErrors(
  async (req, res, next) => {

    const {
      status,
      rejectionReason = "",
    } = req.body;

    // ----------------------------------------------------
    // 1. Validate status
    // ----------------------------------------------------

    if (!["approved", "rejected"].includes(status)) {
      return next(
        new ErrorHandler(
          "Status must be either approved or rejected",
          400
        )
      );
    }

    // ----------------------------------------------------
    // 2. Find organizer
    // ----------------------------------------------------

    const organizer = await Organizer.findOne({
      userId: req.user._id,
    });

    if (!organizer) {
      return next(
        new ErrorHandler(
          "Organizer profile not found",
          404
        )
      );
    }

    // ----------------------------------------------------
    // 3. Find sponsorship
    // ----------------------------------------------------

    const sponsorship =
      await Sponsorship.findById(req.params.id);

    if (!sponsorship) {
      return next(
        new ErrorHandler(
          "Sponsorship record not found",
          404
        )
      );
    }

    // ----------------------------------------------------
    // 4. Find tournament
    // ----------------------------------------------------

    const tournament = await Tournament.findById(
      sponsorship.tournamentId
    );

    if (!tournament) {
      return next(
        new ErrorHandler(
          "Tournament associated with sponsorship not found",
          404
        )
      );
    }

    // ----------------------------------------------------
    // 5. Verify tournament ownership
    // ----------------------------------------------------

    if (
      tournament.organizer.toString() !==
      organizer._id.toString()
    ) {
      return next(
        new ErrorHandler(
          "You are not authorized to manage this sponsorship",
          403
        )
      );
    }

    // ----------------------------------------------------
    // 6. Only pending requests can be reviewed
    // ----------------------------------------------------

    if (sponsorship.status !== "pending") {
      return next(
        new ErrorHandler(
          "Only pending sponsorship requests can be reviewed",
          400
        )
      );
    }

    // ----------------------------------------------------
    // 7. Update sponsorship
    // ----------------------------------------------------

    sponsorship.status = status;

    if (status === "approved") {

      sponsorship.paymentStatus = "pending";
      sponsorship.rejectionReason = "";

    } else {

      sponsorship.paymentStatus = "not_required";
      sponsorship.rejectionReason =
        rejectionReason.trim();
    }

    await sponsorship.save();

    // ----------------------------------------------------
    // IMPORTANT
    // Approval does NOT mean payment succeeded.
    // Sponsor must pay separately.
    // ----------------------------------------------------

    res.status(200).json({
      success: true,

      message:
        status === "approved"
          ? "Sponsorship approved. Payment is now pending."
          : "Sponsorship rejected.",

      data: sponsorship,
    });
  }
);

export const getAllSponsors = catchAsyncErrors(
  async (req, res, next) => {

    const sponsors = await Sponsor.find({
      status: "verified",
    })
      .select(
        "companyName brandName industry website logoUrl description"
      )
      .sort({
        totalInvested: -1,
      });

    res.status(200).json({
      success: true,
      count: sponsors.length,
      data: sponsors,
    });
  }
);
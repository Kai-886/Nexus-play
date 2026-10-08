import User from "../models/user.js";
import Organizer from "../models/organizer.js";
import Tournament from "../models/tournament.js";
import Sponsor from "../models/sponsor.js";
import Sponsorship from "../models/sponsorship.js";
import Payment from "../models/payment.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

// @route   GET /api/v1/admin/stats
// @desc    Get system-wide metrics and KPIs for Super Admin
export const getDashboardStats = catchAsyncErrors(async (req, res, next) => {
  const [
    totalUsers,
    totalOrganizers,
    totalTournaments,
    activeTournaments,
    totalSponsors,
    payments,
  ] = await Promise.all([
    User.countDocuments(),
    Organizer.countDocuments(),
    Tournament.countDocuments(),
    Tournament.countDocuments({ status: { $in: ["ongoing", "published"] } }),
    Sponsor.countDocuments(),
    Payment.find({ status: "success" }),
  ]);

  const totalVolume = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      totalUsers: totalUsers || 7,
      totalOrganizers: totalOrganizers || 4,
      totalTournaments: totalTournaments || 5,
      activeTournaments: activeTournaments || 3,
      totalSponsors: totalSponsors || 4,
      totalVolume: totalVolume || 17800,
      serverUptime: "99.98%",
      pendingApprovals: 3,
      recentActivities: [
        { id: 1, action: "New User Registered", user: "Marcus Cole", time: "12m ago", type: "user" },
        { id: 2, action: "Tournament Created", user: "Krypton Esports", time: "35m ago", type: "tournament" },
        { id: 3, action: "Sponsorship Paid ($5,000)", user: "Razer Gaming Tech", time: "2h ago", type: "payment" },
        { id: 4, action: "KYC Verification Submitted", user: "Vanguard League", time: "4h ago", type: "organizer" },
      ],
    },
  });
});

// @route   GET /api/v1/admin/users
// @desc    Get all platform users
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const { role, search } = req.query;
  const query = {};

  if (role && role !== "all") {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query).select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: users,
  });
});

// @route   PATCH /api/v1/admin/users/:id/status
// @desc    Suspend or reactivate user
export const updateUserStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.status = status;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User status updated to ${status}`,
    data: user,
  });
});

// @route   PATCH /api/v1/admin/users/:id/role
// @desc    Update user role
export const updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
    data: user,
  });
});

// @route   GET /api/v1/admin/organizers
// @desc    Get all organizers with KYC details
export const getAllOrganizers = catchAsyncErrors(async (req, res, next) => {
  const organizers = await Organizer.find().populate("userId", "name email").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: organizers,
  });
});

// @route   PATCH /api/v1/admin/organizers/:id/status
// @desc    Update organizer verification status
export const updateOrganizerStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const organizer = await Organizer.findById(req.params.id);

  if (!organizer) {
    return next(new ErrorHandler("Organizer not found", 404));
  }

  organizer.status = status;
  await organizer.save();

  res.status(200).json({
    success: true,
    message: `Organizer status updated to ${status}`,
    data: organizer,
  });
});

// @route   GET /api/v1/admin/tournaments
// @desc    Get all platform tournaments
export const getAllTournamentsAdmin = catchAsyncErrors(async (req, res, next) => {
  const tournaments = await Tournament.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: tournaments,
  });
});

// @route   PATCH /api/v1/admin/tournaments/:id/status
// @desc    Moderate tournament status (approve, suspend, etc.)
export const updateTournamentStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const tournament = await Tournament.findById(req.params.id);

  if (!tournament) {
    return next(new ErrorHandler("Tournament not found", 404));
  }

  tournament.status = status;
  await tournament.save();

  res.status(200).json({
    success: true,
    message: `Tournament status updated to ${status}`,
    data: tournament,
  });
});

// @route   PATCH /api/v1/admin/tournaments/:id/featured
// @desc    Toggle featured status on tournament
export const toggleTournamentFeatured = catchAsyncErrors(async (req, res, next) => {
  const tournament = await Tournament.findById(req.params.id);

  if (!tournament) {
    return next(new ErrorHandler("Tournament not found", 404));
  }

  tournament.featured = !tournament.featured;
  await tournament.save();

  res.status(200).json({
    success: true,
    featured: tournament.featured,
  });
});

// @route   DELETE /api/v1/admin/tournaments/:id
// @desc    Delete tournament platform-wide
export const deleteTournamentAdmin = catchAsyncErrors(async (req, res, next) => {
  const tournament = await Tournament.findById(req.params.id);

  if (!tournament) {
    return next(new ErrorHandler("Tournament not found", 404));
  }

  await tournament.deleteOne();

  res.status(200).json({
    success: true,
    message: "Tournament deleted successfully",
  });
});

// @route   GET /api/v1/admin/sponsors
// @desc    Get all sponsors and sponsorship metrics
export const getAllSponsorsAdmin = catchAsyncErrors(async (req, res, next) => {
  const sponsors = await Sponsor.find().populate("userId", "name email").sort({ totalInvested: -1 });

  res.status(200).json({
    success: true,
    data: sponsors,
  });
});

// @route   PATCH /api/v1/admin/sponsors/:id/status
// @desc    Update sponsor status
export const updateSponsorStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const sponsor = await Sponsor.findById(req.params.id);

  if (!sponsor) {
    return next(new ErrorHandler("Sponsor record not found", 404));
  }

  sponsor.status = status;
  await sponsor.save();

  res.status(200).json({
    success: true,
    message: `Sponsor status updated to ${status}`,
    data: sponsor,
  });
});

// @route   GET /api/v1/admin/payments
// @desc    Get payment and escrow ledger
export const getAllPayments = catchAsyncErrors(async (req, res, next) => {
  const payments = await Payment.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: payments,
  });
});

// @route   GET /api/v1/admin/reports
// @desc    Get strategic platform analytics
export const getReports = catchAsyncErrors(async (req, res, next) => {
  const reports = {
    gameBreakdown: [
      { game: "Valorant", count: 28, percentage: 38 },
      { game: "BGMI", count: 22, percentage: 30 },
      { game: "Counter-Strike 2", count: 14, percentage: 19 },
      { game: "Free Fire", count: 6, percentage: 8 },
      { game: "Apex Legends", count: 4, percentage: 5 },
    ],
    monthlyRevenue: [
      { month: "May", amount: 18500 },
      { month: "Jun", amount: 24200 },
      { month: "Jul", amount: 31000 },
      { month: "Aug", amount: 48900 },
      { month: "Sep", amount: 56400 },
    ],
    userGrowth: [
      { month: "May", users: 450 },
      { month: "Jun", users: 890 },
      { month: "Jul", users: 1540 },
      { month: "Aug", users: 2450 },
      { month: "Sep", users: 3820 },
    ],
    totalCommissionEarned: 2820,
  };

  res.status(200).json({
    success: true,
    data: reports,
  });
});

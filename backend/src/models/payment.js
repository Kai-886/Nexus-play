import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
    },
    type: {
      type: String,
      enum: [
        "Sponsorship Payout",
        "Registration Fee Pool",
        "Registration Refund",
        "Prize Pool Payout",
        "Sponsorship Deposit",
      ],
      default: "Sponsorship Deposit",
    },
    entity: {
      type: String,
      required: true,
    },
    tournament: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      default: "Bank Transfer",
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed", "refunded"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;

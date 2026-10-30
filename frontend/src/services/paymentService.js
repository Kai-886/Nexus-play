import api from "./api";

// Entry-fee checkout: creates a gateway order, runs the checkout step
// (sandbox locally, hosted gateway in razorpay mode), then verifies the
// signature server-side before any registration is allowed to exist.
export const paymentService = {
  createOrder: async (tournamentId) => {
    const response = await api.post("/payments/order", { tournamentId });
    return response.data;
  },

  sandboxCheckout: async (orderId) => {
    const response = await api.post("/payments/sandbox/checkout", {
      orderId,
    });
    return response.data;
  },

  verify: async ({ orderId, paymentId, signature }) => {
    const response = await api.post("/payments/verify", {
      orderId,
      paymentId,
      signature,
    });
    return response.data;
  },
};

export default paymentService;
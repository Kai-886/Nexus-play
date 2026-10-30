import crypto from "crypto";

/**
 * Razorpay-shaped payment provider - DEMO / TEST MODE ONLY.
 *
 * PAYMENT_MODE=razorpay  -> real Razorpay REST order API + HMAC signature
 *                           check, using rzp_test_ keys. The hosted checkout
 *                           popup is the genuine Razorpay UI, but no money
 *                           ever moves.
 * PAYMENT_MODE=sandbox   -> local orders, identical signature contract,
 *                           no keys required, no money moves.
 *
 * Live payments are deliberately not supported: rzp_live_ keys are refused
 * (see assertDemoKeys), so a misconfigured environment can never charge a
 * real card or UPI account. The client contract (order -> checkout ->
 * signature -> server verify) is identical in both demo modes, because in
 * both cases the signature is "HMAC_SHA256(order_id|payment_id, secret)".
 */

const getMode = () =>
    process.env.PAYMENT_MODE === "razorpay" ? "razorpay" : "sandbox";

const razorpayKeyId = () => process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = () => process.env.RAZORPAY_KEY_SECRET || "";

// Sandbox-only secret; never used to verify real gateway signatures.
const sandboxSecret = () =>
    process.env.PAYMENT_SANDBOX_SECRET || "nexusplay_sandbox_secret";

const hmac = (payload, secret) =>
    crypto.createHmac("sha256", secret).update(payload).digest("hex");

const safeEqual = (a, b) => {
    const bufA = Buffer.from(String(a || ""));
    const bufB = Buffer.from(String(b || ""));
    if (bufA.length === 0 || bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Create an order for an amount in paise.
 * @returns {{orderId: string, amount: number, currency: string, keyId: string, mode: string}}
 */
// Demo policy: only Razorpay TEST keys are ever accepted. A live key here
// would mean real money at stake, which this deployment does not do.
const assertDemoKeys = () => {
    if (razorpayKeyId().startsWith("rzp_live_")) {
        const err = new Error(
            "Live Razorpay keys are disabled - NexusPlay runs demo payments with rzp_test_ keys only"
        );
        err.statusCode = 503;
        throw err;
    }
};

export const createOrder = async ({ amountPaise, receipt, notes = {} }) => {
    if (getMode() === "razorpay") {
        if (!razorpayKeyId() || !razorpayKeySecret()) {
            throw new Error(
                "PAYMENT_MODE=razorpay but RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set"
            );
        }
        assertDemoKeys();

        const res = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " +
                    Buffer.from(
                        `${razorpayKeyId()}:${razorpayKeySecret()}`
                    ).toString("base64"),
            },
            body: JSON.stringify({
                amount: amountPaise,
                currency: "INR",
                receipt,
                notes,
            }),
        });

        if (!res.ok) {
            const detail = await res.text();

            // Bad/revoked keys must surface as auth failure, not a generic 500.
            if (res.status === 401 || res.status === 403) {
                const err = new Error(
                    "Payment gateway authentication failed - check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET"
                );
                err.statusCode = 401;
                throw err;
            }

            const err = new Error(
                `Razorpay order creation failed (${res.status}): ${detail.slice(0, 200)}`
            );
            err.statusCode = 500;
            throw err;
        }

        const order = await res.json();
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: razorpayKeyId(),
            mode: "razorpay",
        };
    }

    return {
        orderId: "order_SBOX" + crypto.randomBytes(8).toString("hex"),
        amount: amountPaise,
        currency: "INR",
        keyId: "sandbox_key",
        mode: "sandbox",
    };
};

/**
 * Verify the checkout signature for an order/payment pair.
 */
export const verifySignature = ({ orderId, paymentId, signature }) => {
    const secret =
        getMode() === "razorpay" ? razorpayKeySecret() : sandboxSecret();

    if (!secret) return false;
    if (!orderId || !paymentId || !signature) return false;

    const expected = hmac(`${orderId}|${paymentId}`, secret);
    return safeEqual(expected, signature);
};

/**
 * Sandbox-only simulated gateway checkout. In razorpay mode the signature
 * comes from Razorpay's hosted checkout — never from this server — so this
 * function refuses to run outside sandbox mode.
 */
export const sandboxCheckout = (orderId) => {
    if (getMode() !== "sandbox") {
        throw new Error("Sandbox checkout is disabled outside sandbox mode");
    }
    if (!orderId) throw new Error("orderId is required");

    const paymentId = "pay_SBOX" + crypto.randomBytes(8).toString("hex");
    return {
        paymentId,
        signature: hmac(`${orderId}|${paymentId}`, sandboxSecret()),
        method: "upi",
        mode: "sandbox",
    };
};

export const paymentMode = getMode;
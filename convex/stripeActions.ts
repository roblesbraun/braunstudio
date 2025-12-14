"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import Stripe from "stripe";

// Create Stripe Connect onboarding link (action)
export const createConnectOnboardingLink = action({
    args: {
        weddingId: v.id("weddings"),
    },
    handler: async (ctx, { weddingId }): Promise<{ url: string }> => {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error("Stripe is not configured");
        }

        // Get wedding
        const wedding = await ctx.runQuery(
            internal.stripe.getWeddingForStripe,
            {
                weddingId,
            }
        );

        if (!wedding) {
            throw new Error("Wedding not found");
        }

        const stripeClient = new Stripe(stripeSecretKey);

        let accountId = wedding.stripeAccountId;

        // Create a new Stripe Connect account if none exists
        if (!accountId) {
            const account = await stripeClient.accounts.create({
                type: "standard",
            });
            accountId = account.id;

            // Update wedding with account ID
            await ctx.runMutation(internal.stripe.updateConnectStatus, {
                weddingId,
                stripeAccountId: accountId,
                stripeConnectStatus: "pending",
            });
        }

        // Create onboarding link
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || "https://app.braunstud.io";
        const accountLink = await stripeClient.accountLinks.create({
            account: accountId,
            refresh_url: `${baseUrl}/couple/settings?stripe=refresh`,
            return_url: `${baseUrl}/couple/settings?stripe=complete`,
            type: "account_onboarding",
        });

        return { url: accountLink.url };
    },
});

// Check Stripe Connect account status (action)
export const checkConnectStatus = action({
    args: {
        weddingId: v.id("weddings"),
    },
    handler: async (
        ctx,
        { weddingId }
    ): Promise<{
        status: "not_connected" | "pending" | "active" | "restricted";
    }> => {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error("Stripe is not configured");
        }

        const wedding = await ctx.runQuery(
            internal.stripe.getWeddingForStripe,
            {
                weddingId,
            }
        );

        if (!wedding || !wedding.stripeAccountId) {
            return { status: "not_connected" as const };
        }

        const stripeClient = new Stripe(stripeSecretKey);

        try {
            const account = await stripeClient.accounts.retrieve(
                wedding.stripeAccountId
            );

            let status: "not_connected" | "pending" | "active" | "restricted" =
                "pending";

            if (account.charges_enabled && account.payouts_enabled) {
                status = "active";
            } else if (account.requirements?.disabled_reason) {
                status = "restricted";
            }

            // Update status if changed
            if (status !== wedding.stripeConnectStatus) {
                await ctx.runMutation(internal.stripe.updateConnectStatus, {
                    weddingId,
                    stripeAccountId: wedding.stripeAccountId,
                    stripeConnectStatus: status,
                });
            }

            return { status };
        } catch (error) {
            console.error("Failed to check Stripe account:", error);
            return {
                status: (wedding.stripeConnectStatus || "not_connected") as
                    | "not_connected"
                    | "pending"
                    | "active"
                    | "restricted",
            };
        }
    },
});

// Create a PaymentIntent for a gift contribution (action)
export const createGiftPaymentIntent = action({
    args: {
        weddingId: v.id("weddings"),
        giftId: v.id("gifts"),
        amount: v.number(), // in cents
        guestName: v.optional(v.string()),
        guestPhone: v.optional(v.string()),
        message: v.optional(v.string()),
    },
    handler: async (
        ctx,
        { weddingId, giftId, amount, guestName, guestPhone, message }
    ): Promise<{ clientSecret: string | null; paymentIntentId: string }> => {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error("Stripe is not configured");
        }

        // Get wedding and verify it has Stripe Connect
        const wedding = await ctx.runQuery(
            internal.stripe.getWeddingForStripe,
            {
                weddingId,
            }
        );

        if (!wedding) {
            throw new Error("Wedding not found");
        }

        if (wedding.status !== "active") {
            throw new Error("Wedding is not active");
        }

        if (wedding.giftsMode !== "internal") {
            throw new Error("Internal gifts not enabled");
        }

        if (
            !wedding.stripeAccountId ||
            wedding.stripeConnectStatus !== "active"
        ) {
            throw new Error("Payment not available for this wedding");
        }

        // Get gift
        const gift = await ctx.runQuery(internal.stripe.getGiftForStripe, {
            giftId,
        });
        if (!gift || gift.weddingId !== weddingId) {
            throw new Error("Gift not found");
        }

        const stripeClient = new Stripe(stripeSecretKey);

        // Calculate platform fee (optional - e.g., 2.5%)
        const platformFeePercent = 2.5;
        const applicationFeeAmount = Math.round(
            amount * (platformFeePercent / 100)
        );

        // Create PaymentIntent with destination charge
        const paymentIntent = await stripeClient.paymentIntents.create({
            amount,
            currency: "usd",
            application_fee_amount: applicationFeeAmount,
            transfer_data: {
                destination: wedding.stripeAccountId,
            },
            metadata: {
                weddingId,
                giftId,
                guestName: guestName || "",
                guestPhone: guestPhone || "",
                message: message || "",
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    },
});

// Handle Stripe webhook (action with Node.js for signature verification)
export const handleWebhook = action({
    args: {
        payload: v.string(),
        signature: v.string(),
    },
    handler: async (
        ctx,
        { payload, signature }
    ): Promise<{ received: boolean }> => {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!stripeSecretKey || !stripeWebhookSecret) {
            throw new Error("Stripe is not configured");
        }

        const stripeClient = new Stripe(stripeSecretKey);

        // Verify the webhook signature
        const event = stripeClient.webhooks.constructEvent(
            payload,
            signature,
            stripeWebhookSecret
        );

        // Handle the event
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const metadata = paymentIntent.metadata;

            if (metadata.weddingId && metadata.giftId) {
                await ctx.runMutation(api.stripe.handlePaymentSuccess, {
                    paymentIntentId: paymentIntent.id,
                    weddingId: metadata.weddingId as Id<"weddings">,
                    giftId: metadata.giftId as Id<"gifts">,
                    amount: paymentIntent.amount,
                    guestName: metadata.guestName || undefined,
                    guestPhone: metadata.guestPhone || undefined,
                    message: metadata.message || undefined,
                });
            }
        }

        // Handle Connect account updates
        if (event.type === "account.updated") {
            const account = event.data.object as Stripe.Account;
            console.log("Stripe Connect account updated:", account.id);
        }

        return { received: true };
    },
});

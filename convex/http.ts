import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// Add Convex Auth routes
auth.addHttpRoutes(http);

// Guest OTP Request endpoint
http.route({
    path: "/guest/otp/request",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const body = await request.json();
            const { weddingId, phone } = body;

            if (!weddingId || !phone) {
                return new Response(
                    JSON.stringify({ error: "Missing weddingId or phone" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            // Send OTP via WhatsApp (using the node action)
            const result = await ctx.runAction(
                api.twilioActions.sendOtpWhatsApp,
                {
                    weddingId: weddingId as Id<"weddings">,
                    phone,
                }
            );

            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown error";
            return new Response(JSON.stringify({ error: message }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    }),
});

// Guest OTP Verify endpoint
http.route({
    path: "/guest/otp/verify",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const body = await request.json();
            const { weddingId, phone, code } = body;

            if (!weddingId || !phone || !code) {
                return new Response(
                    JSON.stringify({ error: "Missing required fields" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            // Verify OTP and get session token
            const result = await ctx.runMutation(api.guestAuth.verifyOtp, {
                weddingId: weddingId as Id<"weddings">,
                phone,
                code,
            });

            return new Response(
                JSON.stringify({
                    success: true,
                    sessionToken: result.sessionToken,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown error";
            return new Response(JSON.stringify({ error: message }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    }),
});

// Guest session validation endpoint
http.route({
    path: "/guest/session",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const body = await request.json();
            const { weddingId, sessionToken } = body;

            if (!weddingId || !sessionToken) {
                return new Response(
                    JSON.stringify({ error: "Missing required fields" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            const session = await ctx.runQuery(api.guestAuth.validateSession, {
                weddingId: weddingId as Id<"weddings">,
                sessionToken,
            });

            if (!session) {
                return new Response(
                    JSON.stringify({ error: "Invalid session" }),
                    {
                        status: 401,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            return new Response(JSON.stringify(session), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown error";
            return new Response(JSON.stringify({ error: message }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    }),
});

// Guest logout endpoint
http.route({
    path: "/guest/logout",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const body = await request.json();
            const { sessionToken } = body;

            if (!sessionToken) {
                return new Response(
                    JSON.stringify({ error: "Missing sessionToken" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            await ctx.runMutation(api.guestAuth.logout, { sessionToken });

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown error";
            return new Response(JSON.stringify({ error: message }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    }),
});

// Stripe webhook endpoint - delegates to Node.js action for signature verification
http.route({
    path: "/stripe/webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
            return new Response(
                JSON.stringify({ error: "Missing signature" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const body = await request.text();

        try {
            // Use the Node.js action to verify and process the webhook
            const result = await ctx.runAction(
                api.stripeActions.handleWebhook,
                {
                    payload: body,
                    signature,
                }
            );

            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Stripe webhook error:", message);
            return new Response(JSON.stringify({ error: message }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    }),
});

export default http;

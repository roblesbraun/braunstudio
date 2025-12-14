import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Constants
const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Generate a random OTP
function generateOtp(): string {
    let otp = "";
    for (let i = 0; i < OTP_LENGTH; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
}

// Generate a random session token
function generateSessionToken(): string {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Simple hash function (in production, use a proper crypto library)
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36) + str.length.toString(36);
}

// Request OTP - creates OTP record and returns the code (for action to send)
// This is an internal mutation called by the twilioActions
export const createOtpRecord = internalMutation({
    args: {
        weddingId: v.id("weddings"),
        phone: v.string(),
    },
    handler: async (ctx, { weddingId, phone }) => {
        // Verify wedding exists
        const wedding = await ctx.db.get(weddingId);
        if (!wedding) {
            throw new Error("Wedding not found");
        }

        // Verify guest exists for this wedding
        const guest = await ctx.db
            .query("guests")
            .withIndex("by_wedding_phone", (q) =>
                q.eq("weddingId", weddingId).eq("phone", phone)
            )
            .first();

        if (!guest) {
            throw new Error("Guest not found");
        }

        // Check for existing OTP and rate limiting
        const existingOtp = await ctx.db
            .query("guestOtps")
            .withIndex("by_wedding_phone", (q) =>
                q.eq("weddingId", weddingId).eq("phone", phone)
            )
            .first();

        if (existingOtp) {
            // If recent OTP exists and not expired, increment attempt count
            if (existingOtp.expiresAt > Date.now()) {
                if (existingOtp.attemptCount >= MAX_OTP_ATTEMPTS) {
                    throw new Error(
                        "Too many attempts. Please wait and try again."
                    );
                }
            }
            // Delete old OTP
            await ctx.db.delete(existingOtp._id);
        }

        // Generate new OTP
        const otp = generateOtp();
        const codeHash = simpleHash(otp);

        // Store OTP
        await ctx.db.insert("guestOtps", {
            weddingId,
            phone,
            codeHash,
            expiresAt: Date.now() + OTP_EXPIRY_MS,
            attemptCount: 0,
            createdAt: Date.now(),
        });

        return { otp, guestName: guest.name };
    },
});

// Verify OTP and create session
export const verifyOtp = mutation({
    args: {
        weddingId: v.id("weddings"),
        phone: v.string(),
        code: v.string(),
    },
    handler: async (ctx, { weddingId, phone, code }) => {
        // Find OTP record
        const otpRecord = await ctx.db
            .query("guestOtps")
            .withIndex("by_wedding_phone", (q) =>
                q.eq("weddingId", weddingId).eq("phone", phone)
            )
            .first();

        if (!otpRecord) {
            throw new Error("No OTP request found. Please request a new code.");
        }

        // Check expiry
        if (otpRecord.expiresAt < Date.now()) {
            await ctx.db.delete(otpRecord._id);
            throw new Error("OTP has expired. Please request a new code.");
        }

        // Check attempts
        if (otpRecord.attemptCount >= MAX_OTP_ATTEMPTS) {
            throw new Error("Too many attempts. Please request a new code.");
        }

        // Verify code
        const codeHash = simpleHash(code);
        if (codeHash !== otpRecord.codeHash) {
            // Increment attempt count
            await ctx.db.patch(otpRecord._id, {
                attemptCount: otpRecord.attemptCount + 1,
            });
            throw new Error("Invalid code. Please try again.");
        }

        // OTP is valid - delete it
        await ctx.db.delete(otpRecord._id);

        // Delete any existing sessions for this guest
        const existingSessions = await ctx.db
            .query("guestSessions")
            .withIndex("by_wedding_phone", (q) =>
                q.eq("weddingId", weddingId).eq("phone", phone)
            )
            .collect();

        for (const session of existingSessions) {
            await ctx.db.delete(session._id);
        }

        // Create new session
        const sessionToken = generateSessionToken();
        const sessionTokenHash = simpleHash(sessionToken);

        await ctx.db.insert("guestSessions", {
            weddingId,
            phone,
            sessionTokenHash,
            expiresAt: Date.now() + SESSION_EXPIRY_MS,
            createdAt: Date.now(),
        });

        return { sessionToken };
    },
});

// Validate session token
export const validateSession = query({
    args: {
        weddingId: v.id("weddings"),
        sessionToken: v.string(),
    },
    handler: async (ctx, { weddingId, sessionToken }) => {
        const sessionTokenHash = simpleHash(sessionToken);

        const session = await ctx.db
            .query("guestSessions")
            .withIndex("by_token", (q) =>
                q.eq("sessionTokenHash", sessionTokenHash)
            )
            .first();

        if (!session) {
            return null;
        }

        // Check if session matches wedding
        if (session.weddingId !== weddingId) {
            return null;
        }

        // Check expiry
        if (session.expiresAt < Date.now()) {
            return null;
        }

        // Get guest info
        const guest = await ctx.db
            .query("guests")
            .withIndex("by_wedding_phone", (q) =>
                q.eq("weddingId", weddingId).eq("phone", session.phone)
            )
            .first();

        if (!guest) {
            return null;
        }

        return {
            phone: session.phone,
            guestId: guest._id,
            guestName: guest.name,
        };
    },
});

// Logout (invalidate session)
export const logout = mutation({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, { sessionToken }) => {
        const sessionTokenHash = simpleHash(sessionToken);

        const session = await ctx.db
            .query("guestSessions")
            .withIndex("by_token", (q) =>
                q.eq("sessionTokenHash", sessionTokenHash)
            )
            .first();

        if (session) {
            await ctx.db.delete(session._id);
        }

        return { success: true };
    },
});

// Guest RSVP submission (requires valid session)
export const submitRsvp = mutation({
    args: {
        weddingId: v.id("weddings"),
        sessionToken: v.string(),
        rsvpStatus: v.union(v.literal("confirmed"), v.literal("declined")),
        dietaryRestrictions: v.optional(v.string()),
    },
    handler: async (
        ctx,
        { weddingId, sessionToken, rsvpStatus, dietaryRestrictions }
    ) => {
        // Validate session
        const sessionTokenHash = simpleHash(sessionToken);

        const session = await ctx.db
            .query("guestSessions")
            .withIndex("by_token", (q) =>
                q.eq("sessionTokenHash", sessionTokenHash)
            )
            .first();

        if (
            !session ||
            session.weddingId !== weddingId ||
            session.expiresAt < Date.now()
        ) {
            throw new Error("Invalid or expired session");
        }

        // Check wedding status (only active weddings can receive RSVPs)
        const wedding = await ctx.db.get(weddingId);
        if (!wedding || wedding.status !== "active") {
            throw new Error("RSVP not available");
        }

        // Find guest
        const guest = await ctx.db
            .query("guests")
            .withIndex("by_wedding_phone", (q) =>
                q.eq("weddingId", weddingId).eq("phone", session.phone)
            )
            .first();

        if (!guest) {
            throw new Error("Guest not found");
        }

        // Update RSVP
        await ctx.db.patch(guest._id, {
            rsvpStatus,
            dietaryRestrictions,
            rsvpAt: Date.now(),
        });

        return { success: true };
    },
});

// Internal mutation to log messages (called by twilioActions)
export const logMessage = internalMutation({
    args: {
        weddingId: v.id("weddings"),
        toPhone: v.string(),
        messageType: v.union(
            v.literal("otp"),
            v.literal("notification"),
            v.literal("reminder")
        ),
        messageBody: v.string(),
        twilioMessageSid: v.optional(v.string()),
        status: v.union(
            v.literal("pending"),
            v.literal("sent"),
            v.literal("delivered"),
            v.literal("failed")
        ),
        errorMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("messageLogs", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

// Cleanup expired OTPs and sessions (can be called periodically)
export const cleanupExpired = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        // Delete expired OTPs
        const expiredOtps = await ctx.db
            .query("guestOtps")
            .withIndex("by_expires", (q) => q.lt("expiresAt", now))
            .collect();

        for (const otp of expiredOtps) {
            await ctx.db.delete(otp._id);
        }

        // Delete expired sessions
        const expiredSessions = await ctx.db
            .query("guestSessions")
            .withIndex("by_expires", (q) => q.lt("expiresAt", now))
            .collect();

        for (const session of expiredSessions) {
            await ctx.db.delete(session._id);
        }

        return {
            deletedOtps: expiredOtps.length,
            deletedSessions: expiredSessions.length,
        };
    },
});

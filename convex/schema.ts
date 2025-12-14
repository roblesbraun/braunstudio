import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Wedding status enum values
const weddingStatus = v.union(
    v.literal("draft"),
    v.literal("pending_payment"),
    v.literal("active"),
    v.literal("paused")
);

// RSVP status enum values
const rsvpStatus = v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("declined")
);

// Gifts mode enum values
const giftsMode = v.union(v.literal("external"), v.literal("internal"));

// Stripe Connect status enum values
const stripeConnectStatus = v.union(
    v.literal("not_connected"),
    v.literal("pending"),
    v.literal("active"),
    v.literal("restricted")
);

// User role enum values
const userRole = v.union(v.literal("platform_admin"), v.literal("couple"));

// shadcn-style color palette tokens
const paletteTokens = v.object({
    background: v.string(),
    foreground: v.string(),
    card: v.string(),
    cardForeground: v.string(),
    popover: v.string(),
    popoverForeground: v.string(),
    primary: v.string(),
    primaryForeground: v.string(),
    secondary: v.string(),
    secondaryForeground: v.string(),
    muted: v.string(),
    mutedForeground: v.string(),
    accent: v.string(),
    accentForeground: v.string(),
    destructive: v.string(),
    destructiveForeground: v.string(),
    border: v.string(),
    input: v.string(),
    ring: v.string(),
});

// Wedding sections configuration
const weddingSections = v.object({
    hero: v.object({
        enabled: v.boolean(),
        title: v.optional(v.string()),
        subtitle: v.optional(v.string()),
        date: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    }),
    location: v.object({
        enabled: v.boolean(),
        venueName: v.optional(v.string()),
        address: v.optional(v.string()),
        mapUrl: v.optional(v.string()),
        notes: v.optional(v.string()),
    }),
    lodging: v.object({
        enabled: v.boolean(),
        hotels: v.optional(
            v.array(
                v.object({
                    name: v.string(),
                    address: v.optional(v.string()),
                    url: v.optional(v.string()),
                    notes: v.optional(v.string()),
                })
            )
        ),
    }),
    gifts: v.object({
        enabled: v.boolean(),
        message: v.optional(v.string()),
        externalUrl: v.optional(v.string()),
    }),
    dressCode: v.object({
        enabled: v.boolean(),
        code: v.optional(v.string()),
        description: v.optional(v.string()),
    }),
    rsvp: v.object({
        enabled: v.boolean(),
        deadline: v.optional(v.string()),
        message: v.optional(v.string()),
    }),
    itinerary: v.object({
        enabled: v.boolean(),
        events: v.optional(
            v.array(
                v.object({
                    time: v.string(),
                    title: v.string(),
                    description: v.optional(v.string()),
                })
            )
        ),
    }),
});

export default defineSchema({
    // Convex Auth tables
    ...authTables,

    // Extended users table (merges with auth tables)
    users: defineTable({
        // Convex Auth fields (required)
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
        image: v.optional(v.string()),
        // Custom fields
        name: v.optional(v.string()),
        role: v.optional(userRole),
        // For couples, reference to their wedding
        weddingId: v.optional(v.id("weddings")),
    })
        .index("email", ["email"]) // Convex Auth requires this exact index name
        .index("by_role", ["role"])
        .index("by_wedding", ["weddingId"]),

    // Weddings table
    weddings: defineTable({
        slug: v.string(),
        status: weddingStatus,
        ownerUserId: v.id("users"),
        previewToken: v.string(),
        // Template configuration
        templateId: v.string(),
        templateVersion: v.string(),
        // Theme with shadcn-style palette
        theme: v.object({
            palette: paletteTokens,
            // Additional theme options can be added here
            fontFamily: v.optional(v.string()),
        }),
        // Wedding sections content
        sections: weddingSections,
        // Gifts configuration
        giftsMode: giftsMode,
        // Stripe Connect for gift payments (optional)
        stripeAccountId: v.optional(v.string()),
        stripeConnectStatus: stripeConnectStatus,
        // Couple details
        partner1Name: v.optional(v.string()),
        partner2Name: v.optional(v.string()),
        weddingDate: v.optional(v.string()),
    })
        .index("by_slug", ["slug"])
        .index("by_preview_token", ["previewToken"])
        .index("by_owner", ["ownerUserId"])
        .index("by_status", ["status"]),

    // Guests table
    guests: defineTable({
        weddingId: v.id("weddings"),
        name: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        rsvpStatus: rsvpStatus,
        plusOne: v.optional(v.boolean()),
        dietaryRestrictions: v.optional(v.string()),
        notes: v.optional(v.string()),
        rsvpAt: v.optional(v.number()),
    })
        .index("by_wedding", ["weddingId"])
        .index("by_wedding_phone", ["weddingId", "phone"])
        .index("by_wedding_rsvp", ["weddingId", "rsvpStatus"]),

    // Gifts table (for internal gift registry)
    gifts: defineTable({
        weddingId: v.id("weddings"),
        title: v.string(),
        description: v.optional(v.string()),
        price: v.number(),
        imageUrl: v.optional(v.string()),
        amountCollected: v.number(),
        isFullyFunded: v.boolean(),
        sortOrder: v.optional(v.number()),
    }).index("by_wedding", ["weddingId"]),

    // Gift contributions (for tracking who contributed)
    giftContributions: defineTable({
        giftId: v.id("gifts"),
        weddingId: v.id("weddings"),
        guestPhone: v.optional(v.string()),
        guestName: v.optional(v.string()),
        amount: v.number(),
        stripePaymentIntentId: v.optional(v.string()),
        message: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_gift", ["giftId"])
        .index("by_wedding", ["weddingId"]),

    // Leads table (from marketing contact form)
    leads: defineTable({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        message: v.string(),
        source: v.string(),
        createdAt: v.number(),
        // Admin tracking
        status: v.optional(
            v.union(
                v.literal("new"),
                v.literal("contacted"),
                v.literal("converted"),
                v.literal("closed")
            )
        ),
        notes: v.optional(v.string()),
    })
        .index("by_email", ["email"])
        .index("by_status", ["status"])
        .index("by_created", ["createdAt"]),

    // Guest OTP table (for guest authentication)
    guestOtps: defineTable({
        weddingId: v.id("weddings"),
        phone: v.string(),
        codeHash: v.string(),
        expiresAt: v.number(),
        attemptCount: v.number(),
        createdAt: v.number(),
    })
        .index("by_wedding_phone", ["weddingId", "phone"])
        .index("by_expires", ["expiresAt"]),

    // Guest sessions table
    guestSessions: defineTable({
        weddingId: v.id("weddings"),
        phone: v.string(),
        sessionTokenHash: v.string(),
        expiresAt: v.number(),
        createdAt: v.number(),
    })
        .index("by_wedding_phone", ["weddingId", "phone"])
        .index("by_token", ["sessionTokenHash"])
        .index("by_expires", ["expiresAt"]),

    // Message logs (for Twilio WhatsApp messages)
    messageLogs: defineTable({
        weddingId: v.optional(v.id("weddings")),
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
        createdAt: v.number(),
    })
        .index("by_wedding", ["weddingId"])
        .index("by_phone", ["toPhone"])
        .index("by_status", ["status"]),
});

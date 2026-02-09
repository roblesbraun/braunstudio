import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Deployment state enum values
const deploymentState = v.union(
  v.literal("draft"),
  v.literal("preview"),
  v.literal("live")
);

// Media type enum values
const mediaType = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("audio")
);

// Per-wedding feature flags
const featureFlags = v.object({
  rsvp: v.boolean(),
  gifts: v.boolean(),
  whatsapp: v.boolean(),
});

// Media metadata
const mediaMetadata = v.object({
  alt: v.optional(v.string()),
  caption: v.optional(v.string()),
  durationSeconds: v.optional(v.number()),
});

// RSVP config structures (multiple-choice only)
const rsvpOption = v.object({
  id: v.string(),
  order: v.number(),
  label: v.string(),
});

const rsvpQuestion = v.object({
  id: v.string(),
  order: v.number(),
  prompt: v.string(),
  options: v.array(rsvpOption),
});

const rsvpAnswer = v.object({
  questionId: v.string(),
  optionId: v.string(),
});

// Platform user role
const platformRole = v.union(
  v.literal("platform_admin"),
  v.literal("user")
);

const schema = defineSchema({
  ...authTables,

  // Override users table to add role field for platform admins
  users: defineTable({
    // Standard auth fields
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom field for platform role
    role: v.optional(platformRole),
  }).index("email", ["email"]),

  // ─────────────────────────────────────────────────────────────────────────
  // WEDDINGS
  // ─────────────────────────────────────────────────────────────────────────
  weddings: defineTable({
    name: v.string(),
    slug: v.string(), // unique, immutable after live

    // Design implementation
    designId: v.string(),

    // Feature flags
    features: featureFlags,

    // Deployment tracking (state only)
    deployment: v.object({
      state: deploymentState,
      deployedAt: v.optional(v.number()),
      deployedBy: v.optional(v.id("users")),
    }),

    // Stripe
    stripe: v.object({
      connectAccountId: v.optional(v.string()),
      connected: v.boolean(),
    }),

    // Payment status for platform invoice
    paymentStatus: v.union(
      v.literal("unpaid"),
      v.literal("paid"),
      v.literal("na") // not applicable (e.g. comped)
    ),

    // Couple emails for pre-assign access (before they log in)
    coupleEmails: v.array(v.string()),

    // Navbar logos (optional per-wedding branding)
    navbarLogoLightStorageId: v.optional(v.string()),
    navbarLogoDarkStorageId: v.optional(v.string()),

    // Hero image (optional background for hero section)
    heroImageStorageId: v.optional(v.string()),

    // Wedding date (date-only string in yyyy-MM-dd format)
    weddingDate: v.optional(v.string()),

    // Venue metadata (for hero section overlays)
    venueName: v.optional(v.string()),
    venueLocation: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_slug", ["slug"]),

  // ─────────────────────────────────────────────────────────────────────────
  // MEDIA LIBRARY
  // ─────────────────────────────────────────────────────────────────────────
  mediaItems: defineTable({
    weddingId: v.id("weddings"),
    storageId: v.string(),
    mediaType: mediaType,
    order: v.number(),
    tags: v.array(v.string()),
    metadata: mediaMetadata,
    createdAt: v.number(),
  })
    .index("by_wedding", ["weddingId"])
    .index("by_wedding_order", ["weddingId", "order"]),

  // ─────────────────────────────────────────────────────────────────────────
  // RSVP CONFIGS & SUBMISSIONS
  // ─────────────────────────────────────────────────────────────────────────
  rsvpConfigs: defineTable({
    weddingId: v.id("weddings"),
    questions: v.array(rsvpQuestion),
    updatedAt: v.number(),
  }).index("by_wedding", ["weddingId"]),

  rsvpSubmissions: defineTable({
    weddingId: v.id("weddings"),
    guestId: v.id("guests"),
    answers: v.array(rsvpAnswer),
    createdAt: v.number(),
  })
    .index("by_wedding", ["weddingId"])
    .index("by_wedding_guest", ["weddingId", "guestId"]),

  // ─────────────────────────────────────────────────────────────────────────
  // GIFT OPTIONS
  // ─────────────────────────────────────────────────────────────────────────
  giftOptions: defineTable({
    weddingId: v.id("weddings"),
    label: v.string(),
    amountCents: v.number(),
    order: v.number(),
    active: v.boolean(),
  })
    .index("by_wedding", ["weddingId"])
    .index("by_wedding_order", ["weddingId", "order"]),

  // ─────────────────────────────────────────────────────────────────────────
  // WEDDING MEMBERS (post-login linking)
  // ─────────────────────────────────────────────────────────────────────────
  weddingMembers: defineTable({
    weddingId: v.id("weddings"),
    userId: v.id("users"), // Convex Auth user
    role: v.union(v.literal("couple"), v.literal("admin")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_wedding", ["weddingId"])
    .index("by_user_wedding", ["userId", "weddingId"]),

  // ─────────────────────────────────────────────────────────────────────────
  // GUESTS
  // ─────────────────────────────────────────────────────────────────────────
  guests: defineTable({
    weddingId: v.id("weddings"),
    name: v.string(),
    phone: v.string(),
    rsvpStatus: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("declined")
    ),
    whatsappConsent: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_wedding", ["weddingId"])
    .index("by_phone", ["phone"])
    .index("by_wedding_phone", ["weddingId", "phone"]),

  // ─────────────────────────────────────────────────────────────────────────
  // OTP CHALLENGES (for guest auth)
  // ─────────────────────────────────────────────────────────────────────────
  otpChallenges: defineTable({
    phone: v.string(),
    weddingId: v.id("weddings"),
    code: v.string(),
    expiresAt: v.number(),
    verified: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_phone_wedding", ["phone", "weddingId"])
    .index("by_expires", ["expiresAt"]),

  // ─────────────────────────────────────────────────────────────────────────
  // GIFT PAYMENTS
  // ─────────────────────────────────────────────────────────────────────────
  giftPayments: defineTable({
    weddingId: v.id("weddings"),
    guestId: v.id("guests"),
    giftOptionId: v.optional(v.id("giftOptions")),
    amountCents: v.number(),
    stripePaymentIntentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_wedding", ["weddingId"])
    .index("by_guest", ["guestId"]),

  // ─────────────────────────────────────────────────────────────────────────
  // STRIPE INVOICES (platform services)
  // ─────────────────────────────────────────────────────────────────────────
  stripeInvoices: defineTable({
    weddingId: v.id("weddings"),
    stripeInvoiceId: v.string(),
    amountCents: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("paid"),
      v.literal("void")
    ),
    createdAt: v.number(),
  })
    .index("by_wedding", ["weddingId"])
    .index("by_stripe_id", ["stripeInvoiceId"]),

  // ─────────────────────────────────────────────────────────────────────────
  // WHATSAPP MESSAGES
  // ─────────────────────────────────────────────────────────────────────────
  whatsappMessages: defineTable({
    weddingId: v.id("weddings"),
    guestId: v.id("guests"),
    twilioMessageSid: v.string(),
    templateName: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_wedding", ["weddingId"])
    .index("by_guest", ["guestId"]),
});

export default schema;

import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Wedding status enum values
const weddingStatus = v.union(
  v.literal("draft"),
  v.literal("pending_payment"),
  v.literal("live")
);

// Stripe gift mode enum
const stripeGiftMode = v.union(v.literal("wishlist"), v.literal("gifts"));

// Theme color values (shadcn CSS variable overrides)
const themeColors = v.object({
  background: v.optional(v.string()),
  foreground: v.optional(v.string()),
  card: v.optional(v.string()),
  cardForeground: v.optional(v.string()),
  popover: v.optional(v.string()),
  popoverForeground: v.optional(v.string()),
  primary: v.optional(v.string()),
  primaryForeground: v.optional(v.string()),
  secondary: v.optional(v.string()),
  secondaryForeground: v.optional(v.string()),
  muted: v.optional(v.string()),
  mutedForeground: v.optional(v.string()),
  accent: v.optional(v.string()),
  accentForeground: v.optional(v.string()),
  destructive: v.optional(v.string()),
  border: v.optional(v.string()),
  input: v.optional(v.string()),
  ring: v.optional(v.string()),
});

// Section content is a flexible object per section type
const sectionContent = v.record(v.string(), v.any());

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
    status: weddingStatus,

    // Template binding
    templateId: v.string(),
    templateVersion: v.string(),

    // Sections
    enabledSections: v.array(v.string()), // e.g. ["hero", "itinerary", "photos", ...]
    sectionContent: sectionContent, // { hero: {...}, itinerary: {...}, ... }

    // Theme (per-wedding overrides)
    theme: v.object({
      light: themeColors,
      dark: themeColors,
    }),

    // Stripe
    stripe: v.object({
      mode: stripeGiftMode,
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

    // Navbar logos (optional per-wedding branding, theme-specific)
    navbarLogoLightStorageId: v.optional(v.string()),
    navbarLogoDarkStorageId: v.optional(v.string()),

    // Wedding date (date-only string in yyyy-MM-dd format)
    weddingDate: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

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

---
name: rules
description: This is a new rule
---

# Overview

## Project Context

This project is a multi-tenant wedding web platform built with Next.js, Convex, Stripe, and shadcn/ui.
It is a long-lived production system. All architectural decisions are intentional and must be respected.

Cursor must follow the rules below at all times.

---

## Tech Stack (Non-Negotiable)

- Framework: Next.js (App Router only)
- Backend: Convex (database, business logic, auth)
- Auth:
    - Convex Auth with Google OAuth for admins and couples
    - Custom OTP via Convex for guests

- Payments:
    - Stripe
    - Stripe Connect Standard for gift payments

- UI:
    - shadcn/ui ONLY
    - Tailwind CSS
    - TypeScript

- Theming:
    - next-themes (already installed)
    - Light and dark mode required everywhere

- Hosting: Vercel
- Package manager: npm

Do not introduce alternative frameworks, auth systems, ORMs, UI kits, or state managers unless explicitly instructed.

---

## Application Structure Rules

- Single Next.js app (monorepo)
- Routes:
    - `/` → public landing page
    - `/app/admin/*` → platform admin dashboard
    - `/app/couple/*` → couple dashboard
    - `/preview/[slug]` → wedding preview
    - `{slug}.braunstud.io` → public wedding pages

- Use middleware for subdomain routing
- No separate backend server
- No Next.js API routes for auth or business logic

---

## Data & Backend Rules (Convex)

- All data access must go through Convex
- No direct database access from Next.js
- Business logic lives in Convex mutations and queries
- Guest OTP authentication must be implemented fully in Convex
- Stripe webhooks handled via Convex where possible

---

## Authentication Rules

Admins & Couples:

- Google OAuth only (Convex Auth)
- No email/password
- No signup forms
- Admin access restricted by email domain allowlist

Guests:

- Phone number + OTP
- OTP sent via Twilio
- Guest must exist in wedding guest list
- Session scoped to wedding + guest

---

## Authorization Rules

Platform Admin:

- Full access

Couple:

- Limited to their own wedding
- Can manage guests
- Can view RSVPs and payments
- Can connect Stripe
- Cannot edit wedding page content
- Cannot enable WhatsApp
- Cannot publish wedding

Guest:

- Can RSVP and pay for gifts only after OTP auth

Authorization checks must exist in Convex, not only in UI.

---

## Wedding Entity Rules

- `slug` is the canonical identifier
- Used for:
    - Subdomain
    - Preview URL
    - Routing

- Slug must be unique
- Slug is immutable once wedding is live

Wedding lifecycle:

- `draft`
- `pending_payment`
- `live`

---

## Template System Rules (Critical)

- Templates are React components in code
- No CMS layouts
- No HTML injection
- No per-wedding React code
- No dynamic layout editing
- Templates define layout only
- Content always comes from data

Folder structure:

```
/templates/{templateId}/{version}/Template.tsx
```

- Template versions are immutable once released
- Weddings reference:
    - `templateId`
    - `templateVersion`

- Existing weddings stay pinned to their version

---

## Mandatory Template Sections

Every template MUST support these sections (conditionally rendered):

- Hero CTA
- Itinerary
- Photos
- Location
- Lodging
- Dress Code
- Gifts
- RSVP

Templates define order and layout.
Admins control content and enable/disable sections.

---

## UI & Component Rules

- Use shadcn/ui components only
- Do not create custom UI components if shadcn provides one
- All styling via Tailwind
- No inline styles
- No CSS-in-JS libraries

---

## Theme Rules

- Use `next-themes`
- Support light and dark mode
- Admin dashboard:
    - Theme toggle

- Wedding pages:
    - Theme toggle
    - Theme configurable per wedding

- Respect system theme where applicable

---

## Payments Rules

Platform Services:

- No public checkout
- Payments only via Stripe invoices
- Admin-controlled invoicing

Gift Payments:

- Stripe Connect Standard
- Each couple connects their own Stripe account
- Funds go directly to couple
- Platform never holds funds

---

## WhatsApp Messaging Rules

- Implemented via Twilio WhatsApp Business API
- Messages can only be sent by platform admins
- Couples cannot send messages
- Feature optional per wedding
- Guest consent required

---

## Preview Mode Rules

- Preview URL: `/preview/[slug]`
- Uses same renderer as production
- RSVP disabled
- Payments disabled
- No indexing
- Visual preview indicator

---

## Deployment Rules

- Vercel deployment only
- Wildcard subdomain support
- Environment-aware config
- No hardcoded domains outside config

---

## Explicit Non-Goals

Do NOT implement:

- Drag-and-drop builders
- CMS-driven layouts
- Public signups
- Per-wedding React code
- Couples editing page content
- Self-service platform payments

---

## Code Quality Expectations

- Strong TypeScript typing
- Clear separation of concerns
- Predictable folder structure
- Minimal abstraction
- Favor explicitness over cleverness

---

## Cursor Behavior Rules

- Ask for clarification only if required
- Do not make architectural changes without instruction
- Follow these rules even if alternatives seem easier
- Optimize for maintainability and scalability

---

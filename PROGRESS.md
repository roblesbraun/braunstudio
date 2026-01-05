# Wedding Web Platform – Progress Tracker

> **Current focus: Priorities 1–3** (Convex schema, Template system, Subdomain routing)

---

## Priority 1: Convex Schema
- [x] `convex/schema.ts` with `authTables`
- [x] `weddings` table with slug index
- [x] `weddingMembers` table (userId + weddingId mapping)
- [x] `guests` table (per-wedding)
- [x] Placeholder tables: `otpChallenges`, `giftPayments`, `stripeInvoices`, `whatsappMessages`

## Priority 2: Template System + Registry
- [x] `templates/types.ts` with `WeddingTemplateProps` contract
- [x] `templates/registry.ts` with lazy-loading template loader
- [x] `templates/classic/v1/Template.tsx` (first immutable template)
- [x] Template version immutability enforced by folder structure

## Priority 3: Subdomain Routing
- [x] `middleware.ts` with `convexAuthNextjsMiddleware`
- [x] Host parsing: `app.braunstud.io` vs `{slug}.braunstud.io` vs root
- [x] Rewrite `{slug}.braunstud.io/*` → `/w/[slug]`
- [x] Protect `/app/admin/*` and `/app/couple/*` routes

## Priority 3.5: Auth + Providers (added during implementation)
- [x] `app/layout.tsx` with `ConvexAuthNextjsServerProvider`
- [x] `app/ConvexClientProvider.tsx` with `ConvexAuthNextjsProvider`
- [x] `components/theme-provider.tsx` with `next-themes`
- [x] `app/login/page.tsx` with Google OAuth
- [x] `convex/auth.ts` with Google provider

## Priority 3.6: Wedding Renderer
- [x] `components/wedding/WeddingRenderer.tsx` (shared renderer)
- [x] `components/wedding/WeddingThemeWrapper.tsx` (per-wedding CSS vars)
- [x] `components/wedding/PreviewBanner.tsx`
- [x] `app/w/[slug]/page.tsx` (subdomain target)
- [x] `app/preview/[slug]/page.tsx` (preview with noindex)

## Priority 3.7: Dashboard Skeleton
- [x] `app/app/layout.tsx` (protected area layout)
- [x] `components/dashboard/DashboardShell.tsx`
- [x] `components/dashboard/DashboardHeader.tsx`
- [x] `components/dashboard/AdminSidebar.tsx`
- [x] `components/dashboard/CoupleSidebar.tsx`
- [x] `components/theme-toggle.tsx`
- [x] `app/app/admin/page.tsx` (admin dashboard)
- [x] `app/app/couple/page.tsx` (couple dashboard)

## Priority 3.8: Convex Functions
- [x] `convex/weddings.ts` (CRUD + status transitions)
- [x] `convex/memberships.ts` (email pre-assign + post-login linking)
- [x] `convex/guests.ts` (guest list management)
- [x] `convex/users.ts` (viewer query)

---

## Priority 4: Admin Dashboard (full)
- [ ] Wedding list view with filtering/search
- [ ] Wedding create/edit forms
- [ ] Template + version assignment UI
- [ ] Section content editing
- [ ] Theme color editing
- [ ] Guest management (manual + CSV upload)
- [ ] Stripe Connect status view
- [ ] WhatsApp message sending
- [ ] Invoice creation

## Priority 5: Couple Dashboard (full)
- [ ] RSVP list view
- [ ] Gift payments view
- [ ] Guest upload (manual + CSV)
- [ ] Stripe Connect onboarding
- [ ] Preview link display
- [ ] Wedding status display

## Priority 6: Theme System
- [x] Per-wedding light/dark CSS variable overrides (basic)
- [x] `ThemeProvider` (next-themes) integration
- [x] Wedding page scoped theme wrapper
- [ ] Admin theme color picker UI

## Priority 7: Guest OTP Auth
- [ ] `convex/otpAuth.ts` – OTP generation + verification
- [ ] Twilio SMS integration for OTP delivery
- [ ] Guest session scoped to wedding + guest
- [ ] Phone number validation against guest list

## Priority 8: RSVP Flow
- [ ] RSVP form component
- [ ] `convex/rsvp.ts` – submit/update RSVP
- [ ] RSVP status display for guests
- [ ] Admin/couple RSVP list view

## Priority 9: Stripe Connect Gifts
- [ ] Stripe Connect Standard onboarding flow
- [ ] Gift payment form (full/partial amounts)
- [ ] `convex/gifts.ts` – payment intent creation
- [ ] Payment status tracking
- [ ] Couple gift payments dashboard

## Priority 10: Invoicing
- [ ] Admin invoice creation UI
- [ ] Stripe invoice generation
- [ ] Invoice payment tracking
- [ ] Wedding status transition on payment

## Priority 11: WhatsApp Integration
- [ ] Twilio WhatsApp Business API setup
- [ ] Admin message composer
- [ ] Guest consent tracking
- [ ] Message templates for invitations/reminders

## Priority 12: Landing Page
- [ ] `/` public marketing page
- [ ] Services overview
- [ ] Contact form
- [ ] Responsive design

---

## Legend
- [ ] Pending
- [~] In progress
- [x] Done

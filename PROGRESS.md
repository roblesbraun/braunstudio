# Progress

This repository has been reset to a **shared backend + custom design implementations** architecture.

## ✅ Implemented (Post-Reset)

- Convex schema reset for `designId`, feature flags, deployment state, RSVP configs, gifts, and media library
- Custom design registry at `/designs/{designId}/Design.tsx`
- Admin dashboard tabs for design selection, feature flags, RSVP config, gifts, media, and deployment
- Media library with tags, ordering, and metadata
- RSVP multiple-choice configuration stored in Convex
- Gift options managed in Convex
- WhatsApp message entry points in Convex (admin-only)

## Next Up

- Stripe payment intent creation
- WhatsApp delivery integration (Twilio)

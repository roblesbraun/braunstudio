# Braun Studio - Wedding Website Platform

A multi-tenant wedding website SaaS platform built with Next.js, Convex, and Tailwind CSS.

## Architecture

- **Marketing Site**: `braunstud.io` - Single-page landing with contact form
- **Platform App**: `app.braunstud.io` - Admin & couple dashboards
- **Wedding Sites**: `{slug}.braunstud.io` - Public wedding pages (active status only)
- **Preview Links**: `braunstud.io/preview/{token}` - Preview wedding sites before launch

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database/Backend**: Convex
- **Auth**: Convex Auth (admins/couples), Custom OTP (guests)
- **UI**: shadcn/ui + Tailwind CSS
- **Payments**: Stripe (Invoices + Connect Standard)
- **Messaging**: Twilio (WhatsApp only)

## Getting Started

### Prerequisites

- Node.js 18+
- Convex account
- Stripe account (optional, for payments)
- Twilio account (optional, for WhatsApp messaging)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Domain
ROOT_DOMAIN=braunstud.io
NEXT_PUBLIC_APP_URL=https://app.braunstud.io

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Twilio WhatsApp (optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Also set in Convex dashboard environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`

### Development

```bash
# Start Next.js dev server
npm run dev

# Start Convex dev server (separate terminal)
npm run convex:dev
```

### Local Subdomain Testing

The middleware supports subdomain simulation via query params:

- `http://localhost:3000` - Marketing site
- `http://localhost:3000?subdomain=app` - Platform app
- `http://localhost:3000?subdomain=john-jane` - Wedding site

## Project Structure

```
├── app/
│   ├── (marketing)/      # Marketing site routes
│   ├── app/              # Platform app routes (admin/couple)
│   ├── preview/          # Preview page routes
│   └── w/[slug]/         # Wedding site routes
├── components/
│   ├── auth/             # Auth components
│   ├── ui/               # shadcn/ui components
│   └── wedding/          # Wedding renderer
├── convex/
│   ├── lib/              # Shared utilities
│   ├── schema.ts         # Database schema
│   ├── auth.ts           # Convex Auth config
│   ├── http.ts           # HTTP endpoints
│   └── *.ts              # Convex functions
├── lib/                  # Frontend utilities
└── templates/            # Wedding page templates
    ├── classic/v1/
    ├── modern/v1/
    └── registry.ts
```

## User Roles

- **Platform Admin**: Full access - manage weddings, users, leads, templates
- **Couple**: Manage guests, view RSVPs/gifts, connect Stripe (no content editing)
- **Guest**: OTP-authenticated per wedding for RSVP and gifts

## Wedding Lifecycle

| Status          | Preview | Public |
| --------------- | ------- | ------ |
| draft           | ✅      | ❌     |
| pending_payment | ✅      | ❌     |
| active          | ❌      | ✅     |
| paused          | ✅      | ❌     |

Only platform admins can change wedding status.

## Templates

Templates are code-based and versioned. Each template receives the same props:

```tsx
<WeddingTemplate
  wedding={wedding}
  renderMode="public" | "preview"
/>
```

Available templates:

- `classic/v1` - Traditional elegant design
- `modern/v1` - Contemporary minimal design

Admins can customize color palettes per wedding using shadcn-style CSS variables.

## API Endpoints (Convex HTTP)

- `POST /guest/otp/request` - Request OTP for guest auth
- `POST /guest/otp/verify` - Verify OTP and get session
- `POST /guest/session` - Validate session
- `POST /guest/logout` - Invalidate session
- `POST /stripe/webhook` - Stripe webhook handler

## Deployment

Deploy to Vercel with wildcard subdomain support:

1. Add `*.braunstud.io` and `braunstud.io` to domains
2. Configure environment variables
3. Deploy Convex functions: `npm run convex:deploy`

## License

Private - All rights reserved.

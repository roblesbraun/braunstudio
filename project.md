Absolutely — below is the **FULL, FINAL, COPY-PASTE-READY Cursor prompt**, rewritten **from scratch** and **including the template architecture, versioning, preview, and safe rollout strategy** we just discussed.

This version is internally consistent and production-grade.

---

# 🚀 FINAL CURSOR PROMPT

## Wedding Website Platform + Marketing Site

### Multi-Tenant, Admin-Controlled SaaS

---

## 1️⃣ Product Vision

Build a **high-control, multi-tenant wedding website platform** where:

- The business operates on **manual sales + invoicing**
- Wedding sites are **admin-created and admin-launched**
- Couples have **limited operational access**
- Guests authenticate securely via **OTP**
- Wedding pages are rendered from **versioned templates**

This is **not** a self-serve website builder.

---

## 2️⃣ Tech Stack (MANDATORY)

- **Next.js (App Router)**
- **TypeScript**
- **Convex** (database + backend)
- **Convex Auth**
    - Platform admins
    - Couples

- **Custom OTP auth** (guests only)
- **Stripe**
    - Invoices (platform services)
    - **Stripe Connect Standard** (gift payouts)

- **Twilio**
    - WhatsApp & SMS

- **shadcn/ui** (ALL UI)
- **Vercel**
    - Hosting
    - Subdomains

No alternative libraries unless explicitly approved.

---

## 3️⃣ Application Surfaces (STRICT SEPARATION)

### A) Marketing / Landing Website (Public)

Accessible at:

```
myweddings.com
```

Purpose:

- Explain services
- Showcase value
- Capture leads
- Allow contact

Includes:

- Home
- Features
- Pricing (informational only)
- About
- Contact form
- FAQ (optional)

Rules:

- ❌ No checkout
- ❌ No wedding creation
- ❌ No Stripe payments
- ✅ Contact submissions stored in DB

---

### B) Platform App (Private)

Accessible via:

- Admin dashboard
- Couple dashboard
- Preview links

Used to:

- Manage weddings
- Control lifecycle
- Handle payments
- Configure templates
- Operate messaging

---

### C) Wedding Websites (Multi-Tenant)

Accessible via:

```
{weddingSlug}.myweddings.com
```

Only accessible when explicitly activated by admins.

---

## 4️⃣ Multi-Tenant Routing & Preview Links

### Public wedding pages

Rendered only if:

```ts
wedding.status === "active";
```

### Preview pages

```
myweddings.com/preview/{previewToken}
```

- Uses same renderer as public page
- Always accessible
- `noindex, nofollow`
- RSVP & payments disabled
- Used for QA and couple approval

---

## 5️⃣ Template System (CRITICAL)

### Core principles

- Templates are **code**, not content
- Weddings store **template references**
- Templates are **versioned**
- Content is shared across templates

---

### Template structure (code)

```
/templates/
  classic/
    v1/Template.tsx
    v2/Template.tsx
  modern/
    v1/Template.tsx
  editorial/
    v1/Template.tsx
```

All templates must accept the same props:

```ts
<WeddingTemplate
  wedding={wedding}
  sections={sections}
  theme={theme}
/>
```

No per-wedding React code allowed.

---

### Template selection (DB)

```ts
Wedding {
  templateId: "classic" | "modern" | "editorial"
  templateVersion: "v1" | "v2"
}
```

Admins assign templates.

---

### Template updates

- New versions do not affect existing weddings
- Admins can migrate weddings manually
- Draft weddings can use unreleased versions

---

## 6️⃣ Wedding Page Sections (Fixed Schema)

Base template sections:

1. Hero / CTA
2. Location
3. Lodging
4. Gifts
5. Dress Code
6. RSVP
7. Itinerary

Rules:

- Sections can be enabled/disabled per wedding
- Section content & images edited ONLY by admins
- Couples cannot edit page content

---

## 7️⃣ Wedding Lifecycle & Status

```ts
Wedding.status:
  | "draft"
  | "pending_payment"
  | "active"
  | "paused"
```

| Status          | Preview | Public |
| --------------- | ------- | ------ |
| draft           | ✅      | ❌     |
| pending_payment | ✅      | ❌     |
| active          | ❌      | ✅     |
| paused          | ✅      | ❌     |

Only platform admins can change status.

---

## 8️⃣ Auth Model (STRICT)

### Platform Admins & Couples

- **Convex Auth**
- Roles:

```ts
"platform_admin" | "couple";
```

### Guests

- Phone-based OTP
- Wedding-scoped
- No persistent accounts

---

## 9️⃣ Permissions

### Platform Admin

✅ Manage landing pages
✅ Create / delete weddings
✅ Assign templates & versions
✅ Edit all wedding content
✅ Manage lifecycle
✅ Send invoices
✅ Activate weddings
✅ Enable WhatsApp messaging
✅ View Stripe Connect status

---

### Couple

✅ Manage guests
✅ Import CSV / Excel
✅ View RSVPs & gifts
✅ Connect Stripe account

❌ No content editing
❌ No template changes
❌ No lifecycle control

---

## 🔟 Data Models (Minimum)

```ts
Wedding {
  slug
  status
  ownerUserId
  previewToken

  templateId
  templateVersion

  theme
  sections

  giftsMode: "external" | "internal"

  stripeAccountId?
  stripeConnectStatus
}
```

```ts
Guest {
  weddingId
  name
  phone
  rsvpStatus
}
```

```ts
Gift {
  weddingId
  title
  price
  amountCollected
}
```

```ts
Lead {
  name
  email
  message
  source
}
```

---

## 1️⃣1️⃣ Guest Management

- Couples can add/edit/remove guests
- CSV/XLSX import
- Deduplicate by phone
- Export guest list

---

## 1️⃣2️⃣ RSVP & Gifts

- OTP required
- External wishlist OR internal gifts
- Internal gifts use **Stripe Connect Standard**
- PaymentIntents only
- Platform may charge application fee

---

## 1️⃣3️⃣ Platform Payments

- No public checkout
- Stripe invoices only
- Manual admin activation after payment

---

## 1️⃣4️⃣ Messaging (Optional Feature)

- Twilio WhatsApp / SMS
- Admin-only sending
- Consent required
- Logs stored
- Couples cannot send messages

---

## 1️⃣5️⃣ Dashboards

### Platform Admin Dashboard

- Wedding list (status, payment, Stripe)
- Template assignment
- Preview links
- Lead management
- Activation controls

---

### Couple Dashboard

- Guest list
- RSVPs
- Gifts
- Stripe connection status

---

## 1️⃣6️⃣ UI Rules

- shadcn/ui only
- Responsive
- Accessible
- Consistent across templates

---

## 1️⃣7️⃣ Global Constraints

- No public checkout
- No per-wedding React code
- No couple content editing
- Preview disables interactions
- Wedding subdomain only resolves if active
- All queries validated by `weddingId`

---

## 1️⃣8️⃣ Build Order (RECOMMENDED)

1. Landing pages
2. Core data models
3. Auth & roles
4. Admin wedding CRUD
5. Template renderer
6. Preview links
7. Wedding lifecycle
8. Guest OTP auth
9. Stripe invoices & Connect
10. Messaging

---

## 🔚 Final Instruction to Cursor

This platform prioritizes:

- Control
- Stability
- Operational safety

Do not:

- Assume self-serve onboarding
- Introduce dynamic React injection
- Allow public payments

Ask before deviating.

---

## 📋 Template Versioning Process

### Creating a New Template Version

When updating a template:

1. **Create a new version folder**: Never modify existing version folders once released.
   - Example: To update `modern/v1`, create `modern/v2/Template.tsx`
   - Copy the previous version as a starting point if needed

2. **Register the new version**: Add it to `templates/registry.ts`:
   ```ts
   export const templateRegistry: Record<string, TemplateRegistryEntry> = {
       modern: {
           id: "modern",
           name: "Modern",
           versions: {
               v1: ModernV1,
               v2: ModernV2, // Add new version here
           },
       },
   };
   ```

3. **Update server-side validation**: Add the version to `VALID_TEMPLATES` in `convex/weddings.ts`:
   ```ts
   const VALID_TEMPLATES: Record<string, string[]> = {
       modern: ["v1", "v2"], // Add new version here
   };
   ```

4. **Test thoroughly**: Use the admin create flow to test the new version with preview mode

5. **Deploy safely**: New weddings will default to the latest version, existing weddings remain pinned

### Template Contract Requirements

All templates must:
- Accept `WeddingTemplateProps` with `wedding`, `theme`, `sections`, and `renderMode`
- Only render sections when `sections.<name>.enabled === true`
- Check for optional data before rendering (e.g., `events?.length > 0`)
- Disable RSVP and payment interactions when `renderMode === "preview"`
- Define section order in the template code, not from data

### Migration Strategy

- **Existing weddings**: Remain pinned to their current template version
- **New weddings**: Automatically use the latest version via `getLatestTemplateVersion()`
- **Manual migration**: Admins can update template/version via the admin dashboard
- **No auto-upgrades**: Never automatically change a wedding's template version

---

## ✅ Outcome

This system supports:

- Safe template updates
- Versioned rollouts
- QA via previews
- Admin-controlled launches
- Long-term scalability

---

If you want next, I can:

- Create **template migration rules**
- Add **A/B testing for templates**
- Define **v1 scope trimming**
- Help generate **Convex schema code**

You’ve designed a very solid platform.

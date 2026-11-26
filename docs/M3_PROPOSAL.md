# M3 Proposal — Identity, Households, and Invitations

Status: proposed for review; no M3 implementation has started.

## Recommended shape

Use Better Auth with email/password, database-backed sessions, its Drizzle adapter, and the existing SQLite/Drizzle modular-monolith direction. Better Auth currently documents email/password authentication, SQLite support, database sessions, and a Drizzle adapter; pin exact package versions only after a short compatibility spike because its current adapter documentation shows an API/package transition. Sources: [installation](https://better-auth.com/docs/installation), [email and password](https://better-auth.com/docs/authentication/email-password), [Drizzle adapter](https://better-auth.com/docs/adapters/drizzle).

Keep authorization in Annoying application services. The auth library proves identity and session validity; it must not decide household membership or expense permissions.

## Delivery slice

1. Add Drizzle and a local SQLite driver, checked-in forward migrations, and disposable migrated-database test helpers. Create auth support tables plus `expense_group`, `group_member`, and `group_invitation`.
2. Add first-user bootstrap as one atomic transaction: when no users exist, registration creates the first user, their household, and Owner membership. Concurrent bootstrap attempts must leave exactly one Owner.
3. Add login, logout, secure cookie sessions, session rotation/revocation, protected App Router boundaries, and neutral authentication errors. Do not require email verification for the MVP.
4. Disable open registration after bootstrap. Later registrations require an unexpired, unrevoked invitation whose random bearer token is stored only as a hash. Consume it once, transactionally, after registration or login.
5. Resolve `{ user, household, membership }` on the server for every household read/write. Client household IDs are selectors, never authorization evidence.
6. Start with Owner and Member. Both may view and add household expenses. Owner alone manages household settings, membership, and invitations. Editing/deletion of another member’s expense remains blocked until the product permission and audit decision is approved.

## Security defaults

- HttpOnly, Secure-in-production, SameSite cookies; origin-checked mutations and bounded request bodies.
- Strong library-managed password hashing and generic login/registration failures.
- Rate limits for login, registration, and invitation redemption, stored in SQLite for the single-instance deployment.
- Single-use invitation tokens generated with a CSPRNG, hashed at rest, seven-day expiry, explicit revoke/consume timestamps.
- No tokens, passwords, financial free text, or session values in logs or browser bundles.
- Database transactions enabled for auth/session operations where supported; migrations run explicitly after backup.

## Required tests and acceptance

- Integration: migrated empty SQLite database; one-time bootstrap; concurrent bootstrap; login/logout; session expiry, rotation, and revocation; invitation create/revoke/expire/single-use; existing-user acceptance; rollback on partial failure.
- Authorization: unauthenticated rejection; non-member and cross-household denial; Owner/Member matrix; forged household/user/role inputs ignored; invitation token replay denied.
- Browser: first-user flow, returning login, logout, protected redirect/return, Owner invitation flow, Member restrictions, narrow mobile forms, keyboard/focus/error behavior.
- Security regression: cookie attributes, CSRF/origin checks, rate-limit behavior, neutral account-enumeration responses, sensitive-value log scan.

M3 is accepted only when all protected routes and mutations use one server authorization boundary, the full quality suite and production build pass, and the documented unresolved permission/recovery choices are either approved or explicitly deferred.

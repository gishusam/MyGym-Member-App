# MyGym Member App

A native fitness membership companion for MyGym members to manage their club experience and training progress.

## Run & Operate

- `pnpm --filter @workspace/mygym-mobile run dev` — run the Expo mobile app
- `pnpm --filter @workspace/mygym-mobile run typecheck` — typecheck the mobile app
- `pnpm --filter @workspace/mygym-mobile run build` — build the app bundle
- Copy `artifacts/mygym-mobile/.env.example` to the app's local environment and set the two public Expo variables there.
- The member app uses the existing MyGym Fitness KE FastAPI deployment. Apply schema changes from that repository with its Alembic migration workflow; do not create a second member database.

## Stack

- Expo SDK 58, React Native, Expo Router, TypeScript
- Authentication: Clerk Expo with Expo SecureStore token persistence
- Server state: TanStack Query
- Member data: authenticated REST calls to the existing FastAPI API and PostgreSQL database
- No member-owned database, Express API, or client-authoritative workout/event state is used for the core member flows.

## Where things live

- `artifacts/mygym-mobile/app/(tabs)/` — member Home, Events, Workouts, Profile, and Progress screens
- `artifacts/mygym-mobile/app/member-qr.tsx` — member QR display
- `artifacts/mygym-mobile/components/MemberAuthScreen.tsx` — Clerk sign-in and sign-up
- `artifacts/mygym-mobile/lib/member-api.ts` — FastAPI member API types and authenticated requests
- `artifacts/mygym-mobile/lib/useMemberApi.ts` — Clerk token accessor for API calls
- `artifacts/mygym-mobile/.env.example` — public app configuration names

## Architecture decisions

- Keep the platform single-gym; do not add `gym_id` tenancy or copy the business database into the mobile repository.
- A Clerk sign-in is linked to a staff-created member record only when the sign-in email is verified and uniquely matches that record. Subsequent requests use the stored Clerk subject.
- Member-facing API routes derive the member from the verified session, never from a client-supplied member ID.
- Workout assignment and session history, event registrations, membership details, check-in counts, and fitness assessments are read from or saved to the existing backend.
- The member QR screen displays the existing member token; it does not claim a check-in succeeded. A staff-operated check-in remains authoritative.

## Product

The app is for gym members, not staff. The existing visual design and navigation are retained while workouts, events, member profile, QR token, and progress use the authenticated MyGym backend. Core workout logs and event registrations persist server-side; member progress displays recorded assessments and real monthly activity rather than generated demo trends.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and `EXPO_PUBLIC_API_BASE_URL` are public client configuration; the API URL must end in `/api`.
- The backend needs its existing `CLERK_SECRET_KEY` to verify the email during first-time member linking. Configure `CLERK_AUTHORIZED_PARTIES` on the backend for the Clerk native session's authorized party (`azp`); use the exact value for the configured Clerk instance.
- Clerk must allow native sign-in and email verification. A member's verified sign-in email must match the email on the staff-created member record.
- Apply the backend's Alembic migration before using persisted workout sessions or the member link.
- Do not add payment flows, self check-in, or unverified workout/progress fixtures as if they were live features.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

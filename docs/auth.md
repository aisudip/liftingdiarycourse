# Auth Coding Standards

## Authentication Provider

**This app uses [Clerk](https://clerk.com) exclusively for authentication.**

- Do NOT implement custom authentication.
- Do NOT use other auth libraries (e.g., NextAuth, Auth.js, Lucia, etc.).
- All auth functionality (sign in, sign up, session management, user identity) must go through Clerk.

## Installation & Setup

Clerk is configured via environment variables. These must be present in `.env`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

Clerk middleware must be set up in `proxy.ts` at /src to protect routes:

```ts
// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

## Getting the Authenticated User

### Server Components & Server Actions

Use `auth()` from `@clerk/nextjs/server` to get the current user's ID server-side:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- Always use `auth()` on the server — never trust user-supplied IDs from request params or the request body.
- If `userId` is `null`, the user is unauthenticated. Handle this explicitly (redirect or throw).

### Client Components

Use the `useAuth` or `useUser` hooks from `@clerk/nextjs` only when you need auth state on the client:

```tsx
import { useUser } from "@clerk/nextjs";

const { user } = useUser();
```

- Prefer server-side auth over client-side auth wherever possible.

## UI Components

Use Clerk's pre-built components for auth UI. Do not build custom sign-in/sign-up forms.

```tsx
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";
```

| Component | Purpose |
|---|---|
| `<SignIn />` | Sign-in page |
| `<SignUp />` | Sign-up page |
| `<UserButton />` | User avatar/menu in the app header |

## Route Protection

- Public routes (e.g., landing page, sign-in, sign-up) must be explicitly listed in the `isPublicRoute` matcher in `middleware.ts`.
- All other routes are protected by default via `auth.protect()`.
- Do NOT manually check auth inside page components as a substitute for middleware protection.

## Data Access & User Scoping

Auth integrates directly with the data fetching rules defined in `data-fetching.md`:

- Always obtain `userId` from `auth()` before calling any data helper in `/data`.
- Every data helper that returns user-specific data must receive and apply `userId` as a filter.
- Never fetch data without scoping it to the authenticated user.

```ts
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { getUserWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  const workouts = await getUserWorkouts(userId);
  return <WorkoutList workouts={workouts} />;
}
```

## Summary

| Rule | Requirement |
|---|---|
| Auth provider | Clerk only |
| Custom auth | Forbidden |
| Server-side user ID | `auth()` from `@clerk/nextjs/server` |
| Client-side auth state | `useAuth` / `useUser` hooks only when necessary |
| Auth UI | Clerk components only (`<SignIn />`, `<SignUp />`, `<UserButton />`) |
| Route protection | Clerk middleware in `middleware.ts` |
| Data scoping | Every query must be scoped to the authenticated `userId` |

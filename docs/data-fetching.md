# Data Fetching

## CRITICAL RULES

### 1. No Route Handlers for Data Fetching

**Data MUST NOT be fetched via API route handlers (`app/api/...`).**

All data fetching must be done via:
- **Server Components** (preferred) — fetch data directly in `async` server components
- **Client Components** — only when interactivity requires it (e.g., after user action), using server actions or query libraries that call server actions

Route handlers exist only for webhooks, OAuth callbacks, and other non-data-fetching purposes.

### 2. All Database Queries via `/data` Helper Functions

**Database queries MUST NOT be written inline in components or server actions.**

All database access must go through helper functions in the `/data` directory. These functions:
- Use **Drizzle ORM** exclusively — no raw SQL, no `db.execute()` with raw strings
- Are the single source of truth for data access logic
- Are named clearly to reflect what they return (e.g., `getUserWorkouts`, `getExerciseById`)

Example structure:

```
/data
  workouts.ts
  exercises.ts
  sets.ts
```

Example helper:

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserWorkouts(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### 3. Users Can ONLY Access Their Own Data

**This is a security requirement, not a suggestion.**

Every query in `/data` that returns user-specific data MUST filter by the authenticated user's ID. Never fetch all records and filter in the application layer.

- Always obtain `userId` from the server-side auth session (e.g., `auth()` from Clerk or similar)
- Always pass `userId` into data helper functions and apply it as a `WHERE` clause via Drizzle
- Never trust user-supplied IDs from request params/body without validating they match the session user

Example of a **correct** server component:

```tsx
// app/dashboard/page.tsx
import { auth } from "@/auth";
import { getUserWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const { userId } = await auth();
  const workouts = await getUserWorkouts(userId);
  return <WorkoutList workouts={workouts} />;
}
```

Example of what is **forbidden**:

```ts
// NEVER do this — fetches all users' data
const workouts = await db.select().from(workoutsTable);

// NEVER do this — raw SQL
const workouts = await db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);

// NEVER do this — data fetching in a route handler
// app/api/workouts/route.ts → return NextResponse.json(...)
```

## Summary

| Rule | Requirement |
|---|---|
| Data fetching method | Server components or client components only |
| Route handlers for data | Forbidden |
| Database access | Drizzle ORM via `/data` helpers only |
| Raw SQL | Forbidden |
| Data isolation | Every query MUST be scoped to the authenticated `userId` |

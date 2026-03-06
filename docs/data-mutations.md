# Data Mutations

## CRITICAL RULES

### 1. All Database Mutations via `/data` Helper Functions

**Database mutations MUST NOT be written inline in components or server actions.**

All database writes (insert, update, delete) must go through helper functions in the `/data` directory. These functions:
- Use **Drizzle ORM** exclusively — no raw SQL, no `db.execute()` with raw strings
- Are the single source of truth for mutation logic
- Are named clearly to reflect what they do (e.g., `createWorkout`, `updateSet`, `deleteExercise`)

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

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date });
}

export async function deleteWorkout(workoutId: string) {
  return db.delete(workouts).where(eq(workouts.id, workoutId));
}
```

### 2. All Mutations via Server Actions in Colocated `actions.ts` Files

**Mutations MUST be triggered via Next.js Server Actions**, not API route handlers.

Server actions must be defined in colocated files named `actions.ts`, placed alongside the route or component that uses them.

Example structure:

```
app/
  workouts/
    new/
      page.tsx
      actions.ts   <-- server actions for this route
```

Each `actions.ts` file must have `"use server"` at the top.

```ts
// app/workouts/new/actions.ts
"use server";

// server actions go here
```

### 3. Server Action Parameters Must Be Typed — No `FormData`

**Server action parameters MUST use explicit TypeScript types.**

- Do NOT use `FormData` as a parameter type
- Define a dedicated type or inline type for each action's arguments

```ts
// CORRECT
export async function createWorkout(params: { name: string; date: Date }) { ... }

// FORBIDDEN
export async function createWorkout(formData: FormData) { ... }
```

### 4. All Server Action Arguments Must Be Validated with Zod

**Every server action MUST validate its arguments using Zod before performing any operation.**

- Define a Zod schema for each action's input
- Parse arguments with `.parse()` or `.safeParse()` at the top of the action
- Do not trust raw input — validate before passing to `/data` helpers

Example:

```ts
// app/workouts/new/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { auth } from "@/auth";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: { name: string; date: Date }) {
  const { userId } = await auth();
  const { name, date } = createWorkoutSchema.parse(params);
  return createWorkout(userId, name, date);
}
```

### 5. No `redirect()` Inside Server Actions — Redirect Client-Side

**Do NOT call `redirect()` from `next/navigation` inside server actions.**

- Server actions must return (or throw) to signal completion — navigation is the caller's responsibility
- After a server action resolves, handle the redirect client-side using the Next.js router

```ts
// FORBIDDEN — do not do this in actions.ts
import { redirect } from "next/navigation";

export async function createWorkoutAction(params: { name: string; date: Date }) {
  // ...
  redirect("/dashboard"); // ❌ not allowed
}
```

```tsx
// CORRECT — redirect in the client component after the action resolves
import { useRouter } from "next/navigation";
import { createWorkoutAction } from "./actions";

const router = useRouter();

async function handleSubmit() {
  await createWorkoutAction({ name, startedAt });
  router.push("/dashboard"); // ✅ redirect here
}
```

### 6. Users Can ONLY Mutate Their Own Data

**This is a security requirement, not a suggestion.**

- Always obtain `userId` from the server-side auth session (e.g., `auth()` from Clerk or similar) — never from the client
- Always scope mutations to the authenticated user's ID
- Never trust user-supplied IDs without validating they belong to the session user

## Summary

| Rule | Requirement |
|---|---|
| Database mutation method | Drizzle ORM via `/data` helpers only |
| Raw SQL in mutations | Forbidden |
| Triggering mutations | Server actions only — no route handlers |
| Server action file location | Colocated `actions.ts` files |
| Server action parameter types | Explicit TypeScript types — no `FormData` |
| Argument validation | Zod required on every server action |
| Redirects | Client-side only via `router.push()` — no `redirect()` in server actions |
| Data ownership | Every mutation MUST be scoped to the authenticated `userId` |

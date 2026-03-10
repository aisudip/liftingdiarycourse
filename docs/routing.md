# Routing Standards

## Route Structure

All application routes must be nested under `/dashboard`.

```
/dashboard         — Main dashboard page
/dashboard/*       — All sub-pages and features
```

Do NOT create top-level routes for authenticated features. Every protected page belongs under `/dashboard`.

## Route Protection

All `/dashboard` routes are protected and only accessible by authenticated users.

Route protection is implemented via **Next.js Middleware** (`middleware.ts` at the project root).

- Do NOT use per-page auth checks (e.g., redirects inside `page.tsx` or layout files).
- The middleware must intercept all `/dashboard` routes and redirect unauthenticated users to the login page.

### Example Middleware

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthenticated = // check session/cookie/token here

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

## File Structure

Use the Next.js App Router convention for all routes:

```
app/
  dashboard/
    page.tsx              — /dashboard
    layout.tsx            — shared layout for all /dashboard routes
    [feature]/
      page.tsx            — /dashboard/[feature]
```

## Rules Summary

- All app routes live under `/dashboard`
- Route protection is handled exclusively in `middleware.ts`
- No auth logic in individual page or layout files
- Use Next.js App Router file-based routing conventions

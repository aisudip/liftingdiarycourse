# UI Coding Standards

## Component Library

**Only shadcn/ui components are permitted in this project.**

- Do NOT create custom UI components.
- Do NOT use other component libraries (e.g., MUI, Chakra, Radix directly, etc.).
- Every UI element must be built using shadcn/ui components.
- If a needed component does not exist in the project yet, add it via the shadcn CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```

## Date Formatting

Use **date-fns** for all date formatting. Dates must be formatted with an ordinal day suffix, abbreviated month, and full year.

### Format

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2023
4th Jun 2024
```

### Implementation

```ts
import { format } from "date-fns";

function formatDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}
```

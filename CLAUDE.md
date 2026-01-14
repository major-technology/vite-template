# Major Resource Client Tool

React 19 + TypeScript + Vite (rolldown-vite@7.2.2) + SWC

## IMPORTANT: This is a Starter Template!

**This is a blank canvas meant to be transformed into a real application.** When you receive instructions about what to build:

1. **Update this CLAUDE.md file first** with project-specific context about the actual application. Also update README.md
2. **Replace the placeholder content** with the real first page of the application
3. **Build the application** according to the user's requirements

## AI Assistant Instructions: Keep This File Updated

**IMPORTANT:** When making significant changes to this codebase, you MUST update this CLAUDE.md file to reflect those changes. This ensures future AI assistants and developers have accurate context.

## Environment

- **Node**: >=22.12.0
- **Package Manager**: pnpm >=8.0.0 (required)
- **Install**: `pnpm install`
- **Dev**: `major app start`

## Resource Clients

**CRITICAL**: All resource access MUST go through auto-generated clients from `@major-tech/resource-client`.

### Using Generated Clients

Import and use the auto-generated clients from `/src/clients/`:

```typescript
import { ordersDbClient } from "./clients";

const result = await ordersDbClient.invoke(
  "SELECT * FROM orders WHERE user_id = $1",
  [userId],
  "fetch-user-orders"
);

if (result.ok) {
  console.log(result.result.rows);
}
```

## UI Components

**shadcn/ui**: Use exclusively for all UI components.

### Configuration

shadcn/ui is configured with:
- **Style**: Lyra
- **Base color**: Zinc
- **Icons**: lucide-react
- **Font**: Inter (via Google Fonts)
- **Dark mode**: System preference detection (automatic)

### Adding Components

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
# etc.
```

### Utilities

- `cn()` utility for class merging: `import { cn } from "@/lib/utils"`
- CSS variables defined in `src/index.css` for light/dark theming

## Architecture

- React 19 with TypeScript strict mode
- Vite with SWC (Fast Refresh)
- Tailwind CSS + shadcn/ui for styling
- ESLint configured for React hooks + TypeScript
- `@major-tech/resource-client` for all resource access

## Developing

- Run `pnpm lint` to check if your changes actually work
- Make sure to look at the `@major-tech/resource-client` package, the methods available and how to use them
- All `invokes` of resource-clients should be put in `/src/actions`

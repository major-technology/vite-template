# Major Resource Client Tool

React 19 + TypeScript + Vite (rolldown-vite@7.2.2) + SWC

## Environment
- **Node**: >=22.12.0
- **Package Manager**: pnpm >=8.0.0 (required)
- **Install**: `pnpm install`
- **Dev**: `pnpm dev`

## Resource Clients

**CRITICAL**: All resource access MUST go through auto-generated clients from `@major-tech/resource-client`.

### Using Generated Clients

Import and use the auto-generated clients from `/src/clients/`:

```typescript
import { ordersDbClient } from './clients';

const result = await ordersDbClient.invoke(
  'SELECT * FROM orders WHERE user_id = $1',
  [userId],
  'fetch-user-orders'
);

if (result.ok) {
  console.log(result.result.rows);
}
```

## UI Components
**shadcn/ui**: Use exclusively for all UI components. Install components via npx as needed.

## Architecture
- React 19 with TypeScript strict mode
- Vite with SWC (Fast Refresh)
- ESLint configured for React hooks + TypeScript
- `@major-tech/resource-client` for all resource access

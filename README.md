# Major Resource Client Tool

React 19 + TypeScript + Vite (rolldown-vite@7.2.2) + SWC

## Environment
- **Node**: >=22.12.0
- **Package Manager**: pnpm >=8.0.0 (required)
- **Install**: `pnpm install`
- **Dev**: `pnpm dev`

## Resource Clients
**CRITICAL**: All resource access MUST go through singleton clients in `/src/clients/`. 

- Clients are pre-configured singletons - DO NOT generate new ones
- DO NOT create resource clients outside `/src/clients/`
- Base classes in `/src/lib/resource-client/`: `PostgresResourceClient`, `CustomApiResourceClient`, `HubSpotResourceClient`, `S3ResourceClient`
- Scripts: `pnpm clients:list`, `pnpm clients:add`, `pnpm clients:remove`

## UI Components
**shadcn/ui**: Use exclusively for all UI components. Install components via npx as needed.

## Architecture
- React 19 with TypeScript strict mode
- Vite with SWC (Fast Refresh)
- ESLint configured for React hooks + TypeScript

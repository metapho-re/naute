# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Naute is a markdown note-taking app. Monorepo with three npm workspaces: `shared`, `frontend`, `backend`. Infrastructure is defined in a SAM template under `infra/`.

## Build Commands

```bash
npm install                                    # install all workspaces
npm run build -w shared                        # build shared types (must run first)
npm run build -w backend                       # compile backend TypeScript
npm run build -w frontend                      # tsc + vite build
npm run dev -w frontend                        # local dev server at localhost:5173
npx tsc --noEmit -p frontend/tsconfig.json     # type-check frontend
sam validate --lint -t infra/template.yaml     # validate SAM template
sam build -t infra/template.yaml               # build Lambda functions via esbuild
./infra/deploy.sh                              # full deploy (build + sam deploy + frontend sync)
npm run website                                # serve static site from website folder
```

Build order matters: `shared` must be built before `backend` or `frontend` since they depend on `@naute/shared`.

## Lint & Format

```bash
npm run lint                                   # ESLint across all workspaces
npm run lint:fix                               # auto-fix lint issues (includes formatting)
npm run stylelint -w frontend                  # stylelint + auto-fix frontend CSS
```

ESLint uses flat config with TypeScript ESLint + Prettier via `eslint-plugin-prettier` (runs Prettier as an ESLint rule). Prettier config is default and uses `prettier-plugin-tailwindcss` for class sorting. Unused vars prefixed with `_` are allowed. No separate `.prettierrc` file — Prettier is configured entirely through the ESLint plugin.

Stylelint uses `stylelint-config-standard` + `stylelint-config-idiomatic-order`. Custom at-rules `@theme`, `@custom-variant`, `@utility` are allowed (Tailwind v4 syntax).

## Testing

No test framework is configured. There are no test files in the codebase.

## Architecture

**Shared** (`shared/src/types/`): TypeScript types for `Note`, `NoteSummary`, `CreateNoteRequest`, `UpdateNoteRequest`, `AiNoteAction`, `AiNoteRequest`, `AiNoteResponse`, `ApiResponse<T>`. All workspaces import from `@naute/shared`.

**Backend** (`backend/src/`): Node.js 22 Lambda backend split by concern:

- `database.ts` — DynamoDB document client, key helpers, and data access functions (`getNote`, `putNote`, `removeNote`, `getAllNotes`)
- `errors.ts` — Error classes (`ValidationError`, `NotFoundError`) and validation helpers
- `note-service.ts` — Service functions (`createNote`, `updateNote`, `deleteNote`, `findNote`, `listNotes`)
- `note-handler.ts` — Lambda handler for CRUD routes; catches errors by `e.name` — `ValidationError` maps to 400, `NotFoundError` to 404
- `ai-service.ts` — Claude API integration for note generation and formatting; retrieves API key from SSM Parameter Store (`/naute/anthropic-api-key`) with in-memory caching; returns structured JSON (title, content, tags)
- `ai-handler.ts` — Streaming Lambda handler for AI endpoints; uses SSE with heartbeat keep-alive; verifies JWT via `jwt.ts`
- `auth-handler.ts` — Lambda handler for auth endpoints (`/auth/token`, `/auth/refresh`, `/auth/logout`); proxies Cognito token exchange. Stores the refresh token as an HTTP-only cookie and also returns it in the `/auth/token` body; `/auth/refresh` accepts the refresh token from the request body or the cookie (body takes priority)
- `jwt.ts` — Cognito JWT verification helper (`verifyToken`) used by the streaming AI handler

**Infrastructure** (`infra/`): AWS SAM template and deployment config:

- `infra/template.yaml` — all AWS resources (DynamoDB, Cognito, API Gateway, Lambda, S3, CloudFront, Route53)
- `infra/samconfig.toml` — deployment defaults (stack name, region, parameters)
- `infra/deploy.sh` — build + deploy script (SAM deploy + frontend S3 sync + CloudFront invalidation)
- Parameters: `DomainName`, `HostedZoneId`, `CognitoDomainPrefix`

**Frontend** (`frontend/src/`): React 19 + Vite + Tailwind CSS v4 PWA, with TanStack Query for server state:

- `auth/` — OAuth 2.0 Authorization Code + PKCE flow with Cognito; access token kept in React state. Refresh token persistence is gated by `isStandalone()` (`utils.ts`): normal browsers rely on the HTTP-only cookie set by the backend `/auth/*` endpoints, while an installed (standalone) PWA stores the refresh token in `localStorage` and sends it in the `/auth/refresh` body — iOS home-screen apps do not reliably persist cookies across launches
- `services/api.ts` — Typed API client via `createApiClient(getToken)` higher-order function with automatic token injection
- `hooks/` — TanStack Query hooks (`useNotes`, `useNote`, `useSaveNote`, `useDeleteNote`, `useAiNote`), editor/markdown helpers (`useNoteEditor`, `useMarkdown`), the API client hook (`useApiClient`), and shared `query-keys.ts`
- `components/` — Layout, Navbar, Sidebar, NoteCard, NoteEditor, NoteWorkspace, AiNoteDialog, Dropdown
- `pages/` — LandingPage, CallbackPage, NoteListPage, NoteViewPage, NoteEditorPage (split-pane: CodeMirror 6 editor + marked/Shiki/DOMPurify preview); each page has a co-located `use-*-page.ts` hook that owns its state and side effects
- `theme/` — Kanagawa theme with light/dark variants and CSS variables
- `utils/` — Shared helpers (`cn`, `getRelativeTimeString`, Shiki/marked highlighter setup)
- `types.ts` — Frontend-only types (`Tag`, `SortField`, `SortOrder`)
- `env.ts` — Centralized type-safe access to all `VITE_*` environment variables
- `main.tsx` — Wires `BrowserRouter`, `ThemeProvider`, `AuthProvider`, and `QueryClientProvider`
- PWA via `vite-plugin-pwa` with auto-update service worker and workbox caching

**Frontend routes** (React Router v7):

- `/` — LandingPage (login prompt, unprotected)
- `/callback` — OAuth callback (unprotected)
- `/notes` — NoteListPage (protected by `AuthGuard`)
- `/notes/new` — NoteEditorPage
- `/notes/:id` — NoteViewPage
- `/notes/:id/edit` — NoteEditorPage
- `*` → redirects to `/notes`

## DynamoDB Design

Table: `naute-table`, Keys: `PK` (partition) + `SK` (sort)

| Entity | PK      | SK         |
| ------ | ------- | ---------- |
| Note   | `NOTES` | `{id}`     |

Static partition key — all notes share `PK = "NOTES"`, with `id` (UUID) as the sort key. Listing uses `Query` on the partition. Tags are stored as a `string[]` on each note and derived client-side (no backend tag endpoints).

## Frontend Local Dev

Requires `frontend/.env.local` with Cognito values (see `frontend/.env.example`). The infrastructure must be deployed first to get actual Cognito client ID and domain. Callback URLs `http://localhost:5173/callback` and `http://localhost:5173` are pre-configured in the SAM Cognito resource.

## Deployment

`./infra/deploy.sh` reads env vars: `NAUTE_DOMAIN`, `NAUTE_HOSTED_ZONE_ID`, `NAUTE_COGNITO_PREFIX`. GitHub Actions (`.github/workflows/deploy.yml`) runs this on push to `main` using OIDC for AWS auth.

## Key Conventions

- All packages use ES modules (`"type": "module"`)
- Tailwind CSS v4: uses `@import "tailwindcss"` (not `@tailwind` directives)
- Backend validation: title max 200 chars, content max 100KB, max 20 tags, tag max 50 chars, tag pattern `^[a-z0-9-]+$`
- Custom error classes: `ValidationError`, `NotFoundError` in backend services
- TypeScript target: ES2022, strict mode, bundler module resolution
- SAM esbuild bundles Lambda handlers as ESM with AWS SDK externalized
- Frontend uses `noEmit` — Vite handles the build, TypeScript only type-checks
- `consistent-type-imports` ESLint rule enforced — use `import type` for type-only imports

## Frontend Code Style

All frontend files follow the conventions:

- **File naming**: kebab-case everywhere (`use-notes.ts`, `note-card.tsx`, `note-list-page.tsx`)
- **Exports**: `export const` with arrow functions — no default exports
- **Generics**: Explicit type arguments on `useState`, `useRef`, `useMemo`, `useCallback`
- **Hook pattern**: Define `interface ReturnValue` before each hook export
- **Imports**: External → internal → local, blank lines between groups
- **Error handling**: `try/catch/finally` with `unknown` error type, never `.then()/.catch()`
- **Booleans**: `is*`, `has*`, `should*`, `can*` prefixes
- **Constants**: `UPPER_SNAKE_CASE` for primitives/lookup tables, `camelCase` for object instances
- **Comments**: Zero comments (except unavoidable `eslint-disable`), code should be self-explanatory.
- **Barrel exports**: `index.ts` in every directory
- **Responsive breakpoints**: two-tier — `md` (768px) for mobile↔tablet (sidebar layout, padding), `xl` (1280px) for tablet↔desktop (side-by-side editor/preview)

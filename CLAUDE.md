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

**Shared** (`shared/src/types/`): TypeScript types for `Note`, `NoteSummary`, `CreateNoteRequest`, `UpdateNoteRequest`, `ApiResponse<T>`. All workspaces import from `@naute/shared`.

**Backend** (`backend/src/`): Node.js 22 Lambda backend split by concern:

- `database.ts` — DynamoDB document client, key helpers, and data access functions (`getNote`, `putNote`, `removeNote`, `getAllNotes`)
- `errors.ts` — Error classes (`ValidationError`, `NotFoundError`) and validation helpers
- `notes.ts` — Service functions (`createNote`, `updateNote`, `deleteNote`, `findNote`, `listNotes`)
- `handler.ts` — Lambda handler (entry point); catches errors by `e.name` — `ValidationError` maps to 400, `NotFoundError` to 404

**Infrastructure** (`infra/`): AWS SAM template and deployment config:

- `infra/template.yaml` — all AWS resources (DynamoDB, Cognito, API Gateway, Lambda, S3, CloudFront, Route53)
- `infra/samconfig.toml` — deployment defaults (stack name, region, parameters)
- `infra/deploy.sh` — build + deploy script (SAM deploy + frontend S3 sync + CloudFront invalidation)
- Parameters: `DomainName`, `HostedZoneId`, `CognitoDomainPrefix`

**Frontend** (`frontend/src/`): React 19 + Vite + Tailwind CSS v4 SPA:

- `auth/` — OAuth 2.0 Authorization Code + PKCE flow with Cognito (sessionStorage for code verifier, module-level variable for refresh token)
- `services/api.ts` — Typed API client via `createApiClient(getToken)` higher-order function with automatic token injection
- `hooks/` — Data fetching hooks (`useNotes`, `useNote`, `useSaveNote`, `useDeleteNote`, `useNoteEditor`)
- `components/` — Layout, Navbar, NoteCard, NoteEditor, NoteWorkspace
- `pages/` — CallbackPage, NoteListPage, NoteViewPage, NoteEditorPage (split-pane: CodeMirror 6 editor + marked/highlight.js/DOMPurify preview)
- `theme/` — Kanagawa theme with light/dark variants and CSS variables
- `env.ts` — Centralized type-safe access to all `VITE_*` environment variables

**Frontend routes** (React Router v7):

- `/` → redirects to `/notes`
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
- Backend validation: title max 200 chars, content max 100KB, max 20 tags, tag pattern `^[a-z0-9-]+$`
- Custom error classes: `ValidationError`, `NotFoundError` in backend services
- TypeScript target: ES2022, strict mode, bundler module resolution
- SAM esbuild bundles Lambda handlers as ESM with AWS SDK externalized
- Frontend uses `noEmit` — Vite handles the build, TypeScript only type-checks

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite, localhost:5173)
npm run build      # Type-check then bundle for production (tsc -b && vite build)
npm run lint       # Run ESLint
npm run preview    # Preview the production build locally
```

No test runner is configured in this project.

## Architecture

**Stack**: React 19, TypeScript ~6.0, Vite 8, MUI v9 (Material UI + Emotion), React Router v7.

**React Compiler is enabled** via `babel-plugin-react-compiler`. This means React automatically memoizes components — avoid adding manual `React.memo`, `useMemo`, or `useCallback` unless there is a specific measured reason.

**Deployment**: Netlify. `npm run build` outputs to `dist/`.

### Data flow

All content is static — there is no backend or API. Page data lives in `src/data/<PageName>/index.ts`, typed against interfaces in `src/pages/<PageName>/types.ts`. Pages import their data directly; there is no global state management.

### Adding a new page (follow this pattern)

1. Add a path constant to `src/constants/routes.ts` (`ROUTE_PATHS`)
2. Create `src/pages/NewPage/types.ts`, `NewPage.tsx`, and `index.ts` (re-export)
3. Create `src/data/NewPage/index.ts` with the static data typed against those types
4. Register the route in `src/router/routes.ts` using `React.lazy()` wrapped in `LazyPageWrapper`

### Router

`src/router/routes.ts` holds the `RouteConfig[]` array — the single source of truth for all routes. `src/router/utils.tsx` provides:
- `createRouter()` — converts `RouteConfig[]` to a `createBrowserRouter` instance
- `LazyPageWrapper()` — wraps a lazy component in `<Suspense>` with a centered `CircularProgress` fallback

### Theme

One MUI theme defined in `src/theme/theme.ts`, applied globally via `<ThemeProvider>` in `App.tsx`. All palette, typography, shape, and component overrides live there. Use MUI's `sx` prop for component-level styling — avoid separate CSS files.

### Component conventions

- Each component lives in `src/components/<ComponentName>/` with a named export and an `index.ts` barrel re-export.
- `src/components/index.ts` re-exports all components for clean imports (`import { Header, PageCard } from '../../components'`).

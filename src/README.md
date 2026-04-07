# TechnoRUCS PMS — Frontend Architecture

## Directory Map

```
src/
├── api/
│   ├── client.ts               # Axios base instance — auth interceptor, toast dispatch
│   ├── axiosInstance.ts        # Shim → re-exports api from client.ts (backward compat)
│   └── services/               # Canonical API layer — one file per domain
│       ├── index.ts            # Barrel: export * from all services
│       ├── projects.service.ts
│       ├── project-groups.service.ts
│       ├── tasks.service.ts
│       ├── issues.service.ts
│       ├── timelogs.service.ts
│       ├── milestones.service.ts
│       ├── tasklists.service.ts
│       ├── users.service.ts
│       ├── teams.service.ts
│       ├── roles.service.ts
│       ├── masters.service.ts
│       ├── documents.service.ts
│       └── reports.service.ts
│
├── assets/                     # Logos, brand assets
│
├── components/
│   ├── common/
│   │   └── index.ts            # Barrel: Button, Card, StatCard, Badge
│   ├── core/                   # Smart PrimeReact wrappers (ServerSearchDropdown, etc.)
│   ├── data/
│   │   ├── MasterTable.tsx     # Generic DataTable wrapper
│   │   └── TreeTable.tsx       # Generic TreeTable wrapper (canonical location)
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── StatCard.tsx
│       ├── Badge.tsx
│       ├── DataTable.tsx
│       ├── TreeTable.tsx       # Shim → re-exports from components/data/TreeTable
│       └── ...                 # FormField, TextInput, Skeleton, FilterSidebar…
│
├── features/                   # Business modules — flat, NOT merged into clusters
│   ├── auth/
│   ├── dashboard/
│   ├── projects/
│   │   └── api/projects.api.ts # Shim → @/api/services/projects.service
│   ├── tasks/
│   ├── issues/
│   ├── timelogs/
│   ├── milestones/
│   ├── tasklists/
│   ├── users/
│   ├── teams/
│   ├── roles/
│   ├── masters/
│   ├── documents/
│   ├── reports/
│   ├── notifications/
│   └── settings/
│
├── hooks/                      # Global hooks (useFilters, useDebounce, useFilters)
├── layouts/                    # PageWrapper, Sidebar, Header
├── providers/
│   ├── AppProviders.tsx        # Single entry: PrimeReact + QueryClient + Theme + Toast + Auth
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
├── styles/                     # Global SASS + Tailwind @theme tokens
├── types/                      # Global TypeScript interfaces
└── utils/                      # cn.ts, formatters, permissions, export helpers
```

## Import Conventions

| What you need | Import from |
|---|---|
| Any API service | `@/api/services` (barrel) or `@/api/services/[name].service` |
| Axios instance | `@/api/client` |
| Button / Card / StatCard / Badge | `@/components/common` |
| DataTable / TreeTable | `@/components/data/[Component]` |
| Feature component | `@/features/[domain]/components/...` |
| Feature hook | `@/features/[domain]/hooks/...` |

## Rules

- All API calls go through `@/api/client` — never import `axios` directly in features.
- Feature `*/api/*.api.ts` files are **shims only** — zero business logic inside them.
- New services go in `src/api/services/` first, then get a 1-line shim in the feature.
- PrimeReact components are always wrapped — never use raw PrimeReact in feature views.
- Zero raw HTML for structural containers — use `Card`, `DataTable`, or `TreeTable`.

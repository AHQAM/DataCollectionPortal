# Sales Collection Hub — Architecture Guide

## Overview

Sales Collection Hub is an enterprise multi-tenant field sales and data collection portal designed for offline-first field representatives, branch supervisors, and corporate administrators.

```mermaid
graph TD
    subgraph Frontend [React PWA (Web Admin & Portal)]
        UI[UI Components]
        OpsHooks[Operations Hooks: use*Ops]
        Stores[Zustand Stores: auth, data, ui]
        Services[API Service Layer: *Api]
    end

    subgraph Backend [Firebase Platform]
        Auth[Firebase Authentication]
        Firestore[(Cloud Firestore)]
        Storage[Cloud Storage]
        CF[Cloud Functions (TypeScript)]
        AppCheck[Firebase App Check]
    end

    subgraph MobileApp [Flutter Mobile Client]
        Riverpod[Riverpod State]
        HiveDB[(Hive Offline Storage)]
        SyncManager[Sync Manager]
    end

    UI --> OpsHooks
    OpsHooks --> Stores
    OpsHooks --> Services
    Services --> CF
    Services --> Firestore
    Stores --> Firestore

    MobileApp --> SyncManager
    SyncManager --> HiveDB
    SyncManager --> CF
    SyncManager --> Firestore

    CF --> AppCheck
    CF --> Auth
    CF --> Firestore
```

---

## 1. Architectural Layers

### A. State Management Layer (`src/stores/`)

The application utilizes [Zustand](https://github.com/pmndrs/zustand) for reactive, performant, lightweight client state management:

- **`authStore.ts`**: User session, active role (`ADMIN`, `SUPERVISOR`, `REP`), permissions, and device binding status.
- **`dataStore.ts`**: In-memory cache of requests, assignments, dynamic fields, branches, regions, and collected records.
- **`uiStore.ts`**: Presentation state, active view, language (`ar` / `en`), direction (`rtl` / `ltr`), network status (`isOnline`), and toast notifications.

### B. Operations Hooks (`src/hooks/`)

To decouple UI components from business logic and audit trails, specialized operations hooks encapsulate actions:

- **`useRecordOps`**: Submitting, saving drafts, and reassigning records with automatic audit logging (`RECORD_COMPLETED`, `RECORD_DRAFT_SAVED`).
- **`useRequestOps`**: Request lifecycle actions (create, update, publish, close, archive, delete).
- **`useBranchOps`**: CRUD operations for branches and geographic regions with validation.
- **`useUserOps`**: User creation, credential management, role assignment, and device unbinding.
- **`useSystemOps`**: System maintenance, demo data wipe, and health checks.
- **`useFormBuilder`**: Dynamic schema construction, field ordering, and validation rules.
- **`useBranchesExcelImport`**: Spreadsheet template generation, parsing, and batch ingestion.

### C. Services Layer (`src/services/`)

Typed wrappers around Firebase Callable Cloud Functions and Firestore queries:

- `recordApi.ts`
- `requestApi.ts`
- `branchRegionApi.ts`
- `userApi.ts`
- `systemApi.ts`
- `deviceApi.ts`
- `templateApi.ts`

### D. Security & App Check

- **App Check**: Verifies incoming web and mobile traffic against reCAPTCHA v3 / Play Integrity tokens.
- **Role-Based Access Control (RBAC)**: Enforced via Firebase Custom Claims (`token.role === 'ADMIN' | 'SUPERVISOR' | 'REP'`).
- **Device Binding**: Mobile representatives are bound to authorized physical devices, preventing account sharing.
- **Audit Logging**: Immutable audit logs recorded on every state-altering administrative and field action.

### E. Localization Architecture Decision

- **Pattern:** Inline Ternary Localization (`lang === 'ar' ? '...' : '...'`).
- **Rationale:** The web application consists of 66 cohesive components that already utilize the reactive `useApp().lang` context. Rather than maintaining an auxiliary external dictionary that diverges over time, the team formally standardized on inline localization and eliminated the legacy `translations.ts` file, eliminating architectural drift and reducing bundle overhead.

### F. Observability & Error Monitoring

- **Web Admin Portal:** Integrated error monitoring via `src/utils/monitoring.ts` and `src/components/ErrorBoundary.tsx`. Uncaught exceptions, unhandled promise rejections, and component crashes are captured with contextual breadcrumbs and forwarded to Sentry when `VITE_SENTRY_DSN` is configured, with an in-memory buffer fallback.
- **Mobile Client:** Firebase Crashlytics and Analytics track runtime crashes, fatal exceptions, and device performance metrics.

---

## 2. Directory Structure

```
c:\DataCollectionPortal\
├── .github/workflows/       # CI/CD pipelines (Web, Mobile, Functions)
├── firebase/
│   ├── functions/src/       # Backend Cloud Functions (TypeScript)
│   │   ├── __tests__/       # Cloud Functions test suites
│   │   ├── config/          # Firestore DB & App Check configuration
│   │   └── index.ts         # Cloud Functions entrypoint
│   ├── firestore.rules      # Firestore security rules
│   └── storage.rules        # Cloud Storage security rules
├── mobile/                  # Flutter mobile application
│   ├── lib/                 # Flutter source code (Riverpod + Hive)
│   └── test/                # Unit, widget, and integration tests
└── src/                     # React web application
    ├── __tests__/           # Web unit and component tests
    ├── components/
    │   ├── admin/           # Admin modules (dashboard, requests, reports, etc.)
    │   │   ├── dashboard/   # Modular dashboard sub-components
    │   │   └── requests/    # Modular request management sub-components
    │   └── common/          # Reusable UI elements
    ├── hooks/               # Custom business logic & operations hooks
    ├── services/            # Backend API abstraction layer
    ├── stores/              # Zustand global state stores
    ├── types.ts             # TypeScript domain models and interfaces
    └── utils/               # Excel, audit, and notification utilities
```

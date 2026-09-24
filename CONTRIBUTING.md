# Contributing to Sales Collection Hub

Thank you for your interest in contributing! This document outlines our development workflows and guidelines.

## Development Workflow

### 1. Code Formatting

All code must be formatted using Prettier before committing:

```bash
npm run format:check   # Verify formatting in CI
npm run format:fix     # Automatically fix formatting
```

### 2. Commit Message Integrity

We enforce data-backed commit messages. Any commit claiming a fix, refactor, or optimization must cite measurable outcomes.

- **Bad:** "Fixed bugs" or "Refactored forms"
- **Good:** "Refactored Admin layout (3 files changed, coverage +1.2%)"
- **Rule:** Do not describe just the intent. Describe the actual result.

### 2. Type Checking

TypeScript types must compile with zero errors:

```bash
npm run typecheck
```

### 3. Testing & Coverage

We enforce test coverage on all PRs using Vitest:

```bash
npm run test:coverage
```

Ensure all new business logic in `src/hooks/` and `src/services/` includes corresponding tests in `src/__tests__/`.

### 4. Cloud Functions Testing

```bash
cd firebase/functions
npm test
```

### 5. Mobile Testing

```bash
cd mobile
flutter test
```

## Architectural Guidelines

- Follow the modular pattern: keep components under 250 lines and extract widgets/modals to sub-directories.
- Encapsulate business logic and audit logging in `src/hooks/use*Ops.ts`.
- Avoid direct `as any` type assertions; define domain types in `src/types.ts`.

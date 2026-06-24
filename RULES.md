# General Rules

- TypeScript only
- ESM only
- Do not use any in ts

# Architecture

- Feature based
- Repository layer
- In Repositories should use the db'types existing in electron/server/dbTypes/db.types.ts
- Service layer

# Testing

- Vitest
- In integration tests prefer using db instance of test environment rather than mocks.



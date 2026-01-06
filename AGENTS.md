##

## Commands

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run test` - Run all tests
- `bun run test <pattern>` - Run specific tests matching pattern
- `bun run typecheck` - Type-check with TypeScript
- `bun run check` - Lint with Biome
- `bun run fix` - Auto-fix linting issues
- `bun run fastvet` - Run typecheck, lint fix, rule validation, tests
- `bun run vet` - Full validation including e2e tests
- `bun run scripts/rule-validator.ts` - Check custom rule compliance

## Code Style

### Types & Validation
- Use `ArkType` for runtime validation - NO `any` types
- Use `arkenv` for environment variables
- Strict TypeScript enabled: noUncheckedIndexedAccess, noImplicitOverride

### Functions & Modules
- Use factory functions with revealing modules - NO ES6 classes
- `createUserService(db)` instead of `class UserServiceImpl`
- Export functions, not classes with static methods

### Strings
- Template literals only - NO string concatenation with `+`
- Use `${}` interpolation: `const msg = \`Hello ${name}\``
- Never: `const msg = "Hello " + name`

### Imports
- Direct imports only - NO barrel exports
- Import from source files, not index files
- Use `import { thing } from './thing'` not `import { thing } from './things'`

### Testing
- Use `bun test` with `import { test, expect } from "bun:test"`
- Test files named `*.test.ts` in same directory as source
- Write descriptive test names that explain behavior

### Configuration
- Use `arkenv` from [`config.ts`](./config.ts) for environment variables - NEVER remove arkenv
- Import: `import { CONFIG, type Config } from './config'`
- Access env: `CONFIG.isDevelopment`, `CONFIG.isProduction`, `CONFIG.nodeEnv`
- All env vars must be validated through arkenv

## Bun APIs

Use Bun's native APIs instead of Node equivalents:
- `Bun.serve()` for HTTP/WebSockets - don't use `express`
- `bun:sqlite` for SQLite - don't use `better-sqlite3`
- `Bun.sql` for Postgres - don't use `pg`
- `Bun.file()` for file I/O - don't use `node:fs`
- `Bun.$` for shell commands - don't use `execa`
- Bun auto-loads `.env` - don't use `dotenv`
- For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Frontend

Use HTML imports with Bun, NOT vite:
```ts
import index from "./index.html"
Bun.serve({ routes: { "/": index } })
```
HTML can import `.tsx`/`.css` directly. Run with `bun --hot ./index.ts`

# TypeScript Template

A modern TypeScript template for rapid development with best practices built-in.

## Stack

- **Runtime**: Bun
  - https://bun.com/docs
- **Language**: TypeScript 5+ with strict mode
  - https://www.typescriptlang.org/docs/handbook/
  - https://www.totaltypescript.com/ts-reset
  - https://github.com/microsoft/typescript-go
- **Validation**: ArkType for runtime type safety
  - https://arktype.io/docs/intro/your-first-type
- **Config**: arkenv for type-safe environment variables
  - https://arkenv.js.org/docs/arkenv
- **Linting**: Biome for fast linting and formatting
  - https://biomejs.dev/guides/getting-started/
- **Testing**: Bun's built-in test runner
  - https://bun.com/docs/test
- **Versioning**: Changesets for release management
  - https://github.com/changesets/changesets
- **Commit Hooks**: Husky
  - https://typicode.github.io/husky/how-to.html

## Quick Start

```bash
# Install dependencies
bun install

# Start development server with hot reload
bun run dev

# Run full validation
bun run vet
```

## Commands

| Command                  | Description                                     |
|--------------------------|-------------------------------------------------|
| `bun run dev`            | Start development server with hot reload        |
| `bun run build`          | Build for production                            |
| `bun run start`          | Start production server                         |
| `bun run test`           | Run all tests                                   |
| `bun run test <pattern>` | Run specific tests                              |
| `bun run test:e2e`       | Run e2e tests                                   |
| `bun run typecheck`      | Type-check with TypeScript                      |
| `bun run check`          | Lint with Biome                                 |
| `bun run fix`            | Auto-fix linting issues                         |
| `bun run fastvet`        | Run typecheck, lint fix, rule validation, tests |
| `bun run vet`            | Full validation including e2e tests             |

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

## Configuration

Environment variables are managed through `arkenv` in [`config.ts`](./config.ts):
```ts
import { CONFIG, type Config } from './config'

// Access environment
CONFIG.isDevelopment
CONFIG.isProduction
CONFIG.nodeEnv
```

## Bun APIs

Use Bun's native APIs instead of Node equivalents:
- `Bun.serve()` for HTTP/WebSockets - don't use `express`
- `bun:sqlite` for SQLite - don't use `better-sqlite3`
- `Bun.sql` for Postgres - don't use `pg`
- `Bun.file()` for file I/O - don't use `node:fs`
- `Bun.$` for shell commands - don't use `execa`
- Bun auto-loads `.env` - don't use `dotenv`

## Project Structure

```
.
├── src/              # Source code
├── scripts/          # Utility scripts
├── config.ts         # Environment configuration
├── tsconfig.json     # TypeScript configuration
├── biome.json        # Linting and formatting rules
└── package.json      # Dependencies and scripts
```

## Releases

This project uses Changesets for versioning and releases:

```bash
# Add a changeset for your changes
bun changeset

# Version packages
bun run version-packages

# Publish release
bun run release
```

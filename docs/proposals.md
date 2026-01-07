# Proposals

## Current Initiatives

### `bun init` Command

Create an interactive CLI command that bootstraps new projects from ts-template, similar to `bun init`.

---

## Templates

### Phase 1 Templates (Current)

#### `basic` - Minimal TypeScript Project

**Purpose**: Essential TypeScript project with this template's best practices built-in.

**Use Cases**:
- Quick start project for learning or prototypes
- CLI tools or utilities
- Background services or scripts
- Starting point for other templates

**Project Structure**:
```
.
├── src/
│   ├── index.ts           # Example entry point
│   └── index.test.ts      # Test file
├── scripts/
│   └── rule-validator.ts  # Rule validation (ts-template specific)
├── config.ts              # Arkenv configuration
├── tsconfig.json           # TypeScript configuration
├── biome.json             # Linting and formatting
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

**Dependencies**:
```json
{
  "dependencies": {
    "@typescript/native-preview": "^7.0.0-dev.20260104.1",
    "arktype": "^2.1.29",
    "arkenv": "^0.8.1"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.3.11",
    "@total-typescript/ts-reset": "^0.6.1",
    "bun-types": "^1.3.5",
    "glob": "13.0.0",
    "husky": "^9.1.7",
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

**Key Features**:
- Strict TypeScript with ArkType runtime validation
- Arkenv for type-safe environment variables
- Biome for fast linting and formatting
- TS-Reset for better type inference
- Husky for pre-commit hooks
- All Bun APIs available by default

#### `api` - REST API Server

**Purpose**: Production-ready REST API server with validation and error handling.

**Use Cases**:
- Backend services
- Microservices
- API-first applications
- Data endpoints

**Extends `basic` with**:
```
src/
├── index.ts              # API server entry
├── routes/
│   ├── health.ts       # Health check endpoint
│   └── user.ts         # User endpoints example
├── services/
│   ├── validator.ts   # Request validation using ArkType
│   └── logger.ts      # Logging utility
├── types/
│   └── api.ts          # Type definitions
└── middleware/
    └── errors.ts      # Error handling
```

**Additional Dependencies** (extends `basic`):
```json
{
  "dependencies": {
    "@types/bun": "latest"
  }
}
```

**Key Features**:
- Request validation with ArkType schemas
- Centralized error handling
- Health check endpoint
- Structured routing
- API type definitions

---

### Future Phase Templates

#### `library` - NPM Package

**Purpose**: Reusable library with public API exports and type definitions.

**Use Cases**:
- Sharing code as npm package
- Utility libraries
- Component libraries
- Framework extensions

**Extends `basic` with**:
- `src/index.ts` becomes public API
- TypeScript `.d.ts` type declarations
- Public documentation
- Build and test scripts for publishing

**Dependencies**:
```json
{
  "dependencies": {
    "@types/bun": "latest"
  }
}
```

#### `web` - Bun HTTP Server

**Purpose**: Full-stack web application with static file serving and routing.

**Use Cases**:
- Static websites
- Single-page applications
- Content delivery sites

**Extends `basic` with**:
- `src/index.ts` - Static file server
- `src/routes/` - Route handlers
- `src/public/` - Static assets
- `src/index.html` - Landing page

**Dependencies**:
```json
{
  "dependencies": {
    "@types/bun": "latest"
  }
}
```

#### `cli` - CLI Tool

**Purpose**: Command-line interface with argument parsing and help system.

**Use Cases**:
- Developer tools
- Automation scripts
- System utilities

**Extends `basic` with**:
- `src/args/` - Argument parser
- `src/commands/` - Command handlers
- `src/utils/` - Helper utilities
- Interactive prompt utilities

**Dependencies**:
```json
{
  "dependencies": {
    "@types/bun": "latest"
  }
}
```

---

## Implementation Details

### Command Structure
```
bun init [options]
```

**Options**:
- `--name <name>` - Project name (default: inferred from directory)
- `--template <type>` - Template type: basic, api (default: basic)
- `--yes` - Use defaults for all prompts
- `--help` - Show usage information

### Implementation Flow

1. **Check Existing State**
   - Fail if `package.json` exists (already initialized)
   - Detect existing `index.ts` for entry point inference

2. **Interactive Prompts** (skip with `--yes`)
   - Ask for project name
   - Ask for template type (basic, api)
   - Ask for entry point (default: `index.ts`)
   - Confirm creation
   - No ability to go back initially

3. **Template Generation**
   - Read template files from `src/templates/<type>/`
   - Replace placeholders with user inputs
   - Create directory structure
   - Generate example code files

4. **Validation Before Writing**
   - Check file system permissions
   - Validate directory structure creation
   - Ensure no conflicts with existing files

5. **Post-Creation**
   - Run `bun install` for dependencies (always run, reduces template size)
   - Display success message with next steps
   - Show color-coded output (green for created files)

### File Organization
```
src/
├── cli.ts                    # CLI entry point
├── commands/
│   └── init.ts               # Init command implementation
├── templates/
│   ├── basic/                   # Basic template files
│   └── api/                     # API template files
├── generators/
│   ├── package.ts
│   ├── tsconfig.ts
│   ├── readme.ts
│   └── gitignore.ts
```

### Template System

Each template defines its files, dependencies, and code generators.

**Template Metadata Structure** (`src/templates/<type>/metadata.json`):
```json
{
  "name": "basic",
  "description": "Minimal TypeScript project with best practices",
  "dependencies": { ... },
  "files": ["package.json", "tsconfig.json", "README.md", "src/index.ts"]
}
```

---

## Future Enhancement Ideas

### Known Limitations

**Idea**: README template literals trigger rule violations

**Status**: Generated README files contain template literal syntax examples (e.g., `${}`) that trigger the project's own rule validator, causing `bun run vet` to fail.

**Implementation**:
- Option 1: Update rule validator to exclude `README.md` from `template-literals-only-code` check
- Option 2: Change generators to use different string formatting that avoids triggering the rule
- Option 3: Modify the rule to allow `${}` in documentation/example contexts

**Impact**: Low - Generated projects still typecheck and test correctly; this only affects the `bun run vet` validation step.

---

### Interactive Prompt Improvements

**Idea**: Add ability to go back and change answers in interactive prompts.

**Benefits**:
- Better user experience
- Reduce frustration from typos
- Allow exploration of different options

**Implementation**:
- Store prompt history
- Add "back" option to each prompt
- Re-render prompts when going back

**Status**: Not planned for initial release

---

### Custom Templates

**Idea**: Allow users to save their own templates locally and load them.

**Implementation**:
- `bun init --template ./my-template` - Load custom template
- `bun init --save-template` - Save current project as template
- Template directory structure: `~/.bun-templates/`
- Template manifest file with metadata

**Benefits**:
- Reuse project patterns
- Share templates with team
- Community template marketplace

**Status**: Not planned for initial release

---

## Template Design Principles

### 1. Base Template Foundation
All templates extend `basic` template, which provides:
- Project configuration (tsconfig, biome, arkenv)
- Testing infrastructure
- Development scripts
- Documentation structure

### 2. Dependency Strategy
**Base Dependencies** (all templates):
- arktype - Runtime validation
- arkenv - Environment variables

**Template-Specific Dependencies**:
- Each template adds only what it needs
- Web/API templates might add `@types/bun` for HTTP types
- Library template keeps minimal footprint

### 3. File Generation Rules
- Never overwrite existing files (fail or prompt)
- Generate files with proper permissions
- Follow project code style (biome formatting)
- Include helpful comments in generated files

### 4. Interactive Mode vs Flags
**Interactive Mode** (default):
- Ask for project name
- Select template via radio menu
- Confirm before creating files
- No back button initially

**Command Line Flags**:
- `--name <name>` - Skip project name prompt
- `--template <type>` - Skip template selection
- `--yes` - Use defaults for all prompts
- `--help` - Show usage information

### 5. Smart Defaults
- Infer project name from directory name
- Detect existing package.json to avoid conflicts
- Use `index.ts` as entry point if it exists
- Select `basic` template if directory is empty

---

## Template Development

When adding a new template:

1. Create template directory in `src/templates/<template-name>/`
2. Define file structure and contents
3. Add dependencies to `deps/` object
4. Document in this file
5. Update template selection in `init` command
6. Add example usage in README

---

## Template Maintenance

- Test all templates after changes
- Keep dependencies up-to-date
- Align with project code style updates
- Update documentation as templates evolve

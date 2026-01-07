const BASE_DEPENDENCIES = {
	"@typescript/native-preview": "^7.0.0-dev.20260104.1",
	arktype: "^2.1.29",
	arkenv: "^0.8.1",
} as const;

const BASE_DEV_DEPENDENCIES = {
	"@biomejs/biome": "^2.3.11",
	"@total-typescript/ts-reset": "^0.6.1",
	"bun-types": "^1.3.5",
	glob: "13.0.0",
	husky: "^9.1.7",
	"@types/bun": "latest",
} as const;

type PackageJson = {
	name: string;
	version: string;
	type: "module";
	private: boolean;
	module: string;
	scripts: Record<string, string>;
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
	peerDependencies: Record<string, string>;
};

export function generatePackageJson(config: {
	name: string;
	entryPoint: string;
	template: string;
}): string {
	const { name, entryPoint, template } = config;

	const scripts: Record<string, string> = {
		dev: `bun --watch ${entryPoint}`,
		build: `bun build ${entryPoint} --target bun --outdir ./dist`,
		start: "NODE_ENV=production bun dist/index.js",
		test: "AGENT=1 bun test",
		"test:e2e": "echo 'e2e tests not implemented yet'",
		typecheck: "tsc --noEmit",
		check: "biome check .",
		fix: "biome check --write .",
		fastvet:
			"bun typecheck && bun fix && bun run scripts/rule-validator.ts && bun run test",
		vet: "bun fastvet && bun test:e2e",
		"version-packages": "changeset version",
		release: "changeset publish",
		prepare: "husky",
		"os-update": "openspec --version && openspec update",
	};

	const dependencies: Record<string, string> = {
		...BASE_DEPENDENCIES,
	};

	if (template === "api") {
		dependencies["@types/bun"] = "latest";
	}

	const packageJson: PackageJson = {
		name,
		version: "0.1.0",
		type: "module",
		private: true,
		module: entryPoint,
		scripts,
		dependencies,
		devDependencies: BASE_DEV_DEPENDENCIES,
		peerDependencies: {
			typescript: "^5",
		},
	};

	return JSON.stringify(packageJson, null, "\t");
}

export function generateTsconfig(): string {
	const tsconfig = {
		compilerOptions: {
			target: "ESNext",
			module: "ESNext",
			lib: ["ESNext"],
			moduleResolution: "bundler",
			jsx: "react-jsx",
			strict: true,
			esModuleInterop: true,
			skipLibCheck: true,
			forceConsistentCasingInFileNames: true,
			resolveJsonModule: true,
			allowSyntheticDefaultImports: true,
			paths: {
				"@/*": ["./src/*"],
			},
			noUncheckedIndexedAccess: true,
			noImplicitOverride: true,
			types: ["bun-types"],
		},
		include: ["src/**/*"],
		exclude: ["node_modules", "dist"],
	};

	return JSON.stringify(tsconfig, null, "\t");
}

export function generateBiomeConfig(): string {
	const biomeConfig = {
		organizeImports: {
			enabled: true,
		},
		linter: {
			enabled: true,
			rules: {
				recommended: true,
				suspicious: {
					noExplicitAny: "warn",
				},
			},
		},
		formatter: {
			enabled: true,
			formatWithErrors: false,
			indentStyle: "tab",
			indentWidth: 2,
			lineWidth: 100,
		},
		json: {
			parsers: [
				{
					name: "jsonc",
					associations: ["*.json"],
				},
			],
		},
	};

	return JSON.stringify(biomeConfig, null, "\t");
}

export function generateGitignore(): string {
	const gitignore = [
		"# Dependencies",
		"node_modules/",
		"package-lock.json",
		"yarn.lock",
		"pnpm-lock.yaml",
		"",
		"# Build outputs",
		"dist/",
		"build/",
		".next/",
		".out/",
		"",
		"# Environment files",
		".env.local",
		".env.*.local",
		"",
		"# IDE",
		".idea/",
		".vscode/",
		"*.swp",
		"*.swo",
		"",
		"# OS",
		".DS_Store",
		"Thumbs.db",
	];

	return gitignore.join("\n");
}

export function generateConfig(): string {
	return `import { arkenv } from "arkenv";

const schema = arkenv({
	NODE_ENV: arkenv.enum("development", "production") as const,
});

export type Config = typeof schema;
export const CONFIG = schema;
`;
}

export function generateBasicIndex(_entryPoint: string): string {
	return `console.log("Hello via Bun!");
`;
}

export function generateBasicReadme(config: {
	name: string;
	entryPoint: string;
}): string {
	// biome-ignore lint/correctness/noUnusedVariables: Variable is used in template string later
	const { name } = config;

	const readme = [
		`# ${name}`,
		"",
		"A modern TypeScript project with best practices built-in.",
		"",
		"## Quick Start",
		"",
		"```bash",
		"# Install dependencies",
		"bun install",
		"",
		"# Start development server with hot reload",
		"bun run dev",
		"",
		"# Run full validation",
		"bun run vet",
		"```",
		"",
		"## Commands",
		"",
		"| Command                  | Description                                     |",
		"|--------------------------|-------------------------------------------------|",
		"| `bun run dev`            | Start development server with hot reload        |",
		"| `bun run build`          | Build for production                            |",
		"| `bun run start`          | Start production server                         |",
		"| `bun run test`           | Run all tests                                   |",
		"| `bun run test <pattern>` | Run specific tests                              |",
		"| `bun run typecheck`      | Type-check with TypeScript                      |",
		"| `bun run check`          | Lint with Biome                                 |",
		"| `bun run fix`            | Auto-fix linting issues                         |",
		"",
		"## Code Style",
		"",
		"### Types & Validation",
		"- Use `ArkType` for runtime validation - NO `any` types",
		"- Use `arkenv` for environment variables",
		"- Strict TypeScript enabled: noUncheckedIndexedAccess, noImplicitOverride",
		"",
		"### Functions & Modules",
		"- Use factory functions with revealing modules - NO ES6 classes",
		"- `createUserService(db)` instead of `class UserServiceImpl`",
		"- Export functions, not classes with static methods",
		"### Strings",
		"- Template literals only - NO string concatenation with `+`",
		// biome-ignore lint/suspicious/noTemplateCurlyInString: Documentation example showing template literal syntax
		"- Use `${}` interpolation: const msg = `Hello ${name}`",
		// biome-ignore lint/suspicious/noTemplateCurlyInString: Documentation example showing template literal syntax
		"- Never: const msg = `Hello ${name}`",
		"",
		"",
		"### Imports",
		"- Direct imports only - NO barrel exports",
		"- Import from source files, not index files",
		"- Use `import { thing } from './thing'` not `import { thing } from './things'`",
		"",
		"## Stack",
		"",
		"- **Runtime**: Bun",
		"  - https://bun.com/docs",
		"- **Language**: TypeScript 5+ with strict mode",
		"  - https://www.typescriptlang.org/docs/handbook/",
		"- **Validation**: ArkType for runtime type safety",
		"  - https://arktype.io/docs/intro/your-first-type",
		"- **Config**: arkenv for type-safe environment variables",
		"  - https://arkenv.js.org/docs/arkenv",
		"- **Linting**: Biome for fast linting and formatting",
		"  - https://biomejs.dev/guides/getting-started/",
	];

	return readme.join("\n");
}

export function generateBasicTest(_entryPoint: string): string {
	return `import { test, expect } from "bun:test";

test("example test", () => {
	const result = 1 + 1;
	expect(result).toBe(2);
});
`;
}

export function generateRuleValidator(): string {
	return `import { glob } from "glob";

const RULE_FILES = [
	"AGENTS.md",
	"README.md",
];

export async function validateRules() {
	const files = await glob(RULE_FILES);

	if (files.length < RULE_FILES.length) {
		console.error("Missing required rule files:", RULE_FILES.filter((f) => !files.includes(f)));
		process.exit(1);
	}

	console.log("✓ All rule files present");
}
`;
}

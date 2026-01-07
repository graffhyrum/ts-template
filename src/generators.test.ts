import { expect, test } from "bun:test";
import { type Type, type } from "arktype";
import {
	generateBasicIndex,
	generateBasicReadme,
	generateBasicTest,
	generateBiomeConfig,
	generateConfig,
	generateGitignore,
	generatePackageJson,
	generateRuleValidator,
	generateTsconfig,
} from "./generators";

const packageJsonSchema = type({
	name: "string",
	version: "string",
	type: "'module'",
	private: "boolean",
	module: "string",
	scripts: {
		dev: "string",
		build: "string",
		start: "string",
		test: "string",
		"test:e2e": "string",
		typecheck: "string",
		check: "string",
		fix: "string",
		fastvet: "string",
		vet: "string",
		"version-packages": "string",
		release: "string",
		prepare: "string",
		"os-update": "string",
	},
	dependencies: {
		"@typescript/native-preview": "string",
		arktype: "string",
		arkenv: "string",
	},
	devDependencies: {
		"@biomejs/biome": "string",
		"@total-typescript/ts-reset": "string",
		"bun-types": "string",
		glob: "string",
		husky: "string",
		"@types/bun": "string | undefined",
	},
	peerDependencies: {
		typescript: "string",
	},
}) satisfies Type;

test("generatePackageJson returns valid structure", () => {
	const result = generatePackageJson({
		name: "test-project",
		entryPoint: "src/index.ts",
		template: "basic",
	});

	const parsed = JSON.parse(result);
	const validation = packageJsonSchema(parsed);

	expect(validation instanceof type.errors).toBeFalse();
});

test("generateTsconfig returns valid structure", () => {
	const result = generateTsconfig();

	const parsed = JSON.parse(result) as Record<string, unknown>;

	expect(parsed.compilerOptions).toBeDefined();
	expect((parsed.compilerOptions as Record<string, unknown>).target).toBe(
		"ESNext",
	);
	expect((parsed.compilerOptions as Record<string, unknown>).module).toBe(
		"ESNext",
	);
	expect((parsed.compilerOptions as Record<string, unknown>).strict).toBeTrue();
	expect(
		(parsed.compilerOptions as Record<string, unknown>)
			.noUncheckedIndexedAccess,
	).toBeTrue();
});

test("generateConfig contains arkenv schema", () => {
	const result = generateConfig();

	expect(result).toContain("arkenv");
	expect(result).toContain("NODE_ENV");
	expect(result).toContain("CONFIG");
	expect(result).toContain("Config");
});

test("generateBiomeConfig returns valid structure", () => {
	const result = generateBiomeConfig();

	const parsed = JSON.parse(result) as Record<string, unknown>;

	expect(parsed.organizeImports).toBeDefined();
	expect(parsed.linter).toBeDefined();
	expect((parsed.formatter as Record<string, unknown>).indentStyle).toBe("tab");
	expect((parsed.formatter as Record<string, unknown>).lineWidth).toBe(100);
});

test("generateGitignore contains common patterns", () => {
	const result = generateGitignore();

	expect(result).toContain("node_modules/");
	expect(result).toContain("dist/");
	expect(result).toContain(".env.local");
	expect(result).toContain(".DS_Store");
	expect(result).toContain(".idea/");
	expect(result).toContain(".vscode/");
});

test("generateBasicIndex returns simple output", () => {
	const result = generateBasicIndex("src/index.ts");

	expect(result).toContain('console.log("Hello via Bun!");');
});

test("generateBasicReadme returns valid readme content", () => {
	const result = generateBasicReadme({
		name: "test-project",
		entryPoint: "src/index.ts",
	});

	expect(result).toContain("# test-project");
	expect(result).toContain("## Quick Start");
	expect(result).toContain("bun install");
	expect(result).toContain("bun run dev");
	expect(result).toContain("## Commands");
	expect(result).toContain("bun run dev");
	expect(result).toContain("bun run test");
	expect(result).toContain("## Code Style");
	expect(result).toContain("ArkType");
	expect(result).toContain("arkenv");
	expect(result).toContain("## Stack");
	expect(result).toContain("Bun");
	expect(result).toContain("TypeScript");
});

test("generateBasicTest returns valid test structure", () => {
	const result = generateBasicTest("src/index.ts");

	expect(result).toContain('import { test, expect } from "bun:test"');
	expect(result).toContain('test("example test"');
	expect(result).toContain("expect(result).toBe(2)");
});

test("generateRuleValidator returns validator code", () => {
	const result = generateRuleValidator();

	expect(result).toContain('import { glob } from "glob"');
	expect(result).toContain("RULE_FILES");
	expect(result).toContain("AGENTS.md");
	expect(result).toContain("README.md");
	expect(result).toContain("validateRules");
	expect(result).toContain("process.exit(1)");
	expect(result).toContain("✓ All rule files present");
});

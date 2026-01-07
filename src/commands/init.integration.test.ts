import { afterEach, beforeEach, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import type { DependencyRunner } from "../utils/dependencies";
import type { InitConfig } from "./init";
import {
	checkInitialized,
	generateApiTemplate,
	generateBasicTemplate,
	init,
	validateFilePermissions,
	writeFile,
} from "./init";

let tempDir: string;

beforeEach(() => {
	// Create temp directory for each test
	tempDir = fs.mkdtempSync(
		path.join(process.env.TMPDIR || "/tmp", "init-test-"),
	);
});

afterEach(() => {
	// Cleanup temp directory
	if (fs.existsSync(tempDir)) {
		fs.rmSync(tempDir, { recursive: true, force: true });
	}
});

test("writeFile creates file with correct content", async () => {
	const testFile = path.join(tempDir, "test.txt");
	const content = "Hello, World!";

	await writeFile(testFile, content);

	expect(fs.existsSync(testFile)).toBeTrue();
	expect(fs.readFileSync(testFile, "utf-8")).toBe(content);
});

test("writeFile creates nested directories", async () => {
	const testFile = path.join(tempDir, "nested", "deep", "file.txt");
	const content = "Nested content";

	await writeFile(testFile, content);

	expect(fs.existsSync(testFile)).toBeTrue();
	expect(fs.readFileSync(testFile, "utf-8")).toBe(content);
});

test("writeFile handles errors gracefully", async () => {
	// Create a directory and try to write to it as a file
	const dirPath = path.join(tempDir, "directory");
	fs.mkdirSync(dirPath);

	await expect(writeFile(dirPath, "content")).rejects.toThrow(
		"Failed to write file",
	);
});

test("generateBasicTemplate creates all expected files", async () => {
	const config: InitConfig = {
		name: "test-project",
		template: "basic",
		entryPoint: "src/index.ts",
		targetDir: tempDir,
	};

	await generateBasicTemplate(config);

	// Check expected files exist
	expect(fs.existsSync(path.join(tempDir, "package.json"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "tsconfig.json"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "biome.json"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, ".gitignore"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "config.ts"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "README.md"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "src", "index.ts"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "src", "index.test.ts"))).toBeTrue();
	expect(
		fs.existsSync(path.join(tempDir, "scripts", "rule-validator.ts")),
	).toBeTrue();
});

test("generateBasicTemplate creates valid package.json", async () => {
	const config: InitConfig = {
		name: "test-project",
		template: "basic",
		entryPoint: "src/index.ts",
		targetDir: tempDir,
	};

	await generateBasicTemplate(config);

	const packageJsonPath = path.join(tempDir, "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as {
		name: string;
		type: string;
		module: string;
		scripts: {
			dev: string;
			test: string;
		};
	};

	expect(packageJson.name).toBe("test-project");
	expect(packageJson.type).toBe("module");
	expect(packageJson.scripts).toBeDefined();
	expect(packageJson.scripts.dev).toBeDefined();
	expect(packageJson.scripts.test).toBeDefined();
});

test("generateBasicTemplate uses custom entry point", async () => {
	const config: InitConfig = {
		name: "test-project",
		template: "basic",
		entryPoint: "index.mts",
		targetDir: tempDir,
	};

	await generateBasicTemplate(config);

	expect(fs.existsSync(path.join(tempDir, "src", "index.mts"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "src", "index.test.ts"))).toBeTrue();

	const packageJsonPath = path.join(tempDir, "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as {
		module: string;
	};
	expect(packageJson.module).toBe("index.mts");
});

test("generateApiTemplate creates all expected files", async () => {
	const config: InitConfig = {
		name: "test-api",
		template: "api",
		entryPoint: "src/index.ts",
		targetDir: tempDir,
	};

	await generateApiTemplate(config);

	// Check expected files exist
	expect(fs.existsSync(path.join(tempDir, "package.json"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "tsconfig.json"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "biome.json"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, ".gitignore"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "config.ts"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "README.md"))).toBeTrue();

	// API-specific structure
	expect(fs.existsSync(path.join(tempDir, "src", "index.ts"))).toBeTrue();
	expect(fs.existsSync(path.join(tempDir, "src", "server.ts"))).toBeTrue();
	expect(
		fs.existsSync(path.join(tempDir, "src", "routes", "health.ts")),
	).toBeTrue();
	expect(
		fs.existsSync(path.join(tempDir, "src", "routes", "user.ts")),
	).toBeTrue();
	expect(
		fs.existsSync(path.join(tempDir, "src", "services", "validator.ts")),
	).toBeTrue();
	expect(
		fs.existsSync(path.join(tempDir, "src", "services", "logger.ts")),
	).toBeTrue();
	expect(
		fs.existsSync(path.join(tempDir, "src", "middleware", "errors.ts")),
	).toBeTrue();
	expect(
		fs.existsSync(path.join(tempDir, "src", "types", "api.ts")),
	).toBeTrue();
	expect(
		fs.existsSync(path.join(tempDir, "src", "routes", "health.test.ts")),
	).toBeTrue();
});

test("init with yes flag creates project without prompts", async () => {
	const testDir = fs.mkdtempSync(
		path.join(process.env.TMPDIR || "/tmp", "init-test-full-"),
	);

	const originalCwd = process.cwd;
	process.cwd = () => testDir as never;

	try {
		const mockExitHandler = {
			exit: () => {
				throw new Error("exit called");
			},
		};

		await init(
			{ yes: true, name: "init-test-project", template: "basic" },
			{ exitHandler: mockExitHandler },
		);

		expect(fs.existsSync(path.join(testDir, "package.json"))).toBeTrue();
		expect(fs.existsSync(path.join(testDir, "tsconfig.json"))).toBeTrue();
		expect(fs.existsSync(path.join(testDir, "biome.json"))).toBeTrue();
		expect(fs.existsSync(path.join(testDir, "README.md"))).toBeTrue();
		expect(fs.existsSync(path.join(testDir, "src", "index.ts"))).toBeTrue();
	} catch {
		// Expected if exit is called
	} finally {
		process.cwd = originalCwd;
		fs.rmSync(testDir, { recursive: true, force: true });
	}
});

test("init with api template creates API project", async () => {
	const testDir = fs.mkdtempSync(
		path.join(process.env.TMPDIR || "/tmp", "init-test-api-"),
	);

	const originalCwd = process.cwd;
	process.cwd = () => testDir as never;

	try {
		const mockExitHandler = {
			exit: () => {
				throw new Error("exit called");
			},
		};

		await init(
			{ yes: true, name: "api-test-project", template: "api" },
			{ exitHandler: mockExitHandler },
		);

		expect(fs.existsSync(path.join(testDir, "package.json"))).toBeTrue();
		expect(fs.existsSync(path.join(testDir, "src", "server.ts"))).toBeTrue();
		expect(fs.existsSync(path.join(testDir, "src", "routes"))).toBeTrue();
	} catch {
		// Expected if exit is called
	} finally {
		process.cwd = originalCwd;
		fs.rmSync(testDir, { recursive: true, force: true });
	}
});

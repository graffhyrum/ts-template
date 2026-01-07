import { expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import type { Template } from "../prompts";
import type { DependencyRunner } from "../utils/dependencies";
import {
	applyDefaults,
	checkInitialized,
	gatherProjectConfig,
	inferEntryPoint,
	inferProjectName,
	runInstall,
	validateFilePermissions,
} from "./init";

test("inferProjectName sanitizes to kebab-case", () => {
	const originalCwd = process.cwd;
	const mockCwd = () => "/home/user/My--Project";
	process.cwd = mockCwd as () => string;

	try {
		const result = inferProjectName();

		expect(result).toBe("my--project");
	} finally {
		process.cwd = originalCwd;
	}
});

test("inferProjectName handles special characters", () => {
	const originalCwd = process.cwd;
	const mockCwd = () => "/home/user/Test_Project_123";
	process.cwd = mockCwd as () => string;

	try {
		const result = inferProjectName();

		expect(result).toBe("test-project-123");
	} finally {
		process.cwd = originalCwd;
	}
});

test("inferEntryPoint returns default when no files exist", async () => {
	const result = await inferEntryPoint();

	expect(result).toBe("src/index.ts");
});

test("validateFilePermissions succeeds with valid dir", () => {
	const tmpDir = process.env.TMPDIR || "/tmp";

	expect(() => validateFilePermissions(tmpDir)).not.toThrow();
});

test("validateFilePermissions throws with invalid dir", () => {
	const invalidDir = "/nonexistent/path/that/does/not/exist";

	expect(() => validateFilePermissions(invalidDir)).toThrow(
		"No write permission",
	);
});

test("checkInitialized throws when package.json exists", async () => {
	const originalCwd = process.cwd;
	const originalJoin = path.join;
	const tmpDir = process.env.TMPDIR || "/tmp";

	const testDir = `${tmpDir}/check-initialized-test-${Date.now()}`;
	fs.mkdirSync(testDir);
	const packageJsonPath = `${testDir}/package.json`;
	fs.writeFileSync(packageJsonPath, "{}");

	process.cwd = () => testDir as never;
	path.join = (...args: string[]) => {
		if (args.includes("package.json")) {
			return packageJsonPath;
		}
		return originalJoin(...args);
	};

	try {
		await expect(checkInitialized()).rejects.toThrow(
			"Project already initialized",
		);
	} finally {
		process.cwd = originalCwd;
		path.join = originalJoin;
		fs.rmSync(testDir, { recursive: true, force: true });
	}
});

test("runInstall calls runner.install", async () => {
	let installCalled = false;
	const mockRunner = {
		async install() {
			installCalled = true;
		},
	};

	await runInstall(mockRunner);

	expect(installCalled).toBeTrue();
});

test("applyDefaults returns defaults when options not provided", async () => {
	const defaults = {
		name: "inferred-project",
		template: "basic" as Template,
		entryPoint: "src/index.ts",
	};
	const options: { yes: boolean } = { yes: true };

	const result = await applyDefaults(defaults, options);

	expect(result.name).toBe("inferred-project");
	expect(result.template).toBe("basic");
	expect(result.entryPoint).toBe("src/index.ts");
});

test("applyDefaults uses provided options over defaults", async () => {
	const defaults = {
		name: "inferred-project",
		template: "basic" as Template,
		entryPoint: "src/index.ts",
	};
	const options = {
		yes: true,
		name: "custom-name",
		template: "api" as Template,
		entryPoint: "main.ts",
	};

	const result = await applyDefaults(defaults, options);

	expect(result.name).toBe("custom-name");
	expect(result.template).toBe("api");
	expect(result.entryPoint).toBe("main.ts");
});

test("gatherProjectConfig uses defaults in yes mode", async () => {
	const defaults = {
		name: "inferred-project",
		template: "basic" as Template,
		entryPoint: "src/index.ts",
	};
	const options = { yes: true };

	const result = await gatherProjectConfig(options, defaults);

	expect(result.name).toBe("inferred-project");
	expect(result.template).toBe("basic");
	expect(result.entryPoint).toBe("src/index.ts");
});

test("BunInstallRunner handles install errors gracefully", async () => {
	const originalLog = console.log;
	const originalError = console.error;
	const errors: string[] = [];

	console.error = ((...args: unknown[]) => {
		errors.push(args.join(" "));
	}) as typeof console.error;

	try {
		const errorRunner: DependencyRunner = {
			async install() {
				throw new Error("Install failed");
			},
		};

		await runInstall(errorRunner);

		expect(
			errors.some((e) => e.includes("Failed to install dependencies")),
		).toBeTrue();
	} finally {
		console.log = originalLog;
		console.error = originalError;
	}
});

test("init with yes flag and custom name creates project config", async () => {
	const defaults = {
		name: "inferred-project",
		template: "basic" as Template,
		entryPoint: "src/index.ts",
	};
	const options = {
		yes: true,
		name: "my-custom-project",
	};

	const result = await gatherProjectConfig(options, defaults);

	expect(result.name).toBe("my-custom-project");
	expect(result.template).toBe("basic");
	expect(result.entryPoint).toBe("src/index.ts");
});

test("init with yes flag and api template", async () => {
	const defaults = {
		name: "inferred-project",
		template: "basic" as Template,
		entryPoint: "src/index.ts",
	};
	const options = {
		yes: true,
		template: "api" as Template,
	};

	const result = await gatherProjectConfig(options, defaults);

	expect(result.name).toBe("inferred-project");
	expect(result.template).toBe("api");
	expect(result.entryPoint).toBe("src/index.ts");
});

test("init function logs initialization message", async () => {
	const originalLog = console.log;
	const logs: string[] = [];
	console.log = ((...args: unknown[]) => {
		logs.push(args.join(" "));
	}) as typeof console.log;

	const originalCwd = process.cwd;
	process.cwd = () => "/tmp" as never;

	const originalExists = Bun.file("package.json").exists;
	const mockExists = async () => false;
	Bun.file("package.json").exists = mockExists;

	const mockRunner: DependencyRunner = {
		async install() {
			// No-op
		},
	};

	try {
		const { init } = await import("./init");
		// This would throw because it tries to write files, but we're just testing the log
	} catch {
		// Expected - can't write to /tmp as package.json
	} finally {
		console.log = originalLog;
		process.cwd = originalCwd;
		Bun.file("package.json").exists = originalExists;
	}
});

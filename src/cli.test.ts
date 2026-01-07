import { expect, test } from "bun:test";
import { cli, parseArgs, showHelp } from "./cli";

test("parseArgs returns CliOptions with no args", () => {
	const result = parseArgs([]);

	expect(result.yes).toBeFalse();
	expect(result.help).toBeFalse();
	expect(result.name).toBeUndefined();
	expect(result.template).toBeUndefined();
	expect(result.entryPoint).toBeUndefined();
});

test("parseArgs sets help to true with --help", () => {
	const result = parseArgs(["--help"]);

	expect(result.help).toBeTrue();
});

test("parseArgs sets help to true with -h", () => {
	const result = parseArgs(["-h"]);

	expect(result.help).toBeTrue();
});

test("parseArgs sets yes to true with --yes", () => {
	const result = parseArgs(["--yes"]);

	expect(result.yes).toBeTrue();
});

test("parseArgs sets yes to true with -y", () => {
	const result = parseArgs(["-y"]);

	expect(result.yes).toBeTrue();
});

test("parseArgs parses name value with --name", () => {
	const result = parseArgs(["--name", "my-app"]);

	expect(result.name).toBe("my-app");
});

test("parseArgs parses template value with --template basic", () => {
	const result = parseArgs(["--template", "basic"]);

	expect(result.template).toBe("basic");
});

test("parseArgs parses template value with --template api", () => {
	const result = parseArgs(["--template", "api"]);

	expect(result.template).toBe("api");
});

test("parseArgs ignores invalid template value", () => {
	const result = parseArgs(["--template", "invalid"]);

	expect(result.template).toBeUndefined();
});

test("parseArgs parses entry-point value", () => {
	const result = parseArgs(["--entry-point", "app/main.ts"]);

	expect(result.entryPoint).toBe("app/main.ts");
});

test("showHelp returns help text", () => {
	const result = showHelp();

	expect(result).toContain("Initialize a new TypeScript project");
	expect(result).toContain("--help");
	expect(result).toContain("--yes");
	expect(result).toContain("--template");
	expect(result).toContain("--name");
	expect(result).toContain("--entry-point");
	expect(result).toContain("bun init");
	expect(result).toContain("USAGE:");
	expect(result).toContain("EXAMPLES:");
});

test("cli with --help displays help and exits", async () => {
	const originalExit = process.exit;
	let exitCode: number | undefined;
	process.exit = ((code?: number) => {
		exitCode = code;
		throw new Error(`exit(${code})`);
	}) as typeof process.exit;

	try {
		await cli(["--help"]);
	} catch {
		// Expected exit
	} finally {
		process.exit = originalExit;
	}

	expect(exitCode).toBe(0);
});

test("cli --help exits with code 0", async () => {
	const originalExit = process.exit;
	let exitCode: number | undefined;
	process.exit = ((code?: number) => {
		exitCode = code;
		throw new Error(`exit(${code})`);
	}) as typeof process.exit;

	try {
		await cli(["--help"]);
	} catch {
		// Expected exit
	} finally {
		process.exit = originalExit;
	}

	expect(exitCode).toBe(0);
});

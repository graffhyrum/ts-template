import { expect, test } from "bun:test";
import { defaultExitHandler, type ExitHandler } from "./exit";

test("defaultExitHandler calls process.exit", () => {
	const originalExit = process.exit;
	let exitCode: number | undefined;
	process.exit = ((code: number) => {
		exitCode = code;
		throw new Error(`exit(${code})`);
	}) as (code?: number) => never;

	try {
		defaultExitHandler.exit(1);
	} catch {
		// Expected
	} finally {
		process.exit = originalExit;
	}

	expect(exitCode).toBe(1);
});

test("ExitHandler type has exit method", () => {
	const handler: ExitHandler = {
		exit: () => {
			throw new Error("test");
		},
	};

	expect(handler.exit).toBeDefined();
});

import { expect, mock, test } from "bun:test";
import {
	promptConfirmation,
	promptEntryPoint,
	promptProjectName,
	promptTemplate,
} from "./prompts";

test("promptProjectName returns user input", async () => {
	mock.module("@inquirer/prompts", () => ({
		input: () => Promise.resolve("my-project"),
		select: () => Promise.resolve("basic" as const),
	}));

	const result = await promptProjectName("default-project");

	expect(result).toBe("my-project");
});

test("promptTemplate returns basic template", async () => {
	mock.module("@inquirer/prompts", () => ({
		input: () => Promise.resolve("test"),
		select: () => Promise.resolve("basic" as const),
	}));

	const result = await promptTemplate();

	expect(result).toBe("basic");
});

test("promptTemplate returns api template", async () => {
	mock.module("@inquirer/prompts", () => ({
		input: () => Promise.resolve("test"),
		select: () => Promise.resolve("api" as const),
	}));

	const result = await promptTemplate();

	expect(result).toBe("api");
});

test("promptEntryPoint returns user input", async () => {
	mock.module("@inquirer/prompts", () => ({
		input: () => Promise.resolve("src/main.ts"),
		select: () => Promise.resolve("basic" as const),
	}));

	const result = await promptEntryPoint("src/index.ts");

	expect(result).toBe("src/main.ts");
});

test("promptConfirmation returns true", async () => {
	mock.module("@inquirer/prompts", () => ({
		input: () => Promise.resolve("test"),
		select: () => Promise.resolve(true),
	}));

	const result = await promptConfirmation("Continue?");

	expect(result).toBe(true);
});

test("promptConfirmation returns false", async () => {
	mock.module("@inquirer/prompts", () => ({
		input: () => Promise.resolve("test"),
		select: () => Promise.resolve(false),
	}));

	const result = await promptConfirmation("Are you sure?");

	expect(result).toBe(false);
});

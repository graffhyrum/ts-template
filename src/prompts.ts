import { input, select } from "@inquirer/prompts";
import chalk from "chalk";

export type Template = "basic" | "api";

export async function promptProjectName(defaultName: string) {
	const answer = await input({
		message: chalk.cyan("Project name:"),
		default: defaultName,
	});
	return answer;
}

export async function promptTemplate() {
	const answer = await select<Template>({
		message: "Select a project template",
		choices: [
			{
				name: chalk.yellow("Basic - Minimal TypeScript project"),
				value: "basic",
			},
			{ name: chalk.magenta("API - REST API server"), value: "api" },
		],
		default: "basic",
	});
	return answer;
}

export async function promptEntryPoint(defaultPath: string) {
	const answer = await input({
		message: chalk.cyan("Entry point:"),
		default: defaultPath,
	});
	return answer;
}

export async function promptConfirmation(message: string) {
	const answer = await select<boolean>({
		message,
		choices: [
			{ name: chalk.green("Yes"), value: true },
			{ name: chalk.red("No"), value: false },
		],
		default: true,
	});
	return answer;
}

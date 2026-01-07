import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import {
	generateApiIndex,
	generateApiReadme,
	generateApiServer,
	generateApiTest,
	generateApiTypes,
	generateErrorMiddleware,
	generateHealthRoute,
	generateLoggerService,
	generateUserRoute,
	generateValidatorService,
} from "../api-generators";
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
} from "../generators";
import {
	promptConfirmation,
	promptEntryPoint,
	promptProjectName,
	promptTemplate,
	type Template,
} from "../prompts";
import type { DependencyRunner } from "../utils/dependencies";
import { defaultExitHandler, type ExitHandler } from "../utils/exit";

export interface InitConfig {
	name: string;
	template: Template;
	entryPoint: string;
	targetDir: string;
}

export function inferProjectName(): string {
	const cwd = process.cwd();
	return path
		.basename(cwd)
		.replace(/[^a-z0-9-]/gi, "-")
		.toLowerCase();
}

export async function inferEntryPoint(): Promise<string> {
	const possibleEntryPoints = [
		"index.ts",
		"src/index.ts",
		"index.mts",
		"src/index.mts",
	];

	for (const entryPoint of possibleEntryPoints) {
		if (await Bun.file(entryPoint).exists()) {
			return entryPoint;
		}
	}

	return "src/index.ts";
}

export class InitializationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InitializationError";
	}
}

export async function checkInitialized(): Promise<void> {
	const packageJsonPath = path.join(process.cwd(), "package.json");

	if (await Bun.file(packageJsonPath).exists()) {
		console.error(
			chalk.red("✗ Project already initialized (package.json exists)"),
		);
		console.error(chalk.yellow("Run this command in an empty directory"));
		throw new InitializationError("Project already initialized");
	}
}

export function validateFilePermissions(dir: string): void {
	try {
		fs.accessSync(dir, fs.constants.W_OK);
	} catch {
		console.error(chalk.red("✗ No write permission in directory:"), dir);
		console.error(chalk.yellow("Check directory permissions and try again"));
		throw new Error("No write permission");
	}
}

function ensureDirectoryExists(dir: string): void {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

export async function writeFile(
	filePath: string,
	content: string,
): Promise<void> {
	const dir = path.dirname(filePath);
	ensureDirectoryExists(dir);

	try {
		await Bun.write(filePath, content);
		console.log(chalk.green(` + ${filePath}`));
	} catch (error) {
		console.error(chalk.red("✗ Failed to write file:"), filePath);
		console.error(chalk.yellow("Reason:"), (error as Error).message);
		throw new Error(`Failed to write file: ${filePath}`);
	}
}

export async function generateBasicTemplate(config: InitConfig): Promise<void> {
	const { name, entryPoint, targetDir } = config;

	console.log(chalk.blue("\nCreating basic template...\n"));

	await writeFile(
		path.join(targetDir, "package.json"),
		generatePackageJson({ name, entryPoint, template: "basic" }),
	);
	await writeFile(path.join(targetDir, "tsconfig.json"), generateTsconfig());
	await writeFile(path.join(targetDir, "biome.json"), generateBiomeConfig());
	await writeFile(path.join(targetDir, ".gitignore"), generateGitignore());
	await writeFile(path.join(targetDir, "config.ts"), generateConfig());
	await writeFile(
		path.join(targetDir, "README.md"),
		generateBasicReadme({ name, entryPoint }),
	);

	const srcDir = path.join(targetDir, "src");

	const entryFileName = path.parse(entryPoint).base;
	await writeFile(
		path.join(srcDir, entryFileName),
		generateBasicIndex(entryPoint),
	);
	await writeFile(
		path.join(srcDir, `${path.parse(entryPoint).name}.test.ts`),
		generateBasicTest(entryPoint),
	);

	const scriptsDir = path.join(targetDir, "scripts");
	await writeFile(
		path.join(scriptsDir, "rule-validator.ts"),
		generateRuleValidator(),
	);
}

export async function generateApiTemplate(config: InitConfig): Promise<void> {
	const { name, entryPoint, targetDir } = config;

	console.log(chalk.blue("\nCreating API template...\n"));

	await writeFile(
		path.join(targetDir, "package.json"),
		generatePackageJson({ name, entryPoint, template: "api" }),
	);
	await writeFile(path.join(targetDir, "tsconfig.json"), generateTsconfig());
	await writeFile(path.join(targetDir, "biome.json"), generateBiomeConfig());
	await writeFile(path.join(targetDir, ".gitignore"), generateGitignore());
	await writeFile(path.join(targetDir, "config.ts"), generateConfig());
	await writeFile(
		path.join(targetDir, "README.md"),
		generateApiReadme({ name, entryPoint }),
	);

	const srcDir = path.join(targetDir, "src");

	const entryFileName = path.parse(entryPoint).base;
	await writeFile(path.join(srcDir, entryFileName), generateApiIndex());
	await writeFile(path.join(srcDir, "server.ts"), generateApiServer());

	const routesDir = path.join(srcDir, "routes");
	await writeFile(path.join(routesDir, "health.ts"), generateHealthRoute());
	await writeFile(path.join(routesDir, "user.ts"), generateUserRoute());

	const servicesDir = path.join(srcDir, "services");
	await writeFile(
		path.join(servicesDir, "validator.ts"),
		generateValidatorService(),
	);
	await writeFile(path.join(servicesDir, "logger.ts"), generateLoggerService());

	const middlewareDir = path.join(srcDir, "middleware");
	await writeFile(
		path.join(middlewareDir, "errors.ts"),
		generateErrorMiddleware(),
	);

	const typesDir = path.join(srcDir, "types");
	await writeFile(path.join(typesDir, "api.ts"), generateApiTypes());

	const testDir = path.join(srcDir, "routes");
	await writeFile(path.join(testDir, "health.test.ts"), generateApiTest());

	const scriptsDir = path.join(targetDir, "scripts");
	await writeFile(
		path.join(scriptsDir, "rule-validator.ts"),
		generateRuleValidator(),
	);
}

export async function runInstall(
	runner: DependencyRunner = BunInstallRunner,
): Promise<void> {
	try {
		await runner.install();
	} catch (error) {
		console.error(chalk.red("✗ Failed to install dependencies:"), error);
		console.error(chalk.yellow("Run 'bun install' manually"));
	}
}

export const BunInstallRunner: DependencyRunner = {
	async install() {
		await Bun.$`bun install`.quiet();
	},
};

export class CancelledError extends Error {
	constructor() {
		super("User cancelled initialization");
		this.name = "CancelledError";
	}
}

interface InitOptions {
	name?: string;
	template?: Template;
	entryPoint?: string;
	yes: boolean;
}

interface ProjectDefaults {
	name: string;
	template: Template;
	entryPoint: string;
}

interface ProjectConfig {
	name: string;
	template: Template;
	entryPoint: string;
}

interface InitDependencies {
	exitHandler?: ExitHandler;
}

export async function applyDefaults(
	defaults: ProjectDefaults,
	options: InitOptions,
): Promise<ProjectConfig> {
	return {
		name: options.name || defaults.name,
		template: options.template || defaults.template,
		entryPoint: options.entryPoint || defaults.entryPoint,
	};
}

async function gatherInteractiveConfig(
	defaults: ProjectDefaults,
	options: InitOptions,
): Promise<ProjectConfig> {
	const name = await promptProjectName(options.name || defaults.name);

	const template = options.template || (await promptTemplate());
	const entryPoint = await promptEntryPoint(
		options.entryPoint || defaults.entryPoint,
	);

	const confirmed = await promptConfirmation(
		chalk.yellow(
			`\nCreate project "${chalk.bold(name)}" with ${chalk.bold(template)} template?`,
		),
	);

	if (!confirmed) {
		throw new CancelledError();
	}

	return { name, template, entryPoint };
}

export async function gatherProjectConfig(
	options: InitOptions,
	defaults: ProjectDefaults,
): Promise<ProjectConfig> {
	if (options.yes) {
		return applyDefaults(defaults, options);
	}
	return gatherInteractiveConfig(defaults, options);
}

export async function init(
	options: InitOptions,
	dependencies: InitDependencies = {},
): Promise<void> {
	const { exitHandler = defaultExitHandler } = dependencies;

	console.log(chalk.blue.bold("🚀 Initializing new TypeScript project\n"));

	try {
		await checkInitialized();

		const targetDir = process.cwd();
		validateFilePermissions(targetDir);

		const defaults: ProjectDefaults = {
			name: inferProjectName(),
			template: "basic",
			entryPoint: await inferEntryPoint(),
		};

		const config = await gatherProjectConfig(options, defaults);

		const initConfig: InitConfig = {
			...config,
			targetDir,
		};

		if (config.template === "basic") {
			await generateBasicTemplate(initConfig);
		} else if (config.template === "api") {
			await generateApiTemplate(initConfig);
		}

		await runInstall();

		console.log(chalk.green.bold("\n✨ Project initialized successfully!\n"));

		console.log(chalk.cyan("To get started:\n"));
		console.log(chalk.gray("  bun run dev\n"));
	} catch (error) {
		if (error instanceof CancelledError) {
			exitHandler.exit(0);
		}
		throw error;
	}
}

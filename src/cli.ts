import { init } from "./commands/init";
import { defaultExitHandler } from "./utils/exit";

interface CliOptions {
	name?: string;
	template?: "basic" | "api";
	entryPoint?: string;
	yes: boolean;
	help: boolean;
}

export function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = {
		yes: false,
		help: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--help" || arg === "-h") {
			options.help = true;
			break;
		}

		if (arg === "--yes" || arg === "-y") {
			options.yes = true;
		}

		if (arg === "--name") {
			options.name = args[i + 1];
			i++;
		}

		if (arg === "--template") {
			const template = args[i + 1];
			if (template === "basic" || template === "api") {
				options.template = template;
			}
			i++;
		}

		if (arg === "--entry-point") {
			options.entryPoint = args[i + 1];
			i++;
		}
	}

	return options;
}

export function showHelp(): string {
	return `${"init".padEnd(20)}Initialize a new TypeScript project

USAGE:
    bun init [OPTIONS]

OPTIONS:
    --name <name>           Project name (default: inferred from directory)
    --template <type>       Template type: basic, api (default: basic)
    --entry-point <path>     Entry point path (default: src/index.ts)
    --yes, -y               Use defaults for all prompts
    --help, -h               Show this help message

EXAMPLES:
    bun init                           Interactive mode
    bun init --yes                     Use defaults
    bun init --name my-app --yes        Set project name
    bun init --template api --yes        Use API template
    bun init --name my-api --template api --yes
                                      Create API project with custom name
`;
}

export async function cli(args: string[]): Promise<void> {
	const options = parseArgs(args);

	if (options.help) {
		console.log(showHelp());
		process.exit(0);
	}

	try {
		await init(
			{
				name: options.name,
				template: options.template,
				entryPoint: options.entryPoint,
				yes: options.yes,
			},
			{ exitHandler: defaultExitHandler },
		);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

if (import.meta.main) {
	const args = process.argv.slice(2);
	cli(args);
}

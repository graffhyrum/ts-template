export function generateApiIndex(): string {
	return `import { createServer } from "./server";

createServer();
`;
}

export function generateApiServer(): string {
	return `import { type Server } from "bun";
import { errorHandler } from "./middleware/errors";
import { logger } from "./services/logger";
import { healthRoutes } from "./routes/health";
import { userRoutes } from "./routes/user";

const PORT = process.env.PORT || 3000;

export function createServer(): Server<unknown> {
	const server = Bun.serve({
		port: PORT,
		async fetch(req) {
			try {
				const url = new URL(req.url);

				if (url.pathname === "/health") {
					return healthRoutes(req);
				}

				if (url.pathname.startsWith("/api/users")) {
					return userRoutes(req);
				}

				return new Response("Not Found", { status: 404 });
			} catch (error) {
				return errorHandler(error);
			}
		},
	});

	logger.info(\`Server running on http://localhost:\${PORT}\`);

	return server;
}
`;
}

export function generateHealthRoute(): string {
	return `export function healthRoutes(req: Request): Response {
	return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
		headers: { "Content-Type": "application/json" },
	});
}
`;
}

export function generateUserRoute(): string {
	return `export function userRoutes(req: Request): Response {
	const url = new URL(req.url);

	if (req.method === "GET" && url.pathname === "/api/users") {
		return new Response(JSON.stringify([{ id: 1, name: "John Doe" }]), {
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response("Not Found", { status: 404 });
}
`;
}

export function generateValidatorService(): string {
	return `import { type } from "arktype";

export const validator = type({
	id: "number",
	name: "string",
	email: "string",
});

export type User = typeof validator.infer;
`;
}

export function generateLoggerService(): string {
	return `type LogLevel = "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string): string {
	const timestamp = new Date().toISOString();
	return \`[\${timestamp}] \${level.toUpperCase()}: \${message}\`;
}

export const logger = {
	info(message: string) {
		console.log(formatMessage("info", message));
	},
	warn(message: string) {
		console.warn(formatMessage("warn", message));
	},
	error(message: string) {
		console.error(formatMessage("error", message));
	},
};
`;
}

export function generateErrorMiddleware(): string {
	return `export function errorHandler(error: unknown): Response {
	const message = error instanceof Error ? error.message : "Unknown error";

	return new Response(
		JSON.stringify({ error: message }),
		{
			status: 500,
			headers: { "Content-Type": "application/json" },
		},
	);
}
`;
}

export function generateApiTypes(): string {
	return `export interface User {
	id: number;
	name: string;
	email: string;
}

export interface ApiResponse<T> {
	data?: T;
	error?: string;
	message?: string;
}
`;
}

export function generateApiTest(): string {
	return `import { test, expect } from "bun:test";
import { healthRoutes } from "../routes/health";

test("health endpoint returns 200", async () => {
	const req = new Request("http://localhost:3000/health");
	const response = await healthRoutes(req);

	expect(response.status).toBe(200);
});
`;
}

export function generateApiReadme(config: {
	name: string;
	entryPoint: string;
}): string {
	const { name } = config;

	const readme = [
		`# ${name}`,
		"",
		"A modern REST API server with validation and error handling.",
		"",
		"## Quick Start",
		"",
		"```bash",
		"# Install dependencies",
		"bun install",
		"",
		"# Start development server",
		"bun run dev",
		"",
		"# Run validation",
		"bun run vet",
		"```",
		"",
		"## API Endpoints",
		"",
		"### Health Check",
		"- **GET** `/health` - Server health status",
		"",
		"### Users",
		"- **GET** `/api/users` - List all users",
		"",
		"## Project Structure",
		"",
		"```",
		"src/",
		"├── index.ts              # Server entry point",
		"├── server.ts            # Server setup",
		"├── routes/              # API route handlers",
		"│   ├── health.ts       # Health check endpoint",
		"│   └── user.ts         # User endpoints",
		"├── services/            # Business logic",
		"│   ├── validator.ts   # Request validation",
		"│   └── logger.ts      # Logging",
		"├── middleware/          # Request middleware",
		"│   └── errors.ts      # Error handling",
		"└── types/              # Type definitions",
		"    └── api.ts          # API types",
		"```",
		"",
		"## Code Style",
		"",
		"### Types & Validation",
		"- Use `ArkType` for request/response validation",
		"- Use `arkenv` for environment variables",
		"- Define API types in `types/api.ts`",
		"",
		"### Error Handling",
		"- All route errors caught by error middleware",
		"- Return consistent error format: `{ error: string }`",
		"- Use `logger` service for structured logging",
		"",
		"## Stack",
		"",
		"- **Runtime**: Bun with native HTTP server",
		"- **Validation**: ArkType for runtime type safety",
		"- **Config**: arkenv for environment variables",
	];

	return readme.join("\n");
}

import { expect, test } from "bun:test";
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
} from "./api-generators";

test("generateHealthRoute returns valid function string", () => {
	const result = generateHealthRoute();

	expect(result).toContain("export function healthRoutes");
	expect(result).toContain("req: Request");
	expect(result).toContain(": Response");
	expect(result).toContain('status: "ok"');
});

test("generateErrorMiddleware returns valid function string", () => {
	const result = generateErrorMiddleware();

	expect(result).toContain("export function errorHandler");
	expect(result).toContain("error: unknown");
	expect(result).toContain(": Response");
	expect(result).toContain("instanceof Error");
});

test("generateApiTest returns valid test string", () => {
	const result = generateApiTest();

	expect(result).toContain('import { test, expect } from "bun:test"');
	expect(result).toContain("healthRoutes");
	expect(result).toContain("expect(response.status).toBe(200)");
});

test("generateApiIndex returns valid import statement", () => {
	const result = generateApiIndex();

	expect(result).toContain('import { createServer } from "./server"');
	expect(result).toContain("createServer();");
});

test("generateApiServer returns valid server setup", () => {
	const result = generateApiServer();

	expect(result).toContain("export function createServer");
	expect(result).toContain("Bun.serve");
	expect(result).toContain("async fetch(req)");
	expect(result).toContain("healthRoutes");
	expect(result).toContain("userRoutes");
	expect(result).toContain("PORT");
});

test("generateUserRoute returns valid route handler", () => {
	const result = generateUserRoute();

	expect(result).toContain("export function userRoutes");
	expect(result).toContain("req: Request");
	expect(result).toContain(": Response");
	expect(result).toContain("req.method");
	expect(result).toContain('"/api/users"');
});

test("generateValidatorService returns arktype validator", () => {
	const result = generateValidatorService();

	expect(result).toContain('import { type } from "arktype"');
	expect(result).toContain("export const validator");
	expect(result).toContain("id");
	expect(result).toContain("name");
	expect(result).toContain("email");
	expect(result).toContain("export type User");
});

test("generateLoggerService returns logger object", () => {
	const result = generateLoggerService();

	expect(result).toContain("type LogLevel");
	expect(result).toContain('info" | "warn" | "error"');
	expect(result).toContain("export const logger");
	expect(result).toContain("info(message: string)");
	expect(result).toContain("warn(message: string)");
	expect(result).toContain("error(message: string)");
	expect(result).toContain("formatMessage");
});

test("generateApiTypes returns type definitions", () => {
	const result = generateApiTypes();

	expect(result).toContain("export interface User");
	expect(result).toContain("id: number");
	expect(result).toContain("name: string");
	expect(result).toContain("email: string");
	expect(result).toContain("export interface ApiResponse");
	expect(result).toContain("data?");
	expect(result).toContain("error?");
	expect(result).toContain("message?");
});

test("generateApiReadme returns valid readme content", () => {
	const result = generateApiReadme({
		name: "test-api",
		entryPoint: "src/index.ts",
	});

	expect(result).toContain("# test-api");
	expect(result).toContain("REST API server");
	expect(result).toContain("## Quick Start");
	expect(result).toContain("bun install");
	expect(result).toContain("bun run dev");
	expect(result).toContain("## API Endpoints");
	expect(result).toContain("### Health Check");
	expect(result).toContain("- **GET** `/health`");
	expect(result).toContain("### Users");
	expect(result).toContain("- **GET** `/api/users`");
	expect(result).toContain("## Project Structure");
	expect(result).toContain("src/");
	expect(result).toContain("routes/");
	expect(result).toContain("services/");
	expect(result).toContain("middleware/");
	expect(result).toContain("types/");
});

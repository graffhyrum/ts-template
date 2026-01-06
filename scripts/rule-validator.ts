// Rule Compliance Validator
// Scans code for violations of AGENTS.md rules

import path from "node:path";
import { glob } from "glob";

interface Rule {
	name: string;
	pattern: RegExp;
	message: string;
	severity: "error" | "warning";
}

interface Violation {
	file: string;
	line: number;
	column: number;
	rule: Rule;
	match: string;
}

const RULES: Rule[] = [
	{
		name: "no-waitForTimeout",
		pattern: /\bwaitForTimeout\s*\(/g,
		message:
			"AVOID STATIC TIMEOUTS: Use Playwright's auto-waiting and web-first assertions instead of waitForTimeout(). See https://playwright.dev/docs/actionability and https://playwright.dev/docs/best-practices#use-web-first-assertions",
		severity: "error",
	},
	{
		name: "no-any-types",
		pattern: /:\s*any\b/g,
		message: "STRICT MODE: No any types, use ArkType and validator functions.",
		severity: "error",
	},
	{
		name: "template-literals-only",
		pattern: /"\s*\+\s*[^"]|\+\s*"[^"]*"/g,
		message: `TEMPLATE LITERALS ONLY: Use \${} not +`,
		severity: "error",
	},
	{
		name: "no-static-classes",
		pattern: /export\s+class\s+\w+Impl/g,
		message: "AVOID STATIC-ONLY CLASSES: Convert to module functions",
		severity: "error",
	},
];

async function scanFile(filePath: string): Promise<Violation[]> {
	const violations: Violation[] = [];
	const content = await Bun.file(filePath).text();
	const lines = content.split("\n");

	lines.forEach((line, lineIndex) => {
		RULES.forEach((rule) => {
			const matches = [...line.matchAll(rule.pattern)];
			matches.forEach((match) => {
				violations.push({
					file: filePath,
					line: lineIndex + 1,
					column: match.index || 0,
					rule,
					match: match[0],
				});
			});
		});
	});

	return violations;
}

async function main() {
	const args = process.argv.slice(2);
	const pattern = args[0] || "**/*.{ts,tsx,js,jsx}";

	console.log("🔍 Scanning for rule violations...");

	try {
		const files = await glob(pattern, {
			ignore: [
				"node_modules/**",
				"**/node_modules/**",
				"dist/**",
				"build/**",
				".git/**",
				"playwright-report/**",
			],
		});

		let totalViolations = 0;
		let errorCount = 0;
		let warningCount = 0;

		for (const file of files) {
			if (
				!file.endsWith(".ts") &&
				!file.endsWith(".tsx") &&
				!file.endsWith(".js") &&
				!file.endsWith(".jsx")
			) {
				continue;
			}

			// Skip rule validator itself
			if (file.includes("rule-validator")) {
				continue;
			}

			const violations = await scanFile(file);
			if (violations.length > 0) {
				const relativePath = path.relative(process.cwd(), file);
				console.log(`📁 ${relativePath}:`);
				violations.forEach((v) => {
					const icon = v.rule.severity === "error" ? "❌" : "⚠️";
					console.log(
						`  ${icon} Line ${v.line}:${v.column} - ${v.rule.message}`,
					);
					console.log(`    Found: ${v.match.trim()}`);
				});
				console.log("");

				totalViolations += violations.length;
				errorCount += violations.filter(
					(v) => v.rule.severity === "error",
				).length;
				warningCount += violations.filter(
					(v) => v.rule.severity === "warning",
				).length;
			}
		}
		printSummaryReport(totalViolations, errorCount, warningCount);

		if (errorCount > 0) {
			console.log("\n🚫 Errors found! Fix before proceeding.");
			process.exit(1);
		} else if (warningCount > 0) {
			console.log("\n⚠️ Warnings found. Consider fixing for better compliance.");
			process.exit(0);
		} else {
			process.exit(0);
		}
	} catch (error) {
		console.error("❌ Error scanning files:", error);
		process.exit(1);
	}

	function printSummaryReport(
		totalViolations: number,
		errorCount: number,
		warningCount: number,
	) {
		console.log(
			`📊 Summary: ${totalViolations} violations (${errorCount} errors, ${warningCount} warnings)`,
		);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}

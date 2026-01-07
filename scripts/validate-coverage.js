// Coverage Threshold Validator
// Parses Bun coverage output and enforces minimum thresholds

const MIN_LINE_COVERAGE = 95;
const MIN_FUNC_COVERAGE = 95;

let input = "";

for await (const chunk of process.stdin) {
	input += chunk;
}

const lines = input.trim().split("\n");
let lineCoverage = null;
let funcCoverage = null;

for (const line of lines) {
	if (line.includes("All files")) {
		const parts = line.trim().split(/\s+/);
		// Handle "All files" being split into "All" and "files"
		// Pattern: All files | func% | line% |
		// Split: ['All', 'files', '|', '91.50', '|', '87.66', '|']
		// First numeric value is func coverage, second is line coverage
		const numericParts = parts.filter((p) => /^\d+\.\d+$/.test(p));
		if (numericParts.length >= 2) {
			funcCoverage = parseFloat(numericParts[0]);
			lineCoverage = parseFloat(numericParts[1]);
		}
		break;
	}
}

if (lineCoverage === null || funcCoverage === null) {
	console.error("❌ Could not parse coverage output");
	process.exit(1);
}

console.log(`📊 Coverage: ${funcCoverage}% functions, ${lineCoverage}% lines`);
console.log(
	`📋 Required: ${MIN_FUNC_COVERAGE}% functions, ${MIN_LINE_COVERAGE}% lines`,
);

if (lineCoverage < MIN_LINE_COVERAGE || funcCoverage < MIN_FUNC_COVERAGE) {
	console.error(
		`\n🚫 Coverage below threshold! Expected >= ${MIN_FUNC_COVERAGE}% functions and ${MIN_LINE_COVERAGE}% lines.`,
	);
	process.exit(1);
}

console.log(`\n✅ Coverage requirements met!`);
process.exit(0);

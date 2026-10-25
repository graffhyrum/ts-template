import { capture, type Capture } from "./capture.ts";

// Green baseline for this sample: every gated file is fully covered.
const FUNCTION_THRESHOLD = 100;
const LINE_THRESHOLD = 100;

const run = await capture(
  ["bun", "test", "--coverage", "--coverage-reporter=lcov"],
  {
    env: { AGENT: "1" },
  },
);
if (run.exitCode !== 0) reportTestFailure(run);

const lcovFile = Bun.file("coverage/lcov.info");
if (!(await lcovFile.exists())) {
  process.stderr.write(
    "coverage threshold failed: coverage/lcov.info is missing\n",
  );
  process.exit(1);
}

const failures = collectFailures(parseLcov(await lcovFile.text()));
reportCoverage(failures);

function reportTestFailure(run: Capture): never {
  if (run.stdout.length > 0) process.stdout.write(run.stdout);
  if (run.stderr.length > 0) process.stderr.write(run.stderr);
  process.exit(run.exitCode);
}

function reportCoverage(failures: readonly string[]): void {
  if (failures.length === 0) return;
  process.stderr.write("coverage threshold failed\n");
  for (const failure of failures) process.stderr.write(`${failure}\n`);
  process.exit(1);
}

function collectFailures(files: readonly FileCoverage[]): string[] {
  const gated = files.filter((file) => isGatedFile(normalizePath(file.path)));
  if (gated.length === 0)
    return ["no src coverage records in coverage/lcov.info"];
  return gated.flatMap(failureForFile);
}

function failureForFile(file: FileCoverage): string[] {
  const path = normalizePath(file.path);
  const functions = percent(file.functionsHit, file.functionsFound);
  const lines = percent(file.linesHit, file.linesFound);
  if (functions >= FUNCTION_THRESHOLD && lines >= LINE_THRESHOLD) return [];
  return [
    `${path}: ${functions.toFixed(1)}% functions (threshold ${FUNCTION_THRESHOLD}%), ${lines.toFixed(1)}% lines (threshold ${LINE_THRESHOLD}%)`,
  ];
}

type FileCoverage = {
  readonly path: string;
  readonly functionsFound: number;
  readonly functionsHit: number;
  readonly linesFound: number;
  readonly linesHit: number;
};

function parseLcov(text: string): readonly FileCoverage[] {
  return text.split("end_of_record").flatMap(parseRecord);
}

function parseRecord(record: string): readonly FileCoverage[] {
  const path = readField(record, "SF:");
  if (path === undefined) return [];
  return [
    {
      path,
      functionsFound: readCount(record, "FNF:"),
      functionsHit: readCount(record, "FNH:"),
      linesFound: readCount(record, "LF:"),
      linesHit: readCount(record, "LH:"),
    },
  ];
}

function readCount(record: string, prefix: string): number {
  const raw = readField(record, prefix);
  if (raw === undefined) return 0;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) return 0;
  return value;
}

function readField(record: string, prefix: string): string | undefined {
  for (const line of record.split("\n")) {
    if (line.startsWith(prefix)) return line.slice(prefix.length).trim();
  }
  return undefined;
}

function normalizePath(file: string): string {
  const slash = file.replaceAll("\\", "/");
  const cwd = `${process.cwd().replaceAll("\\", "/")}/`;
  if (slash.startsWith(cwd)) return slash.slice(cwd.length);
  return slash;
}

function isGatedFile(file: string): boolean {
  if (file.endsWith(".test.ts")) return false;
  if (file === "config.ts") return true;
  return file.startsWith("src/");
}

function percent(hit: number, found: number): number {
  if (found === 0) return 100;
  return (hit / found) * 100;
}

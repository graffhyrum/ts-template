import { expect, test } from "bun:test";
import { sampleGreeting } from "./index.ts";

test("sample greeting is Hello Bun", () => {
  expect(sampleGreeting()).toBe("Hello Bun");
});

test("the entry point prints the sample greeting", async () => {
  const proc = Bun.spawn(["bun", "src/index.ts"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  expect(exitCode).toBe(0);
  expect(stdout.trim()).toBe("Hello Bun");
});

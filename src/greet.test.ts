import { expect, test } from "bun:test";
import { createGreeter } from "./greet.ts";

test("greets a non-empty name with the prefix", () => {
  const greeter = createGreeter("Hello");
  expect(greeter.greet("Bun")).toBe("Hello Bun");
});

test("returns the prefix when the name is empty", () => {
  const greeter = createGreeter("Hello");
  expect(greeter.greet("")).toBe("Hello");
});

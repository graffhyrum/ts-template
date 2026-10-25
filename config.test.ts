import { expect, test } from "bun:test";
import { CONFIG } from "./config.ts";

test("config follows NODE_ENV", () => {
  const nodeEnv = readNodeEnv(process.env.NODE_ENV);
  expect(CONFIG.nodeEnv).toBe(nodeEnv);
  expect(CONFIG.isDevelopment).toBe(nodeEnv === "development");
  expect(CONFIG.isProduction).toBe(nodeEnv === "production");
  expect(CONFIG.isTest).toBe(nodeEnv === "test");
});

function readNodeEnv(
  value: string | undefined,
): "development" | "production" | "test" {
  if (value === "production") return "production";
  if (value === "test") return "test";
  return "development";
}

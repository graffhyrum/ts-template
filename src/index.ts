import { createGreeter } from "./greet.ts";

export function sampleGreeting(): string {
  return createGreeter("Hello").greet("Bun");
}

if (import.meta.main) console.log(sampleGreeting());

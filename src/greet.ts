import { type } from "arktype";

const Name = type("string>0");

export type Greeter = {
  readonly greet: (name: string) => string;
};

export function createGreeter(prefix: string): Greeter {
  return {
    greet: (name: string) => greetWithPrefix(prefix, name),
  };
}

function greetWithPrefix(prefix: string, name: string): string {
  const parsed = parseName(name);
  if (parsed === undefined) return prefix;
  return `${prefix} ${parsed}`;
}

function parseName(name: string): string | undefined {
  const parsed = Name(name);
  if (parsed instanceof type.errors) return undefined;
  return parsed;
}

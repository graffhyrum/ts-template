export interface DependencyRunner {
	install(): Promise<void>;
}

export interface ConsoleLike {
	log(...args: unknown[]): void;
	error(...args: unknown[]): void;
	info(...args: unknown[]): void;
	warn(...args: unknown[]): void;
}

export const defaultConsole: ConsoleLike = {
	log: console.log,
	error: console.error,
	info: console.info,
	warn: console.warn,
};

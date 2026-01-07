export interface ExitHandler {
	exit(code: number): never;
}

export const defaultExitHandler: ExitHandler = {
	exit: (code: number): never => {
		process.exit(code);
	},
};

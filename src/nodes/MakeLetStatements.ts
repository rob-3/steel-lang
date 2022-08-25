import { b } from "code-red";

export const makeLetStatements = (
	identifierDeclarations: { identifier: string; immutable: boolean }[]
) => {
	const variableNames = identifierDeclarations
		.map(({ identifier }) => identifier)
		.join();
	if (variableNames.length === 0) return null;
	return b`let ${variableNames};`;
};

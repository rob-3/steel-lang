import { b, Node, x } from "code-red";
import { IdentifierDeclaration } from "../Expr";

export const makeLetStatements = (
	identifierDeclarations: { identifier: string; immutable: boolean }[]
) => {
	const variableNames = identifierDeclarations
		.map(({ identifier }) => identifier)
		.join();
	if (variableNames.length === 0) return null;
	return b`let ${variableNames};`;
};

export const wrapInClosureIfNecessary = ({
	node,
	identifierDeclarations,
}: {
	node?: Node;
	identifierDeclarations?: IdentifierDeclaration[];
} = {}) => {
	return node && identifierDeclarations
		? wrapInClosure({ node, identifierDeclarations })
		: node;
};

const wrapInClosure = ({
	node,
	identifierDeclarations,
}: {
	node: Node;
	identifierDeclarations: IdentifierDeclaration[]
}) => {
	return x`(() => {
		${makeLetStatements(identifierDeclarations)}
		return ${node}
	})()`;
};

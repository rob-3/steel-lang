import { Node, print } from "code-red";
import { expect } from "vitest";
import Scope from "../src/Scope";
import { UnboxedValue } from "../src/Value";
import { stlEval as _stlEval } from "../src/Interpreter.js";

export const assertEqual = (
	node1: { node?: Node; errors?: Error[] } | Error,
	node2: Node
) => {
	if (node1 instanceof Error) throw node1;
	if (!node1.node) throw Error("Node was empty!");
	if (node1.errors && node1.errors.length > 0) throw node1.errors;
	expect(print(node1.node).code).toEqual(print(node2).code);
};

export const stlEval = (
	src: string,
	scope: Scope = new Scope()
): UnboxedValue | undefined | Error[] => {
	const val = _stlEval(src, { scope });
	return val.caseOf<UnboxedValue | undefined | Error[]>({
		Right: ([val]) => val?.value,
		Left: (err) => err,
	});
};

export const stlEvalMockPrint = (
	src: string,
	printfn: (value: UnboxedValue) => void
): [UnboxedValue | undefined, Scope] | Error[] => {
	const val = _stlEval(src, { scope: new Scope({ printfn }) });
	return val.caseOf<[UnboxedValue | undefined, Scope] | Error[]>({
		Right: ([val, scope]) => [val?.value, scope],
		Left: (err) => err,
	});
};

import { Node, print } from "code-red";
import { expect } from "vitest";
import Scope from "../src/Scope";
import { UnboxedValue } from "../src/Value";
import { stlEval as _stlEval } from "../src/Interpreter.js";
import { Value } from "../src/Value.js";
import { setPrintFn } from "../src/Logger.js";

export const assertEqual = (node1: { node?: Node, errors?: Error[] } | Error, node2: Node) => {
	if (node1 instanceof Error) throw node1;
	if (!node1.node) throw Error("Node was empty!");
	if (node1.errors && node1.errors.length > 0) throw node1.errors;
	expect(print(node1.node).code).toEqual(print(node2).code);
};

export const stlEval = (
	src: string,
	scope: Scope = new Scope()
): UnboxedValue | undefined => {
	const val = _stlEval(src, scope);
	try {
		return val.unsafeCoerce()[0]?.value;
	} catch (e) {
		console.log(val);
		throw e;
	}
};

export const stlExec = (
	src: string,
	printfn: ((a: any) => void) | null = null
): [Value | null, Scope] => {
	if (printfn !== null) setPrintFn(printfn);
	const val = _stlEval(src, new Scope());
	try {
		return val.unsafeCoerce();
	} catch (e) {
		console.log(val);
		throw e;
	}
};


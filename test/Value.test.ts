import { stlEval as _stlEval } from "../src/Interpreter.js";
import Scope from "../src/Scope.js";
import { UnboxedValue } from "../src/Value.js";
import { describe, it, expect } from "vitest";

const stlEval = (
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

describe("objects", () => {
	it("should use deep equality by default", () => {
		expect(stlEval("{ a: 4 } == { a: 4 }")).toBe(true);
	});
});

describe("arrays", () => {
	it("should use deep equality", () => {
		expect(stlEval("[1, 2, 3] == [1, 2, 3]")).toBe(true);
	});
});

import StlNumber, { gcd } from "../src/StlNumber.js";
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

describe("StlNumber", () => {
	it("should properly generate fractions", () => {
		expect(new StlNumber(314n, 100n)).toEqual(StlNumber.of("3.14"));
	});

	it("should properly implement gcd", () => {
		expect(gcd(5n, 25n)).toEqual(5n);
		expect(gcd(7n, 25n)).toEqual(1n);
		expect(gcd(12n, 24n)).toEqual(12n);
	});

	it("should support equality testing", () => {
		expect(new StlNumber(5n)).toEqual(new StlNumber(5n));
	});

	it("should fix 0.1 + 0.2 == 0.3", () => {
		expect(StlNumber.of("0.1").add(StlNumber.of("0.2"))).toEqual(
			StlNumber.of("0.3")
		);
	});
});

describe("arrays", () => {
	it("should use deep equality", () => {
		expect(stlEval("[1, 2, 3] == [1, 2, 3]")).toBe(true);
	});
});

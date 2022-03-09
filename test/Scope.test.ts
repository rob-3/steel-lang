import { stlEval } from "../src/Interpreter.js";
import Scope from "../src/Scope.js";
import { Box } from "../src/Value.js";
import StlNumber from "../src/StlNumber.js";
import { describe, it, expect } from "vitest";

describe("class Scope", () => {
	it("should retrieve values with no parents", () => {
		const scope = new Scope();
		scope.setLocal("a", [new Box(new StlNumber(49n)), false]);
		expect(scope.get("a")?.value).toEqual(new StlNumber(49n));
	});

	it("should return null if the value doesn't exist", () => {
		const scope = new Scope();
		expect(scope.get("a")?.value).toBeUndefined();
	});

	it("should defer to higher parent scope", () => {
		const parentScope = new Scope();
		const childScope = new Scope(parentScope);
		parentScope.setLocal("a", [new Box(new StlNumber(49n)), false]);
		expect(childScope.get("a")?.value).toEqual(new StlNumber(49n));
	});

	it("should throw an error when reassigning to an immutable value", () => {
		const src: string = `
        let a = 5
        let b = 10
        a = 6
        `;
		const scope = new Scope();
		expect(() => stlEval(src, scope)).toThrow(
			'Cannot assign to immutable variable "a".'
		);
	});
});

import parse from "../src/Parser.js";
import StlNumber from "../src/StlNumber.js";
import tokenize from "../src/Tokenizer.js";
import { stlEval } from "./Interpreter.test.js";
import { describe, it, expect } from "vitest";

describe("Steel arrays", () => {
	it("should not throw a parse error when assigning to array index", () => {
		expect(tokenize(`let ~a = []\n~a[0] = 5`).chain(parse).isRight()).toBe(
			true
		);
	});

	it("should properly store assignments to array indices", () => {
		expect(stlEval(`let ~a = []\n~a[0] = 5`)).toEqual(new StlNumber(5n));
	});

	it("should fail on an assignment to an index of an immutable array", () => {
		expect(() => stlEval(`let a = []\na[0] = 5`)).toThrow(
			`Cannot assign to index of immutable array "a"`
		);
	});
});

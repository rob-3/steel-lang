import parse from "../src/Parser.js";
import StlNumber from "../src/StlNumber.js";
import tokenize from "../src/Tokenizer.js";
import { describe, it, expect } from "vitest";
import { stlEval } from "./Helpers.js";

describe("Steel arrays", () => {
	it("should not throw a parse error when assigning to array index", () => {
		expect(tokenize(`var a <- []\na[0] <- 5`).chain(parse).isRight()).toBe(
			true
		);
	});

	it("should properly store assignments to array indices", () => {
		expect(stlEval(`var a <- []\na[0] <- 5`)).toEqual(new StlNumber(5n));
	});

	it("should fail on an assignment to an index of an immutable array", () => {
		expect(stlEval(`a = []\na[0] <- 5`)).toEqual([
			Error(`Cannot assign to index of immutable array "a"`),
		]);
	});
});

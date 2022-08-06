import { stlEval as _stlEval } from "../src/Interpreter.js";
import { describe, it, expect } from "vitest";
import { stlEval } from "./Helpers.js";

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

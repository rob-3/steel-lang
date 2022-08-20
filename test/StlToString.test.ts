import { describe, expect, it } from "vitest";
import { FunctionExpr } from "../src/nodes/FunctionExpr";
import { PrimaryExpr } from "../src/nodes/PrimaryExpr";
import Scope from "../src/Scope";
import { StlFunction } from "../src/StlFunction";
import StlNumber from "../src/StlNumber";
import { stlToString } from "../src/StlToString.js";
import { Box } from "../src/Value.js";

describe("stlToString()", () => {
	it("should stringify a number", () => {
		expect(stlToString(StlNumber.of("3.5"))).toEqual("7/2");
	});

	it("should stringify a boolean", () => {
		expect(stlToString(true)).toEqual("true");
	});

	it("should stringify a function", () => {
		expect(
			stlToString(
				new StlFunction(FunctionExpr([], PrimaryExpr(true)), new Scope())
			)
		).toEqual("<function>");
	});

	it("should stringify an array of numbers", () => {
		expect(
			stlToString(
				[StlNumber.of(5), StlNumber.of(5), StlNumber.of(5)].map(
					(x) => new Box(x)
				)
			)
		).toEqual("[5, 5, 5]");
	});
});

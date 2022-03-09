import PrimaryExpr from "../src/nodes/PrimaryExpr.js";
import { it, expect } from "vitest";
import { Node, print, x } from "code-red";
import StlNumber from "../src/StlNumber.js";

it("should compile booleans", () => {
	const node: Node = new PrimaryExpr(true, []).estree();
	expect(print(node).code).toEqual(print(x`{stlValue: true}`).code);
});

it("should compile strings", () => {
	const node: Node = new PrimaryExpr("hello", []).estree();
	expect(print(node).code).toEqual(print(x`{stlValue: "hello"}`).code);
});

it("should compile numbers", () => {
	const node: Node = new PrimaryExpr(StlNumber.of(5), []).estree();
	expect(print(node).code).toEqual(print(x`{stlValue: {top: 5n, bottom: 1n}}`).code);
});

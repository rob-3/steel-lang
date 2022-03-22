import PrimaryExpr from "../src/nodes/PrimaryExpr.js";
import { it, expect } from "vitest";
import { Node, print, x } from "code-red";
import StlNumber from "../src/StlNumber.js";

const assertEqual = (node1: Node, node2: Node) => {
	expect(print(node1).code).toEqual(print(node2).code);
}

it("should compile booleans", () => {
	const node: Node = new PrimaryExpr(true, []).estree();
	assertEqual(node, x`{stlValue: true}`);
});

it("should compile strings", () => {
	const node: Node = new PrimaryExpr("hello", []).estree();
	assertEqual(node, x`{stlValue: "hello"}`);
});

it("should compile numbers", () => {
	const node: Node = new PrimaryExpr(StlNumber.of(5), []).estree();
	assertEqual(node, x`{stlValue: {top: 5n, bottom: 1n}}`);
});

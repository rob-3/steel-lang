import { StlBoolExpr, StlNumberExpr, StlStringExpr } from "../src/nodes/PrimaryExpr.js";
import { it, expect } from "vitest";
import { Node, print, x } from "code-red";
import StlNumber from "../src/StlNumber.js";

const assertEqual = (node1: Node, node2: Node) => {
	expect(print(node1).code).toEqual(print(node2).code);
}

it("should compile booleans", () => {
	const node: Node = StlBoolExpr(true, []).estree();
	assertEqual(node, x`{stlValue: true}`);
});

it("should compile strings", () => {
	const node: Node = StlStringExpr("hello", []).estree();
	assertEqual(node, x`{stlValue: "hello"}`);
});

it("should compile integers", () => {
	const node: Node = StlNumberExpr(StlNumber.of(5), []).estree();
	assertEqual(node, x`{stlValue: {top: 5n, bottom: 1n}}`);
});

it("should compile decimals", () => {
	const node: Node = StlNumberExpr(StlNumber.of("5.56"), []).estree();
	assertEqual(node, x`{stlValue: {top: 139n, bottom: 25n}}`);
});

it("should compile decimals with trailing zeros", () => {
	const node: Node = StlNumberExpr(StlNumber.of("5.560"), []).estree();
	assertEqual(node, x`{stlValue: {top: 139n, bottom: 25n}}`);
});

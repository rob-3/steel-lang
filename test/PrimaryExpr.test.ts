import {
	StlBoolExpr,
	StlNumberExpr,
	StlStringExpr,
} from "../src/nodes/PrimaryExpr.js";
import { it, describe } from "vitest";
import { Node, x } from "code-red";
import StlNumber from "../src/StlNumber.js";
import { assertEqual } from "./Helpers.js";

describe("PrimaryExpr codegen", () => {
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
});

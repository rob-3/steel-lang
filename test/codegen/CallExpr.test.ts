import { x } from "code-red";
import { describe, it } from "vitest";
import { CallExpr } from "../../src/nodes/CallExpr";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import StlNumber from "../../src/StlNumber";
import { assertEqual } from "../Helpers";

describe("CallExpr codegen", () => {
	it("should compile a no argument call", () => {
		const node = CallExpr(VariableExpr("hello"), []).estree();
		assertEqual(node, x`hello()`);
	});

	it("should compile a one argument call", () => {
		const node = CallExpr(VariableExpr("hello"), [
			PrimaryExpr(StlNumber.of(2)),
		]).estree();
		assertEqual(node, x`hello({stlValue: {top: 2n, bottom: 1n}})`);
	});

	it("should compile a two argument call", () => {
		const node = CallExpr(VariableExpr("hello"), [
			PrimaryExpr(StlNumber.of(2)),
			PrimaryExpr("foo"),
		]).estree();
		assertEqual(
			node,
			x`hello({stlValue: {top: 2n, bottom: 1n}}, {stlValue: "foo"})`
		);
	});
});

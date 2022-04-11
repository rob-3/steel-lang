import { Node, x } from "code-red";
import { describe, it } from "vitest";
import { DotAccess } from "../../src/nodes/DotAccess.js";
import { ObjectLiteral } from "../../src/nodes/ObjectLiteral.js";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr.js";
import StlNumber from "../../src/StlNumber.js";
import { assertEqual } from "../Helpers.js";

describe("DotAccess codegen", () => {
	it("should compile dot notation", () => {
		const node: Node = DotAccess(
			ObjectLiteral(
				new Map([
					["alpha", PrimaryExpr(StlNumber.of(0))],
					["beta", PrimaryExpr("hello")],
				])
			),
			"alpha"
		).estree();
		assertEqual(
			node,
			x`({stlValue: {
			alpha: {stlValue: {top: 0n, bottom: 1n}},
			beta: {stlValue: "hello"},
		}}).stlValue.alpha`
		);
	});
});

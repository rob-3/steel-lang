import { Node, x } from "code-red";
import { describe, it } from "vitest";
import { IfStmt } from "../../src/nodes/IfStmt";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import StlNumber from "../../src/StlNumber";
import { assertEqual } from "../Helpers";

describe("IfStmt codegen", () => {
	it("should compile an if statement with else", () => {
		const node: Node = IfStmt(
			PrimaryExpr(true),
			PrimaryExpr(StlNumber.of(2)),
			PrimaryExpr(StlNumber.of(3))
		).estree();
		assertEqual(
			node,
			x`stlUnwrap({stlValue: true}) ? {stlValue: {top: 2n, bottom: 1n}} : {stlValue: {top: 3n, bottom: 1n}}`
		);
	});
});

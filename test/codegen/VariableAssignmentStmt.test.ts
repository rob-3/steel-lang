import { x } from "code-red";
import { describe, it } from "vitest";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { VariableAssignmentStmt } from "../../src/nodes/VariableAssignmentStmt";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import StlNumber from "../../src/StlNumber";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";

describe("VariableExpr codegen", () => {
	it("should compile an assignment with a BinaryExpr", () => {
		const node = VariableAssignmentStmt(
			VariableExpr("a"),
			BinaryExpr(
				PrimaryExpr(StlNumber.of(2)),
				TokenType.PLUS,
				PrimaryExpr(StlNumber.of(2))
			)
		).estree();
		assertEqual(
			node,
			x`a = stlAdd({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});
});

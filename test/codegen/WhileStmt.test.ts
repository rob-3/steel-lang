import { x } from "code-red";
import { describe, it } from "vitest";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { VariableAssignmentStmt } from "../../src/nodes/VariableAssignmentStmt";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import { WhileStmt } from "../../src/nodes/WhileStmt";
import StlNumber from "../../src/StlNumber";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";

describe("WhileStmt codegen", () => {
	it("should compile a while statement", () => {
		const node = WhileStmt(
			BinaryExpr(
				VariableExpr("a"),
				TokenType.EQUAL_EQUAL,
				PrimaryExpr(StlNumber.of(2))
			),
			VariableAssignmentStmt(VariableExpr("a"), PrimaryExpr(StlNumber.of(3)))
		).estree();
		assertEqual(
			node,
			x`(() => {
			let ret;
			while (stlEqual(a, {stlValue: {top: 2n, bottom: 1n}})) {
				ret = (a = {stlValue: {top: 3n, bottom: 1n}})
			}
			return ret;
		})()`
		);
	});
});

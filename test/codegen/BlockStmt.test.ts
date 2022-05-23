import { x } from "code-red";
import { describe, it } from "vitest";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import { BlockStmt } from "../../src/nodes/BlockStmt";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { VariableAssignmentStmt } from "../../src/nodes/VariableAssignmentStmt";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import StlNumber from "../../src/StlNumber";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";

describe("BlockStmt codegen", () => {
	it("should compile a block of one statement", () => {
		const node = BlockStmt([
			BinaryExpr(
				PrimaryExpr(StlNumber.of(2)),
				TokenType.PLUS,
				PrimaryExpr(StlNumber.of(2))
			),
		]).estree();
		assertEqual(
			node,
			x`(() => {
				return stlAdd({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}});
			})()`
		);
	});

	it("should handle a block with multiple lines of math", () => {
		const node = BlockStmt([
			VariableAssignmentStmt(
				VariableExpr("a"),
				BinaryExpr(
					PrimaryExpr(StlNumber.of(2)),
					TokenType.PLUS,
					PrimaryExpr(StlNumber.of(2))
				)
			),
			VariableAssignmentStmt(
				VariableExpr("b"),
				BinaryExpr(
					VariableExpr("a"),
					TokenType.MINUS,
					PrimaryExpr(StlNumber.of(2))
				)
			),
			PrimaryExpr(StlNumber.of(2)),
		]).estree();

		assertEqual(
			node,
			x`(() => {
				a = stlAdd({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}});
				b = stlSubtract(a, {stlValue: {top: 2n, bottom: 1n}});
				return {stlValue: {top: 2n, bottom: 1n}};
			})()`
		);
	});
});

import { Node, x } from "code-red";
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
		const node: Node = BlockStmt([
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
});

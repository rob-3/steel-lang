import { x } from "code-red";
import { describe, it } from "vitest";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import { FunctionDefinition } from "../../src/nodes/FunctionDefinition";
import { FunctionExpr } from "../../src/nodes/FunctionExpr";
import { VariableDeclarationStmt } from "../../src/nodes/VariableDeclarationStmt";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";

describe("FunctionDefinition codegen", () => {
	it("should compile function definitions", () => {
		const node = FunctionDefinition(
			VariableDeclarationStmt(
				"sum",
				true,
				FunctionExpr(
					["a", "b"],
					BinaryExpr(VariableExpr("a"), TokenType.PLUS, VariableExpr("b"))
				)
			)
		).estree();
		assertEqual(node, x`sum = (a, b) => stlAdd(a, b)`);
	});
});

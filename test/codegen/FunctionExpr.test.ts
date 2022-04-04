import { Node, x } from "code-red";
import { describe, it } from "vitest";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import { FunctionExpr } from "../../src/nodes/FunctionExpr";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";

describe("FunctionExpr codegen", () => {
	it("should compile a lambda expression", () => {
		const node: Node = FunctionExpr(
			["a", "b"],
			BinaryExpr(VariableExpr("a"), TokenType.PLUS, VariableExpr("b"))
		).estree();
		assertEqual(node, x`(a, b) => stlAdd(a, b)`);
	});
});

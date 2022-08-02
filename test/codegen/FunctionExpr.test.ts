import { x } from "code-red";
import { describe, it } from "vitest";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import { FunctionExpr } from "../../src/nodes/FunctionExpr";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";

describe("FunctionExpr codegen", () => {
	it("should compile a lambda expression", () => {
		const node = FunctionExpr(
			[
				{ name: "a", isImmutable: true },
				{ name: "b", isImmutable: true },
			],
			BinaryExpr(VariableExpr("a"), TokenType.PLUS, VariableExpr("b"))
		).estree();
		assertEqual(node, x`(a, b) => stlAdd(a, b)`);
	});
});

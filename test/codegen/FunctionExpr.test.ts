import { x } from "code-red";
import { describe, it } from "vitest";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import { BlockStmt } from "../../src/nodes/BlockStmt";
import { FunctionExpr } from "../../src/nodes/FunctionExpr";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { VariableDeclarationStmt } from "../../src/nodes/VariableDeclarationStmt";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import StlNumber from "../../src/StlNumber";
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

	it("should compile a lambda with an inner variable declaration", () => {
		const node = FunctionExpr(
			[
				{ name: "a", isImmutable: true },
				{ name: "b", isImmutable: true },
			],
			BlockStmt([
				VariableDeclarationStmt("c", true, PrimaryExpr(StlNumber.of(5))),
				BinaryExpr(VariableExpr("a"), TokenType.PLUS, VariableExpr("b")),
			])
		).estree();
		assertEqual(
			node,
			x`(a, b) => (() => {
			let c;
			c = { stlValue: { top: 5n, bottom: 1n }};
			return stlAdd(a, b)
		})()`
		);
	});
});

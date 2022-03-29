import { x } from "code-red";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { VariableDeclarationStmt } from "../../src/nodes/VariableDeclarationStmt";
import StlNumber from "../../src/StlNumber";
import { assertEqual } from "../Helpers";
import { describe, it } from "vitest";

describe("VariableDeclarationStmt codegen", () => {
	it("should compile a simple immutable variable declaration", () => {
		const node = VariableDeclarationStmt(
			"a",
			true,
			PrimaryExpr(StlNumber.of(2))
		).estree();
		assertEqual(node, x`a = {stlValue: {top: 2n, bottom: 1n}}`);
	});

	it("should compile a simple mutable variable declaration", () => {
		const node = VariableDeclarationStmt(
			"a",
			false,
			PrimaryExpr(StlNumber.of(2))
		).estree();
		assertEqual(node, x`a = {stlValue: {top: 2n, bottom: 1n}}`);
	});
});

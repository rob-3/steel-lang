import { x } from "code-red";
import { describe, expect, it } from "vitest";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { VariableDeclarationStmt } from "../../src/nodes/VariableDeclarationStmt";
import StlNumber from "../../src/StlNumber";
import { assertEqual } from "../Helpers";

describe("VariableDeclarationStmt codegen", () => {
	it("should compile a simple immutable variable declaration", () => {
		const varDeclarationStmt = VariableDeclarationStmt(
			"a",
			true,
			PrimaryExpr(StlNumber.of(2))
		).estree();
		assertEqual(varDeclarationStmt, x`a = {stlValue: {top: 2n, bottom: 1n}}`);
		expect(varDeclarationStmt.identifierDeclarations).toEqual([
			{ identifier: "a", immutable: true },
		]);
	});

	it("should compile a simple mutable variable declaration", () => {
		const varDeclarationStmt = VariableDeclarationStmt(
			"a",
			false,
			PrimaryExpr(StlNumber.of(2))
		).estree();
		assertEqual(varDeclarationStmt, x`a = {stlValue: {top: 2n, bottom: 1n}}`);
		expect(varDeclarationStmt.identifierDeclarations).toEqual([
			{ identifier: "a", immutable: false },
		]);
	});
});

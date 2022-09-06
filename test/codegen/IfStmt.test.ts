import { x } from "code-red";
import { describe, it } from "vitest";
import { IfStmt } from "../../src/nodes/IfStmt";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { VariableDeclarationStmt } from "../../src/nodes/VariableDeclarationStmt";
import StlNumber from "../../src/StlNumber";
import { assertEqual } from "../Helpers";

describe("IfStmt codegen", () => {
	it("should compile an if statement with else", () => {
		const node = IfStmt(
			PrimaryExpr(true),
			PrimaryExpr(StlNumber.of(2)),
			PrimaryExpr(StlNumber.of(3))
		).estree();
		assertEqual(
			node,
			x`stlUnwrap({stlValue: true}) ? {stlValue: {top: 2n, bottom: 1n}} : {stlValue: {top: 3n, bottom: 1n}}`
		);
	});

	it("should compile an if statement with internal variable declaration", () => {
		const node = IfStmt(
			PrimaryExpr(true),
			VariableDeclarationStmt("greeting", true, PrimaryExpr("hello, world")),
			PrimaryExpr(StlNumber.of(3))
		).estree();
		assertEqual(
			node,
			x`stlUnwrap({stlValue: true}) ? (() => {
				let greeting;
				return greeting = { stlValue: "hello, world" }
			})() : {stlValue: {top: 3n, bottom: 1n}}`
		);
	});

	it("should compile an else statement with internal variable declaration", () => {
		const node = IfStmt(
			PrimaryExpr(true),
			PrimaryExpr(StlNumber.of(3)),
			VariableDeclarationStmt("greeting", true, PrimaryExpr("hello, world"))
		).estree();
		assertEqual(
			node,
			x`stlUnwrap({stlValue: true}) ?
				{stlValue: {top: 3n, bottom: 1n}} :
				(() => {
					let greeting;
					return greeting = { stlValue: "hello, world" }
				})()`
		);
	});
});

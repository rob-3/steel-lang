import { x } from "code-red";
import { describe, it } from "vitest";
import { ObjectLiteral } from "../../src/nodes/ObjectLiteral";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import StlNumber from "../../src/StlNumber";
import { assertEqual } from "../Helpers";

describe("ObjectLiteral codegen", () => {
	it("should compile an empty object literal", () => {
		const node = ObjectLiteral(new Map()).estree();
		assertEqual(node, x`{stlValue: {}}`);
	});

	it("should compile a non-empty object literal", () => {
		const node = ObjectLiteral(
			new Map([
				["sky", PrimaryExpr("blue")],
				["grass", PrimaryExpr("green")],
				["pi", PrimaryExpr(StlNumber.of("3.14"))],
			])
		).estree();
		assertEqual(
			node,
			x`{
				stlValue: {
					sky: {stlValue: "blue"},
					grass: {stlValue: "green"},
					pi: {stlValue: {top: 157n, bottom: 50n}}
				}
			}`
		);
	});
});

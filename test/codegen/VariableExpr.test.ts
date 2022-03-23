import { x } from "code-red";
import { describe, it } from "vitest";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import { assertEqual } from "../Helpers";

describe("VariableExpr codegen", () => {
	it("should compile a variable", () => {
		const node = VariableExpr("a").estree();
		assertEqual(node, x`a`);
	});
});

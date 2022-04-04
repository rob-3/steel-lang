import { Node, x } from "code-red";
import { describe, it } from "vitest";
import { CallExpr } from "../../src/nodes/CallExpr";
import { VariableExpr } from "../../src/nodes/VariableExpr";
import { assertEqual } from "../Helpers";

describe("CallExpr codegen", () => {
	it("should compile a no argument call", () => {
		const node: Node = CallExpr(VariableExpr("hello"), []).estree();
		assertEqual(node, x`hello()`);
	});
});

import { print, b } from "code-red";
import { describe, expect, it } from "vitest";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { ReturnStmt } from "../../src/nodes/ReturnStmt";
import StlNumber from "../../src/StlNumber";

describe("ReturnStmt codegen", () => {
	it("should compile a basic return statement", () => {
		const node = ReturnStmt(PrimaryExpr(StlNumber.of(2))).estree();
		expect(print(node).code).toEqual(
			print(b`return {stlValue: {top: 2n, bottom: 1n}}`[0]).code
		);
	});
});

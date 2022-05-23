import { b } from "code-red";
import { describe, it } from "vitest";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { ReturnStmt } from "../../src/nodes/ReturnStmt";
import StlNumber from "../../src/StlNumber";
import {assertEqual} from "../Helpers";

describe("ReturnStmt codegen", () => {
	it("should compile a basic return statement", () => {
		const node = ReturnStmt(PrimaryExpr(StlNumber.of(2))).estree();
		assertEqual(node, b`return {stlValue: {top: 2n, bottom: 1n}}`[0]);
	});
});

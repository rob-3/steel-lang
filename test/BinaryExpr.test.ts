import { x } from "code-red";
import { BinaryExpr } from "../src/nodes/BinaryExpr";
import { StlNumberExpr } from "../src/nodes/PrimaryExpr";
import StlNumber from "../src/StlNumber";
import Token from "../src/Token";
import TokenType from "../src/TokenType";
import { assertEqual } from "./Helpers";
import { it, describe } from "vitest";

describe("BinaryExpr codegen", () => {
	it("should compile additions", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.PLUS } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlAdd({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});
});

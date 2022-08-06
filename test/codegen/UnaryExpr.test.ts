import { x } from "code-red";
import { describe, it } from "vitest";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { UnaryExpr as _UnaryExpr } from "../../src/nodes/UnaryExpr";
import StlNumber from "../../src/StlNumber";
import Token from "../../src/Token";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";

const UnaryExpr = (operator: TokenType, b: boolean | StlNumber) =>
	_UnaryExpr({ type: operator } as Token, PrimaryExpr(b, []), []);

describe("UnaryExpr codegen", () => {
	it("should compile NOT", () => {
		const node = UnaryExpr(TokenType.NOT, false).estree();
		assertEqual(node, x`{stlValue: stlNot({stlValue: false})}`);
	});

	it("should compile opposite", () => {
		const node = UnaryExpr(TokenType.MINUS, StlNumber.of(42)).estree();
		assertEqual(
			node,
			x`{stlValue: stlOpposite({stlValue: {top: 42n, bottom: 1n}})}`
		);
	});
});

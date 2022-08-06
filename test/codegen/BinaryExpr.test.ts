import { x } from "code-red";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import {
	StlBoolExpr,
	StlNumberExpr,
	StlStringExpr,
} from "../../src/nodes/PrimaryExpr";
import StlNumber from "../../src/StlNumber";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";
import { it, describe } from "vitest";

describe("BinaryExpr codegen", () => {
	it("should compile additions", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.PLUS,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlAdd({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile subtractions", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.MINUS,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlSubtract({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile multiplications", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.STAR,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlMultiply({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile divisions", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.SLASH,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlDivide({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile modulus", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.MOD,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlMod({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile logical AND", () => {
		const node = BinaryExpr(
			StlBoolExpr(true, []),
			TokenType.AND,
			StlBoolExpr(false, []),
			[]
		).estree();
		assertEqual(node, x`stlLogicalAnd({stlValue: true}, {stlValue: false})`);
	});

	it("should compile logical OR", () => {
		const node = BinaryExpr(
			StlBoolExpr(true, []),
			TokenType.OR,
			StlBoolExpr(false, []),
			[]
		).estree();
		assertEqual(node, x`stlLogicalOr({stlValue: true}, {stlValue: false})`);
	});

	it("should compile concatenation", () => {
		const node = BinaryExpr(
			StlStringExpr("hello, ", []),
			TokenType.PLUS_PLUS,
			StlStringExpr("world", []),
			[]
		).estree();
		assertEqual(node, x`stlConcat({stlValue: "hello, "}, {stlValue: "world"})`);
	});

	it("should compile greater equal", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.GREATER_EQUAL,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlGreaterEqual({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile greater", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.GREATER,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlGreater({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile less", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.LESS,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlLess({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile less equal", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.LESS_EQUAL,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlLessEqual({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile equality", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			TokenType.EQUAL_EQUAL,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlEqual({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});
});

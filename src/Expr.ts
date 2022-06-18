import { Node } from "code-red";
import { ArrayLiteral } from "./nodes/ArrayLiteral.js";
import { BinaryExpr } from "./nodes/BinaryExpr.js";
import { BlockStmt } from "./nodes/BlockStmt.js";
import { CallExpr } from "./nodes/CallExpr.js";
import { DotAccess } from "./nodes/DotAccess.js";
import { FunctionDefinition } from "./nodes/FunctionDefinition.js";
import { FunctionExpr } from "./nodes/FunctionExpr.js";
import { GroupingExpr } from "./nodes/GroupingExpr.js";
import { IfStmt } from "./nodes/IfStmt.js";
import { IndexExpr } from "./nodes/IndexExpr.js";
import { MatchStmt, UnderscoreExpr } from "./nodes/MatchStmt.js";
import { ObjectLiteral } from "./nodes/ObjectLiteral.js";
import { PrimaryExpr } from "./nodes/PrimaryExpr.js";
import { PrintStmt } from "./nodes/PrintStmt.js";
import { ReturnStmt } from "./nodes/ReturnStmt.js";
import { UnaryExpr } from "./nodes/UnaryExpr.js";
import { VariableAssignmentStmt } from "./nodes/VariableAssignmentStmt.js";
import { VariableDeclarationStmt } from "./nodes/VariableDeclarationStmt.js";
import { VariableExpr } from "./nodes/VariableExpr.js";
import { WhileStmt } from "./nodes/WhileStmt.js";
import Scope from "./Scope.js";
import Token from "./Token.js";
import { Value } from "./Value.js";

export type ExprBase = {
	tokens: Token[];
	eval(scope: Scope): [Value | null, Scope];
	estree(): {
		node?: Node;
		errors?: Error[];
		identifierDeclarations?: { identifier: string; immutable: boolean }[];
	};
};

export type Expr =
	| ArrayLiteral
	| BinaryExpr
	| BlockStmt
	| CallExpr
	| DotAccess
	| FunctionDefinition
	| FunctionExpr
	| GroupingExpr
	| IfStmt
	| IndexExpr
	| MatchStmt
	| ObjectLiteral
	| PrimaryExpr
	| PrintStmt
	| ReturnStmt
	| UnaryExpr
	| UnderscoreExpr
	| VariableAssignmentStmt
	| VariableDeclarationStmt
	| VariableExpr
	| WhileStmt;

import Scope from "./Scope.js";
import Token from "./Token.js";
import { Value } from "./Value.js";

export type Expr = {
	tokens: Token[];
	eval(scope: Scope): [Value | null, Scope];
}

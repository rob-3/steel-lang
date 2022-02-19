import Scope from "./Scope.js";
import Token from "./Token.js";
import { Value } from "./Value.js";
export interface Expr {
	eval(scope: Scope): [Value | null, Scope];
	tokens: Token[];
}

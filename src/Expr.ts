import Scope from "./Scope";
import Token from "./Token";
import { Value } from "./Value";
export interface Expr {
    eval(scope: Scope): [Value | null, Scope];
    tokens: Token[];
}

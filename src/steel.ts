import { Either } from "purify-ts";
import { Expr } from "./Expr";
import { exprEval } from "./Interpreter";
import { stlPrint } from "./Logger";
import parse from "./Parser";
import Scope from "./Scope";
import { StlFunction } from "./StlFunction";
import tokenize from "./Tokenizer";

/**
 * This function uses the node.js readline api to set up a prompt for the REPL.
 *
 * @param rl readline module from node
 */
export function startRepl(rl: any) {
    let scope = new Scope();
    rl.setPrompt("> ");
    rl.prompt();
    rl.on("line", (input: string) => {
        try {
            scope = run(input, true, scope);
        } catch (err) {
            console.log(err);
        }
        rl.prompt();
    }).on("close", () => {
        console.log("Closing REPL...");
        process.exitCode = 0;
    });
}

/**
 * Runs a string containing Steel source code.
 *
 * @param src the string to run
 * @param repl true if running inside repl, false otherwise
 * @param scope containing Scope for code to run
 * @return A scope after all code has been evaluated
 */
export function run(
    src: string,
    repl: boolean,
    scope: Scope,
    filename: string = "<anonymous>"
): Scope {
    try {
        /*
         * First, we tokenize the source into token like "if", number literals,
         * and punctuation.
         *
         * Next, we parse the list of token into a AST (abstract syntax tree).
         *
         * Last, we use the loop to run each statement sequentially.
         */
        const tokens = tokenize(src, filename);
        const ast: Either<Error[], Expr[]> = parse(tokens);
        const finalScope: Scope = ast.either(
            (badAst) => {
                badAst.map((err) => stlPrint(err.message));
                return scope;
            },
            (goodAst) => {
                return goodAst.reduce<Scope>((scope: Scope, expr: Expr) => {
                    const [val, newScope] = exprEval(expr, scope);
                    // Print if using REPL and if the expression evaluates to a value
                    if (repl && val !== undefined) {
                        // Don't print the internal value of functions
                        if (val instanceof StlFunction) {
                            stlPrint("<Function>");
                        } else {
                            if (val !== null) {
                                stlPrint(val);
                            }
                        }
                    }
                    return newScope;
                }, scope);
            }
        );
        return finalScope;
    } catch (e) {
        console.log(e.message);
        return scope;
    }
}

import Scope from "./Scope";
import { exprEval, setPrintFn } from "./Interpreter";
import tokenize from "./Tokenizer";
import parse from "./Parser";
import { Expr } from "./Expr";

export let source: string;

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
            scope = run(input + "\n", true, scope);
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
export function run(src: string, repl: boolean, scope: Scope): Scope {
    let retScope: Scope = scope;
    try {
        source = src;
        setPrintFn(console.log);
        /*
         * First, we tokenize the source into token like "if", number literals,
         * and punctuation.
         *
         * Next, we parse the list of token into a AST (abstract syntax tree).
         *
         * Last, we use the loop to run each statement sequentially.
         */
        const tokens = tokenize(source);
        const ast: Expr[] = parse(tokens);
        for (const stmt of ast) {
            const [val, newScope] = exprEval(stmt, scope);
            retScope = newScope;
            // Print if using REPL and if the expression evaluates to a value
            if (repl && val !== undefined) {
                console.log(val);
            }
        }
        return retScope;
    } catch (e) {
        console.log(e.message);
        return scope;
    }
}

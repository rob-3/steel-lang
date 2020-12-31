import Scope from "./Scope";
import { exprEval, setPrintFn } from "./Interpreter";
import tokenize from "./Tokenizer";
import parse from "./Parser";
import { Expr } from "./Expr";

export let source: string;

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

export function run(src: string, repl: boolean, scope: Scope): Scope {
    try {
        source = src;
        setPrintFn(console.log);
        const tokens = tokenize(source);
        const ast: Expr[] = parse(tokens);
        for (const stmt of ast) {
            const [val, newScope] = exprEval(stmt, scope);
            scope = newScope;
            if (repl && val !== undefined) {
                console.log(val);
            }
        }
        return scope;
    } catch (e) {
        console.log(e.message);
    }
}

import Scope from "./Scope";
import { exprEval, setPrintFn } from "./Interpreter";
import tokenize from "./Tokenizer";
import parse from "./Parser";

export let source: string;

export function startRepl(rl) {
    let scope = new Scope();
    rl.setPrompt("> ");
    rl.prompt();
    rl.on("line", input => {
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

export function run(src: string, repl: boolean, scope: Scope): Scope {
    try {
        source = src;
        setPrintFn(console.log);
        let tokens = tokenize(source);
        let ast: any = parse(tokens);
        for (let stmt of ast) {
            let [val, newScope] = exprEval(stmt, scope);
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

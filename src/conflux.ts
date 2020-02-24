const fs = require("fs");
const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

import tokenize from "./Tokenizer";
import parse from "./Parser";
import { stmtExec, setPrintFn } from "./Interpreter";
import Scope from "./Scope";
import { Expr } from "./Expr";

if (process.argv.length === 2) {
    startRepl();
} else {
    let filename = process.argv[2];
    fs.readFile(filename, {encoding: "utf-8"}, (err, contents) => {
        if (err) {
            console.log("There was a problem reading the file.");
            process.exitCode = 1;
        } else {
            run(contents, false, new Scope());
            rl.close();
        }
    });
}

function startRepl() {
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

function run(source: string, repl: boolean, scope: Scope): Scope {
    setPrintFn(console.log);
    let tokens = tokenize(source);
    let ast: any = parse(tokens);
    //console.dir(ast[0].right.body.stmts[0].condition.left)
    for (let stmt of ast) {
        let { value: val, state: newScope } = stmtExec(stmt, scope);
        scope = newScope;
        if (stmt instanceof Expr && repl && val !== undefined) {
            console.log(val)
        }
    }
    return scope;
}

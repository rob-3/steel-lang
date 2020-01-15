const fs = require("fs");
const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

import tokenize from "./Tokenizer";
import parse from "./Parser";
import { cfxEval, exec } from "./Interpreter";

if (process.argv.length > 3) {
    console.log("Usage: node conflux [filename]");
} else if (process.argv.length === 2) {
    startRepl();
} else {
    let filename = process.argv[2];
    fs.readFile(filename, {encoding: "utf-8"}, (err, contents) => {
        if (err) {
            console.log("There was a problem reading the file.");
            process.exitCode = 1;
        } else {
            run(contents, false);
            rl.close();
        }
    });
}

function startRepl() {
    rl.setPrompt("> ");
    rl.prompt();
    rl.on("line", input => {
        try {
            run(input, true);
        } catch (err) {
            console.log(err);
        }
        rl.prompt();
    }).on("close", () => {
        console.log("Closing REPL...");
        process.exitCode = 0;
    });
}

function run(source: string, repl: boolean): void {
    let tokens = tokenize(source);
    let ast = parse(tokens);
    for (let stmt of ast) {
        exec(stmt);
    }
    if (repl) console.log(cfxEval(ast[0]));
}

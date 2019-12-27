const fs = require("fs");
const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

import tokenize from "./Tokenizer";
import parse from "./Parser";
import stringify from "./AstPrinter";

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
            run(contents);
            rl.close();
        }
    });
}

function startRepl() {
    rl.setPrompt("> ");
    rl.prompt();
    rl.on("line", input => {
        try {
            run(input + "\n");
        } catch (err) {
            console.log(err);
        }
        rl.prompt();
    }).on("close", () => {
        console.log("Closing REPL...");
        process.exitCode = 0;
    });
}

function run(source: string): void {
    let tokens = tokenize(source);
    let ast = parse(tokens)[0];
    let string = stringify(ast);
    console.log(string);
}

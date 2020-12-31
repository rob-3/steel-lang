const fs = require("fs");
const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

import Scope from "./Scope";
import { startRepl, run } from "./steel";

if (process.argv.length === 2) {
    startRepl(rl);
} else {
    const filename = process.argv[2];
    fs.readFile(filename, { encoding: "utf-8" }, (err, contents) => {
        if (err) {
            console.log("There was a problem reading the file.");
            process.exitCode = 1;
        } else {
            run(contents, false, new Scope());
        }
        rl.close();
    });
}

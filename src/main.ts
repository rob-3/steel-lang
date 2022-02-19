import { readFile } from "fs";
import { createInterface } from "readline";

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

import { stlPrint } from "./Logger.js";
import Scope from "./Scope.js";
import { run, startRepl } from "./steel.js";

// If no filename, start REPL
if (process.argv.length === 2) {
	startRepl(rl);
} else {
	const filename = process.argv[2];
	readFile(
		filename,
		{ encoding: "utf-8" },
		(err, contents: string) => {
			if (err) {
				stlPrint("There was a problem reading the file.");
				process.exitCode = 1;
			} else {
				run(contents, false, new Scope(), filename);
			}
			rl.close();
		}
	);
}

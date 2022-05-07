import { readFile } from "fs";
import { writeFile } from "fs/promises";
import { createInterface } from "readline";

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

import { stlPrint } from "./Logger.js";
import Scope from "./Scope.js";
import { run, startRepl, compile } from "./steel.js";

// If no filename, start REPL
if (process.argv.length === 2) {
	startRepl(rl);
} else {
	if (process.argv[2] === "-c") {
		const filename = process.argv[3];
		readFile(filename, { encoding: "utf-8" }, (err, contents: string) => {
			if (err) {
				stlPrint("There was a problem reading the file.");
				process.exitCode = 1;
			} else {
				const jsCode = compile(contents, filename);
				if (Array.isArray(jsCode)) {
					console.log(jsCode);
				} else {
					const matches = filename.match(/(.*)\.steel/);
					if (matches === null) {
						console.log("There was a problem parsing the filename.");
					} else {
						const jsFilename = `${matches[1]}.js`;
						writeFile(jsFilename, jsCode);
					}
				}
			}
			rl.close();
		});
	} else {
		const filename = process.argv[2];
		readFile(filename, { encoding: "utf-8" }, (err, contents: string) => {
			if (err) {
				stlPrint("There was a problem reading the file.");
				process.exitCode = 1;
			} else {
				run(contents, false, new Scope(), filename);
			}
			rl.close();
		});
	}
}

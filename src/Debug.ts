import Token from "./Token";
import { printfn } from "./Interpreter";
import { source } from "./steel";

/*
 * The standard error format, shamelessly stolen from rust
 */

/*
error: 
  --> ${filename}:${line}:${column}
   |
26 |        ${bad_line}
   |        ^^^^^
*/

/*
 * A panic means we're doomed with no hope of recovery from this. We tear down
 * the process. Anything that happens at runtime is a panic.
 */
export function runtimePanic(message: string) {
    throw Error(message);
}

/*
 * An error means the compile will fail.
 */
export function parseError(message: string, highlight: Token) {
    let location = highlight.location;
    let line: number = location.start[0];
    let column: number = location.start[1];
    let filename = location.filename;

    let pad = line.toString().length;

    // calculate highlight string
    let startColumn = location.start[1];
    let endColumn = location.end[1];
    let highlightString =
        " ".repeat(startColumn - 1) + "^".repeat(endColumn - startColumn);

    // FIXME handle EOF
    let lineNumber = 1;
    let index = 0;
    while (lineNumber < line) {
        let char = source[index];
        if (char === "\n") {
            lineNumber++;
        }
        index++;
    }
    let startIndex = index;
    let endIndex = index;
    while (source[endIndex] !== "\n") {
        endIndex++;
    }
    let lineString = source.slice(startIndex, endIndex);
    return `parse error: ${message} 
${" ".repeat(pad)}--> ${filename}:${line}:${column}
${" ".repeat(pad + 1)}|
${line.toString()} |    ${lineString}
${" ".repeat(pad + 1)}|    ${highlightString}
`;
}

export function lexError(message: string, token: Token) {}

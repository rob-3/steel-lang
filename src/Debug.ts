import { Location } from "./TokenizerHelpers";
export class StlError {
    message: string;
    location: Location;
    badLine: string;

    constructor(message: string, location: Location, badLine: string) {
        this.message = message;
        this.location = location;
        this.badLine = badLine;
    }
}

export function generateMessage(err: StlError): string {
    let { message, location, badLine } = err;
    let [line, column] = location.start;
    let filename = location.filename;
    let start = location.start[1];
    let end = location.end[1];
    let highlightString = " ".repeat(start - 1) + "^".repeat(end - start);

    let pad = line.toString().length;
    return `error: ${message} 
${" ".repeat(pad)}--> ${filename}:${line}:${column}
${" ".repeat(pad + 1)}|
${line.toString()} |    ${badLine}
${" ".repeat(pad + 1)}|    ${highlightString}
`;
}

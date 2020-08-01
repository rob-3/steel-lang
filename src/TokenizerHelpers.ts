export class Location {
    // [line, column]
    start: [number, number];
    end: [number, number];
    filename: string;

    constructor(
        start: [number, number],
        end: [number, number],
        filename: string
    ) {
        this.start = start;
        this.end = end;
        this.filename = filename;
    }
}

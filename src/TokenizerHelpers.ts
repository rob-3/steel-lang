export class Location {
    // [line, column]
    start: [number, number];
    end: [number, number];
    filepath: string;

    constructor(
        start: [number, number],
        end: [number, number],
        filepath: string
    ) {
        this.start = start;
        this.end = end;
        this.filepath = filepath;
    }
}

export default class Location {
	// [line, column]
	start: [number, number];
	end: [number, number];
	filename: string;
	source: string;

	constructor(
		start: [number, number],
		end: [number, number],
		filename: string,
		source: string
	) {
		this.start = start;
		this.end = end;
		this.filename = filename;
		this.source = source;
	}
}

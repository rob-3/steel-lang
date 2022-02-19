import Location from "./Location.js";
import TokenType from "./TokenType.js";

export default class Token {
	type: TokenType;
	lexeme: string;
	literal: any;
	location: Location;

	constructor(
		type: TokenType,
		lexeme: string,
		literal: any,
		location: Location
	) {
		this.type = type;
		this.lexeme = lexeme;
		this.literal = literal;
		this.location = location;
	}
}

import TokenType from "./TokenType";
import { Location } from "./TokenizerHelpers";

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

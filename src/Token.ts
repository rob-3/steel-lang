import { Location } from "./TokenizerHelpers";
import TokenType from "./TokenType";

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

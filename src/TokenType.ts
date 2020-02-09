enum TokenType {
    // single char
    OPEN_PAREN, CLOSE_PAREN, MINUS, PLUS, STAR, SLASH, EQUAL,
    OPEN_BRACKET, CLOSE_BRACKET, OPEN_BRACE, CLOSE_BRACE, DOT, LESS, GREATER,
    COMMA,

    // double char
    EQUAL_EQUAL, GREATER_EQUAL, LESS_EQUAL, PLUS_PLUS, SINGLE_ARROW,

    // literals
    STRING, NUMBER, IDENTIFIER,

    // terminator
    STMT_TERM,

    // keywords
    LET, VAR, IF, ELSE, TRUE, FALSE, FUN, WHILE, FOR, IN, AND, OR, NOT,

    EOF,

    PRINT,
}

export default TokenType;

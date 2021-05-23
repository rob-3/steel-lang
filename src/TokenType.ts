enum TokenType {
    // single char
    OPEN_PAREN,
    CLOSE_PAREN,
    MINUS,
    PLUS,
    STAR,
    SLASH,
    EQUAL,
    OPEN_BRACKET,
    CLOSE_BRACKET,
    OPEN_BRACE,
    CLOSE_BRACE,
    DOT,
    LESS,
    GREATER,
    COMMA,
    MOD,
    UNDERSCORE,
    TILDE,

    // double char
    EQUAL_EQUAL,
    GREATER_EQUAL,
    LESS_EQUAL,
    PLUS_PLUS,
    RIGHT_SINGLE_ARROW,
    RIGHT_DOUBLE_ARROW,
    LEFT_SINGLE_ARROW,

    // literals
    STRING,
    NUMBER,
    IDENTIFIER,

    // newline
    NEWLINE,

    // keywords
    LET,
    IF,
    THEN,
    ELSE,
    TRUE,
    FALSE,
    FUN,
    WHILE,
    FOR,
    IN,
    AND,
    OR,
    NOT,
    MATCH,
    RETURN,
    UNTIL,

    EOF,

    PRINT,
}

export default TokenType;

export default enum TokenType {
    // single char
    OPEN_PAREN, CLOSE_PAREN, MINUS, PLUS, STAR, SLASH, EQUAL,
    OPEN_BRACKET, CLOSE_BRACKET, OPEN_BRACE, CLOSE_BRACE, DOT, LESS, GREATER,

    // double char
    EQUAL_EQUAL, GREATER_EQUAL, LESS_EQUAL, 

    // literals
    STRING, NUMBER, IDENTIFER,

    // keywords
    //LET, VAR, IF, FUNCTION, TRUE, FALSE, AND, OR, NOT, WHILE, FOR, IN
}

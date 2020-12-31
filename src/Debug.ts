import Token from "./Token";
import { source } from "./steel";
import Ast from "./Ast";
import {
    Expr,
    VariableExpr,
    BinaryExpr,
    PrimaryExpr,
    UnaryExpr,
    GroupingExpr,
    CallExpr,
    FunctionExpr,
    UnderscoreExpr,
    VariableDeclarationStmt,
    PrintStmt,
    VariableAssignmentStmt,
    IfStmt,
    BlockStmt,
    WhileStmt,
    ReturnStmt,
    MatchStmt,
    FunctionDefinition,
    IndexExpr,
    ArrayLiteral,
} from "./Expr";

/*
 * The standard error format, shamelessly stolen from rust
 */

/*
error: 
  --> ${filename}:${line}:${column}
   |
26 |        ${bad_line}
   |        ^^^^^
*/

/*
 * A panic means we're doomed with no hope of recovery from this. We tear down
 * the process. Anything that happens at runtime is a panic.
 */
export function RuntimePanic(message: string) {
    return Error(message);
}

/*
 * An error means the compile will fail.
 */
export function ParseError(message: string, highlight: Token) {
    const location = highlight.location;
    const line: number = location.start[0];
    const column: number = location.start[1];
    const filename = location.filename;

    const pad = line.toString().length;

    // calculate highlight string
    const startColumn = location.start[1];
    const endColumn = location.end[1];
    const highlightString =
        " ".repeat(startColumn - 1) + "^".repeat(endColumn - startColumn);

    // FIXME handle EOF
    let lineNumber = 1;
    let index = 0;
    while (lineNumber < line) {
        const char = source[index];
        if (char === "\n") {
            lineNumber++;
        }
        index++;
    }
    const startIndex = index;
    let endIndex = index;
    while (source[endIndex] !== "\n") {
        endIndex++;
    }
    const lineString = source.slice(startIndex, endIndex);
    return Error(`parse error: ${message} 
${" ".repeat(pad)}--> ${filename}:${line}:${column}
${" ".repeat(pad + 1)}|
${line.toString()} |    ${lineString}
${" ".repeat(pad + 1)}|    ${highlightString}
`);
}

export function lexError(message: string, token: Token) {}

export function printAst(ast: Ast) {
    const exprs: Expr[] = ast.exprs;
    let str = "";
    for (const expr of exprs) {
        str += nodeToString(expr);
        str += "\n"
    }
    console.log(str.replace(/\t/g, "  "))
};

function indent(s: string): string {
    return s.replace(/^/gm, "\t");
}

const commaDelimit = (first: string, second: string) => `${first}, ${second}`;
function nodeToString(expr: Expr): string {
    const t = nodeToString;
    const i = indent;
    if (expr instanceof VariableExpr) {
        return `${expr.identifier}`;
    } else if (expr instanceof BinaryExpr) {
        return `BinaryExpr ${t(expr.left)} ${expr.operator.lexeme} ${t(expr.right)}`;
    } else if (expr instanceof PrimaryExpr) {
        return `Primary ${expr.literal}`;
    } else if (expr instanceof UnaryExpr) {
        return `UnaryExpr ${expr.operator}${expr.right}`;
    } else if (expr instanceof GroupingExpr) {
        return `GroupingExpr (${expr.expr})`;
    } else if (expr instanceof CallExpr) {
        return `CallExpr ${t(expr.callee)}(${expr.args.map(t)})`;
    } else if (expr instanceof FunctionExpr) {
        return `FunctionExpr (${expr.args.reduce(commaDelimit)}` + t(expr.body);
    } else if (expr instanceof UnderscoreExpr) {
        return `UnderscoreExpr`;
    } else if (expr instanceof VariableDeclarationStmt) {
        return `VariableDeclarationStmt`;
    } else if (expr instanceof PrintStmt) {
        return `PrintStmt`;
    } else if (expr instanceof VariableAssignmentStmt) {
        return `VariableAssignmentStmt`;
    } else if (expr instanceof IfStmt) {
        return `IfStmt`;
    } else if (expr instanceof BlockStmt) {
        return "{" + expr.exprs.reduce((acc, cur) => acc + "\n" + i(t(cur)) + "\n}", "");
    } else if (expr instanceof WhileStmt) {
        return `WhileStmt`;
    } else if (expr instanceof ReturnStmt) {
        return `ReturnStmt`;
    } else if (expr instanceof MatchStmt) {
        return `MatchStmt`;
    } else if (expr instanceof FunctionDefinition) {
        return `FnDef ${expr.definition.identifier} = ` + t(expr.definition.right);
    } else if (expr instanceof IndexExpr) {
        return `IndexExpr`;
    } else if (expr instanceof ArrayLiteral) {
        return `ArrayLiteral ${expr.exprs.map(t).reduce(commaDelimit)}]`;
    } else throw Error("not an expr type");
}

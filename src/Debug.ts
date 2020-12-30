import Token from "./Token";
import { printfn } from "./Interpreter";
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
    let location = highlight.location;
    let line: number = location.start[0];
    let column: number = location.start[1];
    let filename = location.filename;

    let pad = line.toString().length;

    // calculate highlight string
    let startColumn = location.start[1];
    let endColumn = location.end[1];
    let highlightString =
        " ".repeat(startColumn - 1) + "^".repeat(endColumn - startColumn);

    // FIXME handle EOF
    let lineNumber = 1;
    let index = 0;
    while (lineNumber < line) {
        let char = source[index];
        if (char === "\n") {
            lineNumber++;
        }
        index++;
    }
    let startIndex = index;
    let endIndex = index;
    while (source[endIndex] !== "\n") {
        endIndex++;
    }
    let lineString = source.slice(startIndex, endIndex);
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

function nodeToString(expr: Expr): string {
    const t = nodeToString;
    const i = indent;
    let ret: string;
    if (expr instanceof VariableExpr) {
        ret = `${expr.identifier}`;
    } else if (expr instanceof BinaryExpr) {
        ret = `BinaryExpr ${t(expr.left)} ${expr.operator.lexeme} ${t(expr.right)}`;
    } else if (expr instanceof PrimaryExpr) {
        ret = `Primary ${expr.literal}`;
    } else if (expr instanceof UnaryExpr) {
        ret = `UnaryExpr ${expr.operator}${expr.right}`;
    } else if (expr instanceof GroupingExpr) {
        ret = `GroupingExpr (${expr.expr})`;
    } else if (expr instanceof CallExpr) {
        ret = `CallExpr ${t(expr.callee)}(${expr.args.map(t)})`;
    } else if (expr instanceof FunctionExpr) {
        ret = `FunctionExpr (${expr.args.reduce((acc, cur) => acc + ", " + cur, "")}) => ` + t(expr.body);
    } else if (expr instanceof UnderscoreExpr) {
        ret = `UnderscoreExpr`;
    } else if (expr instanceof VariableDeclarationStmt) {
        ret = `VariableDeclarationStmt`;
    } else if (expr instanceof PrintStmt) {
        ret = `PrintStmt`;
    } else if (expr instanceof VariableAssignmentStmt) {
        ret = `VariableAssignmentStmt`;
    } else if (expr instanceof IfStmt) {
        ret = `IfStmt`;
    } else if (expr instanceof BlockStmt) {
        ret = "{" + expr.exprs.reduce((acc, cur) => acc + "\n" + i(t(cur)) + "\n}", "");
    } else if (expr instanceof WhileStmt) {
        ret = `WhileStmt`;
    } else if (expr instanceof ReturnStmt) {
        ret = `ReturnStmt`;
    } else if (expr instanceof MatchStmt) {
        ret = `MatchStmt`;
    } else if (expr instanceof FunctionDefinition) {
        ret = `FnDef ${expr.definition.identifier} = ` + t(expr.definition.right);
    } else if (expr instanceof IndexExpr) {
        ret = `IndexExpr`;
    } else if (expr instanceof ArrayLiteral) {
        ret = `ArrayLiteral`;
    } else throw Error("not an expr type");
    return ret;
}

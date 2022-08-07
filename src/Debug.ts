import { Ast } from "./Ast.js";
import { Expr } from "./Expr.js";
import Token from "./Token.js";

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
	const {
		start: [line, column],
		filename,
		source,
	} = location;

	const pad = line.toString().length;

	// calculate highlight string
	const startColumn = location.start[1] - 1;
	const endColumn = location.end[1] - 1;
	/* FIXME highlighting is broken with EOF and probably should be reworked
     * entirely
    const highlightString =
        " ".repeat(startColumn - 1) + "^".repeat(endColumn - startColumn);
    */

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
	while (source[endIndex] !== undefined && source[endIndex] !== "\n") {
		endIndex++;
	}
	const lineString = source.slice(startIndex, endIndex);
	return Error(`parse error: ${message}
${" ".repeat(pad)}--> ${filename}:${line}:${column}
${" ".repeat(pad + 1)}|
${line.toString()} |    ${lineString}
${" ".repeat(pad + 1)}|    ${" ".repeat(startColumn)}${"^".repeat(
		endColumn - startColumn
	)}`);
}

export function printAst(ast: Ast) {
	const exprs: Expr[] = ast.exprs;
	let str = "";
	for (const expr of exprs) {
		str += nodeToString(expr);
		str += "\n";
	}
	console.log(str.replace(/\t/g, "  "));
}

function indent(s: string): string {
	return s.replace(/^/gm, "\t");
}

const commaDelimit = (first: string, second: string) => `${first}, ${second}`;
function nodeToString(expr: Expr): string {
	const t = nodeToString;
	const i = indent;
	switch (expr.type) {
		case "VariableExpr":
			return `${expr.identifier}`;
		case "BinaryExpr":
			return `BinaryExpr ${t(expr.left)} ${expr.operator} ${t(expr.right)}`;
		case "PrimaryExpr":
			return `Primary ${expr.literal}`;
		case "UnaryExpr":
			return `UnaryExpr ${expr.operator}${expr.right}`;
		case "GroupingExpr":
			return `GroupingExpr (${expr.expr})`;
		case "CallExpr":
			return `CallExpr ${t(expr.callee)}(${expr.args.map(t)})`;
		case "FunctionExpr":
			return (
				`FunctionExpr (${expr.args
					.map(({ name, isImmutable }) => `${isImmutable ? "" : "var "}${name}`)
					.reduce(commaDelimit)}` + t(expr.body)
			);
		case "UnderscoreExpr":
			return `UnderscoreExpr`;
		case "VariableDeclarationStmt":
			return `VariableDeclarationStmt`;
		case "PrintStmt":
			return `PrintStmt`;
		case "VariableAssignmentStmt":
			return `VariableAssignmentStmt`;
		case "IfStmt":
			return `IfStmt`;
		case "BlockStmt":
			return (
				"{" +
				expr.exprs.reduce((acc, cur) => acc + "\n" + i(t(cur)) + "\n}", "")
			);
		case "WhileStmt":
			return `WhileStmt`;
		case "ReturnStmt":
			return `ReturnStmt`;
		case "MatchStmt":
			return `MatchStmt`;
		case "FunctionDefinition":
			return (
				`FnDef ${expr.definition.identifier} = ` + t(expr.definition.right)
			);
		case "IndexExpr":
			return `IndexExpr`;
		case "ArrayLiteral":
			return `ArrayLiteral ${expr.exprs.map(t).reduce(commaDelimit)}]`;
		default:
			throw Error("not an expr type");
	}
}

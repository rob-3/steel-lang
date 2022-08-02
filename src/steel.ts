import { print } from "code-red";
import { Either } from "purify-ts";
import { Expr } from "./Expr.js";
import { exprEval } from "./Interpreter.js";
import { stlPrint } from "./Logger.js";
import parse from "./Parser.js";
import Scope from "./Scope.js";
import { StlFunction } from "./StlFunction.js";
import tokenize from "./Tokenizer.js";

/**
 * This function uses the node.js readline api to set up a prompt for the REPL.
 *
 * @param rl readline module from node
 */
export function startRepl(rl: any) {
	let scope = new Scope();
	rl.setPrompt("> ");
	rl.prompt();
	rl.on("line", (input: string) => {
		try {
			scope = run(input, true, scope);
		} catch (err) {
			console.log(err);
		}
		rl.prompt();
	}).on("close", () => {
		console.log("Closing REPL...");
		process.exitCode = 0;
	});
}

/**
 * Runs a string containing Steel source code.
 *
 * @param src the string to run
 * @param repl true if running inside repl, false otherwise
 * @param scope containing Scope for code to run
 * @return A scope after all code has been evaluated
 */
export function run(
	src: string,
	repl: boolean,
	scope: Scope,
	filename: string = "<anonymous>"
): Scope {
	try {
		/*
		 * First, we tokenize the source into token like "if", number literals,
		 * and punctuation.
		 *
		 * Next, we parse the list of token into a AST (abstract syntax tree).
		 *
		 * Last, we use the loop to run each statement sequentially.
		 */
		const tokens = tokenize(src, filename);
		const ast: Either<Error[], Expr[]> = tokens.chain(parse);
		const finalScope: Scope = ast.caseOf({
			Left: (badAst) => {
				badAst.map((err) => stlPrint(err.message));
				return scope;
			},
			Right: (goodAst) => {
				return goodAst.reduce<Scope>((scope: Scope, expr: Expr) => {
					const [val, newScope] = exprEval(expr, scope);
					// Print if using REPL and if the expression evaluates to a value
					if (repl && val !== undefined) {
						// Don't print the internal value of functions
						if (val instanceof StlFunction) {
							stlPrint("<Function>");
						} else {
							if (val !== null) {
								stlPrint(val.value);
							}
						}
					}
					return newScope;
				}, scope);
			},
		});
		return finalScope;
	} catch (e) {
		console.log((e as Error).message);
		return scope;
	}
}

export function compile(src: string, filename: string) {
	const output = tokenize(src, filename).chain(parse);
	return output.caseOf<Error[] | string>({
		Left: (err) => {
			return err;
		},
		Right: (exprs) => {
			const names: { identifier: string, immutable: boolean }[] = [];
			const exprStrings = exprs
				.map((expr) => {
					const jsCode = expr.estree();
					if (jsCode.errors) {
						throw jsCode.errors;
					} else {
						if (jsCode.identifierDeclarations) {
							names.push(...jsCode.identifierDeclarations);
						}
						return jsCode.node ? print(jsCode.node).code : Error("No node!");
					}
				})
				.filter((x) => x !== "");
			const letDecls = names.map(({ identifier }) => `let ${identifier};`).join("\n");
			const outputJS = exprStrings.join(";\n");
			return `const stlEqual = (a, b) =>
	a.stlValue.top === b.stlValue.top && a.stlValue.bottom === b.stlValue.bottom;
const stlAdd = (a, b) => ({
	stlValue: {
		top: a.stlValue.top + b.stlValue.top,
		bottom: a.stlValue.bottom,
	},
});
const stlSubtract = (a, b) => ({
	stlValue: {
		top: a.stlValue.top - b.stlValue.top,
		bottom: a.stlValue.bottom,
	},
});
const print = (arg) => {
  const { stlValue } = arg;
  if (typeof arg === "function") {
    console.log("<lambda>");
  } else if (typeof stlValue === "string" || typeof stlValue === "boolean") {
    console.log(stlValue);
  } else if ('top' in stlValue) {
    if (stlValue.bottom === 1n) {
      console.log(stlValue.top.toString());
    } else {
      console.log(\`\${stlValue.top}/\${stlValue.bottom}\`);
    }
  } else {
    console.log(stlValue);
  }
};
${letDecls}
${outputJS}`;
		},
	});
}

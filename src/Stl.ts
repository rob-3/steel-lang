import { Expr } from "./Expr";
import { generateMessage } from "./Debug";

/*
 * A panic means we're doomed with no hope of recovery from this. We tear down
 * the process. Anything that happens at runtime is a panic.
 */
export function runtimePanic(message: string, expr: Expr) {
    let location = expr.getDebugInfo();
    console.log(
        generateMessage({
            message,
            location: location,
            badLine: null
        })
    );
}

/*
 * An error is recoverable or at least ignorable and we should print a
 * error but continue as best as we can.
 */
export function error(message: string, expr: Expr) {}

/*
 * A warning is not actually a serious flaw in the code but represents code
 * smell or something that might not be what the programmer intends.
 */
export function warning(message: string, expr: Expr) {}

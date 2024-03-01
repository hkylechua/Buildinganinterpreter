import { Expression, Statement } from "../include/parser.js";

type RuntimeValue = number | boolean;
export type State = { [key: string]: State | RuntimeValue };

const PARENT_STATE_KEY = "[[PARENT]]";

export function interpExpression(state: State, exp: Expression): RuntimeValue {
  // TODO
  switch (exp.kind) {
    case "boolean":
      return exp.value;
    case "number":
      return exp.value;
    case "variable":
      while (state[PARENT_STATE_KEY] && typeof state[exp.name] === "undefined") {
        state = state[PARENT_STATE_KEY] as State;
      }
      if (typeof state[exp.name] === "boolean" || typeof state[exp.name] === "number") {
        return state[exp.name] as RuntimeValue;
      }
      throw new Error(`Variable '${exp.name}' is not defined in the state.`);
    case "operator": {
      const left = interpExpression(state, exp.left);
      const right = interpExpression(state, exp.right);
      if (
        exp.operator === "+" ||
        exp.operator === "-" ||
        exp.operator === "*" ||
        exp.operator === "/" ||
        exp.operator === ">" ||
        exp.operator === "<"
      ) {
        if (typeof left !== "number" || typeof right !== "number") {
          throw new Error(`Both operands should be numbers for binary operations`);
        }
        switch (exp.operator) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            if (right === 0) {
              throw new Error(`Division by zero is not allowed`);
            }
            return left / right;
          case ">":
            return left > right;
          case "<":
            return left < right;
        }
      } else if (exp.operator === "&&" || exp.operator === "||") {
        if (typeof left !== "boolean" || typeof right !== "boolean") {
          throw new Error(`Both operands should be true or false for boolean operations`);
        }
        switch (exp.operator) {
          case "&&":
            return Boolean(left) && Boolean(right);
          case "||":
            return Boolean(left) || Boolean(right);
        }
      } else {
        switch (exp.operator) {
          case "===":
            if (
              (typeof left !== "number" || typeof right !== "number") &&
              (typeof left !== "boolean" || typeof right !== "boolean")
            ) {
              throw new Error(`Both operands should be numbers or booleans for '===' operation`);
            }
            return left === right;
        }
      }
    }
  }
  throw new Error(`Unsupported expression type ${exp.kind}`);
}

function mergeStates(outerState: State, innerState: State) {
  for (const key in outerState) {
    if (key in innerState) {
      outerState[key] = innerState[key];
    }
  }
}

export function interpStatement(state: State, stmt: Statement): void {
  // TODO
  switch (stmt.kind) {
    case "let":
      if (stmt.name in state) {
        throw new Error(`Variable ${stmt.name} already exists.`);
      }
      const letValue = interpExpression(state, stmt.expression);
      state[stmt.name] = letValue;
      console.log(state);
      break;
    case "assignment":
      if (!(stmt.name in state)) {
        throw new Error(`Variable ${stmt.name} does not exist.`);
      }
      const assignValue = interpExpression(state, stmt.expression);
      state[stmt.name] = assignValue;
      break;
    case "if":
      const ifTestValue = interpExpression(state, stmt.test);
      if (typeof ifTestValue !== "boolean") {
        throw new Error("Test expression in 'if' statement must be boolean.");
      }
      if (ifTestValue) {
        const newState = { ...state, [PARENT_STATE_KEY]: state };
        stmt.truePart.forEach(subStmt => interpStatement(newState, subStmt));
        mergeStates(state, newState);
      } else {
        const newState = { ...state, [PARENT_STATE_KEY]: state };
        stmt.falsePart.forEach(subStmt => interpStatement(newState, subStmt));
        mergeStates(state, newState);
      }
      break;
    case "while":
      let whileTestValue = interpExpression(state, stmt.test);
      if (typeof whileTestValue !== "boolean") {
        throw new Error("Test expression in 'while' statement must be boolean.");
      }
      while (whileTestValue) {
        const newState = { ...state, [PARENT_STATE_KEY]: state };
        stmt.body.forEach(subStmt => interpStatement(newState, subStmt));
        mergeStates(state, newState);
        whileTestValue = interpExpression(state, stmt.test);
      }
      break;
    case "print":
      const printValue = interpExpression(state, stmt.expression);
      console.log(printValue);
      break;
  }
}

export function interpProgram(program: Statement[]): State {
  // TODO
  const state: State = {};

  for (const statement of program) {
    interpStatement(state, statement);
  }

  return state;
}

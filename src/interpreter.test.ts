import { parseExpression, parseProgram } from "../include/parser.js";
import { State, interpExpression, interpProgram, interpStatement } from "./interpreter.js";

const PARENT_STATE_KEY = "[[PARENT]]";

function expectStateToBe(program: string, state: State) {
  expect(interpProgram(parseProgram(program))).toEqual(state);
}

describe("interpExpression", () => {
  it("evaluates multiplication with a variable", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x * 2"));

    expect(r).toEqual(20);
  });

  it("evaluates addition", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x + 5"));
    expect(r).toEqual(15);
  });

  it("evaluates subtraction", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x - 5"));
    expect(r).toEqual(5);
  });

  it("evaluates division", () => {
    const r = interpExpression({ x: 20 }, parseExpression("x / 2"));
    expect(r).toEqual(10);
  });

  it("evaluates equality comparison", () => {
    const r = interpExpression({ x: 10, y: 10 }, parseExpression("x === y"));
    expect(r).toEqual(true);
  });

  it("evaluates logical OR", () => {
    const r1 = interpExpression({}, parseExpression("true || false"));
    expect(r1).toEqual(true);

    const r2 = interpExpression({}, parseExpression("false || false"));
    expect(r2).toEqual(false);

    expect(() => {
      interpExpression({ x: 10 }, parseExpression("x || true"));
    }).toThrow(new Error("Both operands should be true or false for boolean operations"));
  });

  it("throws error for invalid equality operation with boolean", () => {
    expect(() => {
      interpExpression({ x: true }, parseExpression("x === 2"));
    }).toThrow(new Error("Both operands should be numbers or booleans for '===' operation"));
  });

  it("throws error for division by zero", () => {
    expect(() => {
      interpExpression({}, parseExpression("1 / 0"));
    }).toThrow(new Error("Division by zero is not allowed"));
  });

  it("evaluates greater than comparison", () => {
    const r = interpExpression({ x: 20, y: 10 }, parseExpression("x > y"));
    expect(r).toEqual(true);
  });

  it("evaluates greater than comparison with negative numbers", () => {
    const r = interpExpression({ x: -5, y: -10 }, parseExpression("x > y"));
    expect(r).toEqual(true);
  });

  it("evaluates greater than comparison with decimals", () => {
    const r = interpExpression({ x: 3.14, y: 2.72 }, parseExpression("x > y"));
    expect(r).toEqual(true);
  });

  it("throws error for invalid operands", () => {
    expect(() => {
      interpExpression({ x: true }, parseExpression("x > 2"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
  });

  it("evaluates boolean operators", () => {
    const r = interpExpression({}, parseExpression("true && false"));
    expect(r).toEqual(false);
  });

  it("evaluates valid less than comparison", () => {
    const r = interpExpression({ x: 10, y: 20 }, parseExpression("x < y"));
    expect(r).toEqual(true);
  });

  it("evaluates valid less than comparison with decimal numbers", () => {
    const r = interpExpression({ x: 1.5, y: 2.5 }, parseExpression("x < y"));
    expect(r).toEqual(true);
  });

  it("evaluates valid less than comparison with negative numbers", () => {
    const r = interpExpression({ x: -10, y: -5 }, parseExpression("x < y"));
    expect(r).toEqual(true);
  });

  it("throws error for invalid less than comparison with boolean", () => {
    expect(() => {
      interpExpression({ x: true, y: 2 }, parseExpression("x < y"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
  });

  it("evaluates boolean expression", () => {
    const r = interpExpression({}, parseExpression("true || false"));
    expect(r).toEqual(true);
  });

  it("evaluates number expression", () => {
    const r = interpExpression({}, parseExpression("10 * 2"));
    expect(r).toEqual(20);
  });

  it("evaluates less than comparison", () => {
    const r = interpExpression({ x: 20, y: 30 }, parseExpression("x < y"));
    expect(r).toEqual(true);
  });

  it("evaluates variable expression", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x"));
    expect(r).toEqual(10);
  });

  it("throws error for undefined variable in any accessible scope", () => {
    expect(() => {
      interpExpression({}, parseExpression("x"));
    }).toThrow(new Error("Variable 'x' is not defined in the state."));
  });

  it("evaluates operator expression", () => {
    const r = interpExpression({ x: 10, y: 20 }, parseExpression("x + y"));
    expect(r).toEqual(30);
  });

  it("throws error for invalid binary operation", () => {
    expect(() => {
      interpExpression({ x: true }, parseExpression("x + 2"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
  });

  it("throws error for invalid logical operation", () => {
    expect(() => {
      interpExpression({ x: 10 }, parseExpression("x && true"));
    }).toThrow(new Error("Both operands should be true or false for boolean operations"));
  });

  it("interprets number expressions", () => {
    const state = {};
    const exp = parseExpression("5");
    expect(interpExpression(state, exp)).toEqual(5);
  });

  it("interprets boolean expressions", () => {
    const state = {};
    const exp = parseExpression("true");
    expect(interpExpression(state, exp)).toEqual(true);
  });

  it("interprets variable expressions", () => {
    const state = { x: 10 };
    const exp = parseExpression("x");
    expect(interpExpression(state, exp)).toEqual(10);
  });

  it("interprets binary operator expressions", () => {
    const state = {};
    const exp = parseExpression("5 + 10");
    expect(interpExpression(state, exp)).toEqual(15);
  });

  it("returns product of two numbers", () => {
    const r = interpExpression({}, parseExpression("2 * 3"));
    expect(r).toEqual(6);
  });

  it("throws error when left operand is not a number", () => {
    expect(() => {
      interpExpression({}, parseExpression("true * 3"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
  });

  it("throws error when right operand is not a number", () => {
    expect(() => {
      interpExpression({}, parseExpression("2 * false"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
  });

  it("throws error when both operands are not numbers", () => {
    expect(() => {
      interpExpression({}, parseExpression("true * false"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
  });

  it("evaluates subtraction of two numbers", () => {
    const r = interpExpression({}, parseExpression("10 - 5"));
    expect(r).toEqual(5);
  });

  it("throws error for non-number operands", () => {
    expect(() => {
      interpExpression({}, parseExpression("true - 2"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
    expect(() => {
      interpExpression({}, parseExpression("2 - false"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
    expect(() => {
      interpExpression({}, parseExpression("true - false"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
  });

  it("throws error for invalid division operation with boolean", () => {
    expect(() => {
      interpExpression({ x: true }, parseExpression("x / 2"));
    }).toThrow(new Error("Both operands should be numbers for binary operations"));
  });

  it("accesses the variable value from the state", () => {
    const state: State = { x: 10, [PARENT_STATE_KEY]: { y: 20 } };
    const exp = parseExpression("x");
    expect(interpExpression(state, exp)).toEqual(10);
  });

  it("accesses the variable value from the parent state when not found in current state", () => {
    const state: State = { [PARENT_STATE_KEY]: { x: 10 } };
    const exp = parseExpression("x");
    expect(interpExpression(state, exp)).toEqual(10);
  });

  it("throws an error when variable is not found in any accessible state", () => {
    const state: State = { [PARENT_STATE_KEY]: { y: 20 } };
    const exp = parseExpression("x");
    expect(() => interpExpression(state, exp)).toThrow(`Variable 'x' is not defined in the state.`);
  });
});

describe("interpStatement", () => {
  // Tests for interpStatement go here.
  it("handles variable declaration", () => {
    const state: State = {};
    interpStatement(state, parseProgram("let x = 10;")[0]);
    expect(state).toEqual({ x: 10 });
  });

  it("handles variable assignment", () => {
    const state: State = { x: 10 };
    interpStatement(state, parseProgram("x = 20;")[0]);
    expect(state).toEqual({ x: 20 });
  });

  it("2 handles variable declaration", () => {
    const state: State = {};
    interpStatement(state, parseProgram("let x = 10;")[0]);
    expect(state).toEqual({ x: 10 });
  });

  it("3 handles variable assignment", () => {
    const state: State = { x: 10 };
    interpStatement(state, parseProgram("x = 20;")[0]);
    expect(state).toEqual({ x: 20 });
  });

  it("handles if statement with false condition", () => {
    const state: State = { x: 10 };
    interpStatement(state, parseProgram("if (x > 15) { x = x - 5; } else { x = x + 5; }")[0]);
    expect(state).toEqual({ x: 15 });
  });

  it("handles while statement with false condition", () => {
    const state: State = { x: 0 };
    interpStatement(state, parseProgram("while (x > 0) { x = x - 1; }")[0]);
    expect(state).toEqual({ x: 0 });
  });

  it("handles if statement", () => {
    const state: State = { x: 10 };
    interpStatement(state, parseProgram("if (x > 5) { x = x - 5; } else { x = x + 5; }")[0]);
    expect(state).toEqual({ x: 5 });
  });

  it("handles while statement", () => {
    const state: State = { x: 10 };
    interpStatement(state, parseProgram("while (x > 0) { x = x - 1; }")[0]);
    expect(state).toEqual({ x: 0 });
  });

  it("handles print statement", () => {
    console.log = jest.fn();
    const state: State = { x: 10 };
    interpStatement(state, parseProgram("print(x);")[0]);
    expect(console.log).toHaveBeenCalledWith(10);
  });

  it("throws error for duplicate variable declaration", () => {
    const state: State = { x: 10 };
    expect(() => {
      interpStatement(state, parseProgram("let x = 20;")[0]);
    }).toThrow(new Error("Variable x already exists."));
  });

  it("throws error for variable assignment before declaration", () => {
    const state: State = {};
    expect(() => {
      interpStatement(state, parseProgram("x = 20;")[0]);
    }).toThrow(new Error("Variable x does not exist."));
  });

  it("throws error for non-boolean test in while statement", () => {
    const state: State = { x: 10 };
    expect(() => {
      interpStatement(state, parseProgram("while (x) { x = x - 1; }")[0]);
    }).toThrow(new Error("Test expression in 'while' statement must be boolean."));
  });
});

describe("interpProgram", () => {
  it("handles declarations and reassignment", () => {
    // TIP: Use the grave accent to define multiline strings
    expectStateToBe(
      `      
      let x = 10;
      x = 20;
    `,
      { x: 20 }
    );
  });

  it("handles complex programs", () => {
    expectStateToBe(
      `      
      let x = 10;
      let y = 20;
      x = x + y;
    `,
      { x: 30, y: 20 }
    );
  });
  it("handles a handful of complex programs", () => {
    expectStateToBe(
      `      
      let x = 10;
      let y = 20;
      if (x > y) {
        x = x - y;
      } else {
        x = x + y;
      }
      while (x > 0) {
        x = x - 1;
      }
      print(x);
    `,
      { x: 0, y: 20 }
    );
  });

  it("throws error for duplicate variable declaration", () => {
    const state: State = { x: 10 };
    expect(() => {
      interpStatement(state, parseProgram("let x = 20;")[0]);
    }).toThrow(new Error("Variable x already exists."));
  });

  it("throws error for variable assignment before declaration", () => {
    const state: State = {};
    expect(() => {
      interpStatement(state, parseProgram("x = 20;")[0]);
    }).toThrow(new Error("Variable x does not exist."));
  });

  it("throws error for non-boolean test in if statement", () => {
    const program = `
    let x = 10;
    if (x) {
      x = 20;
    } else {
      x = 30;
    }
    `;
    expect(() => {
      interpProgram(parseProgram(program));
    }).toThrow("Test expression in 'if' statement must be boolean.");
  });

  it("throws error for non-boolean test in while statement", () => {
    const state: State = { x: 10 };
    expect(() => {
      interpStatement(state, parseProgram("while (x) { x = x - 1; }")[0]);
    }).toThrow(new Error("Test expression in 'while' statement must be boolean."));
  });

  it("handles programs with print statements", () => {
    console.log = jest.fn();
    const program = `
      let x = 10;
      print(x);
    `;
    const state = interpProgram(parseProgram(program));
    expect(state).toEqual({ x: 10 });
    expect(console.log).toHaveBeenCalledWith(10);
  });
});

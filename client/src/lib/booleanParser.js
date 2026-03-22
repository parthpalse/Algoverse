/**
 * Boolean expression parser and evaluator.
 * Variables: single letters A-Z
 * Operators: ! (not), & (and), | (or), ^ (xor), -> (implies), <-> (iff)
 * Parentheses supported. Precedence: ! > & > ^ > | > -> > <->
 */

function tokenize(input) {
  const s = input.replace(/\s+/g, "");
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "(") {
      tokens.push({ type: "LPAREN" });
      i++;
    } else if (c === ")") {
      tokens.push({ type: "RPAREN" });
      i++;
    } else if (c === "!") {
      tokens.push({ type: "NOT" });
      i++;
    } else if (c === "&") {
      tokens.push({ type: "AND" });
      i++;
    } else if (c === "|") {
      tokens.push({ type: "OR" });
      i++;
    } else if (c === "^") {
      tokens.push({ type: "XOR" });
      i++;
    } else if (c === "-" && s[i + 1] === ">") {
      tokens.push({ type: "IMPL" });
      i += 2;
    } else if (c === "<" && s[i + 1] === "-" && s[i + 2] === ">") {
      tokens.push({ type: "IFF" });
      i += 3;
    } else if (c >= "A" && c <= "Z") {
      tokens.push({ type: "VAR", name: c });
      i++;
    } else {
      throw new Error(`Unexpected character '${c}' at position ${i}`);
    }
  }
  tokens.push({ type: "EOF" });
  return tokens;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }
  peek() {
    return this.tokens[this.pos];
  }
  eat(type) {
    const t = this.peek();
    if (t.type !== type) {
      throw new Error(`Expected ${type}, got ${t.type}`);
    }
    this.pos++;
    return t;
  }
  parse() {
    const node = this.parseIff();
    this.eat("EOF");
    return node;
  }
  parseIff() {
    let left = this.parseImpl();
    while (this.peek().type === "IFF") {
      this.eat("IFF");
      const right = this.parseImpl();
      left = { op: "IFF", left, right };
    }
    return left;
  }
  parseImpl() {
    let left = this.parseOr();
    while (this.peek().type === "IMPL") {
      this.eat("IMPL");
      const right = this.parseOr();
      left = { op: "IMPL", left, right };
    }
    return left;
  }
  parseOr() {
    let left = this.parseXor();
    while (this.peek().type === "OR") {
      this.eat("OR");
      const right = this.parseXor();
      left = { op: "OR", left, right };
    }
    return left;
  }
  parseXor() {
    let left = this.parseAnd();
    while (this.peek().type === "XOR") {
      this.eat("XOR");
      const right = this.parseAnd();
      left = { op: "XOR", left, right };
    }
    return left;
  }
  parseAnd() {
    let left = this.parseUnary();
    while (this.peek().type === "AND") {
      this.eat("AND");
      const right = this.parseUnary();
      left = { op: "AND", left, right };
    }
    return left;
  }
  parseUnary() {
    if (this.peek().type === "NOT") {
      this.eat("NOT");
      return { op: "NOT", arg: this.parseUnary() };
    }
    return this.parsePrimary();
  }
  parsePrimary() {
    const t = this.peek();
    if (t.type === "VAR") {
      this.eat("VAR");
      return { op: "VAR", name: t.name };
    }
    if (t.type === "LPAREN") {
      this.eat("LPAREN");
      const inner = this.parseIff();
      this.eat("RPAREN");
      return inner;
    }
    throw new Error(`Unexpected token ${t.type} in primary`);
  }
}

export function parseBooleanExpression(input) {
  const tokens = tokenize(input);
  const p = new Parser(tokens);
  return p.parse();
}

export function collectVariables(ast, set = new Set()) {
  if (!ast) return set;
  if (ast.op === "VAR") {
    set.add(ast.name);
    return set;
  }
  if (ast.op === "NOT") {
    collectVariables(ast.arg, set);
    return set;
  }
  collectVariables(ast.left, set);
  collectVariables(ast.right, set);
  return set;
}

export function evaluateAst(ast, assignment) {
  switch (ast.op) {
    case "VAR":
      return !!assignment[ast.name];
    case "NOT":
      return !evaluateAst(ast.arg, assignment);
    case "AND":
      return evaluateAst(ast.left, assignment) && evaluateAst(ast.right, assignment);
    case "OR":
      return evaluateAst(ast.left, assignment) || evaluateAst(ast.right, assignment);
    case "XOR":
      return evaluateAst(ast.left, assignment) !== evaluateAst(ast.right, assignment);
    case "IMPL":
      return !evaluateAst(ast.left, assignment) || evaluateAst(ast.right, assignment);
    case "IFF":
      return evaluateAst(ast.left, assignment) === evaluateAst(ast.right, assignment);
    default:
      throw new Error("Unknown op");
  }
}

export function buildTruthTable(input) {
  const ast = parseBooleanExpression(input);
  const vars = Array.from(collectVariables(ast)).sort();
  if (vars.length === 0) {
    throw new Error("Expression must contain at least one variable (A-Z)");
  }
  const rows = [];
  const n = vars.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    const assignment = {};
    for (let i = 0; i < n; i++) {
      assignment[vars[i]] = !!(mask & (1 << (n - 1 - i)));
    }
    const value = evaluateAst(ast, assignment);
    rows.push({ assignment: { ...assignment }, value });
  }
  const minterms = rows
    .map((r, idx) => ({ ...r, idx }))
    .filter((r) => r.value)
    .map((r) => r.idx);
  const maxterms = rows
    .map((r, idx) => ({ ...r, idx }))
    .filter((r) => !r.value)
    .map((r) => r.idx);

  const literal = (v, positive) => (positive ? v : `!${v}`);

  const mintermExpr = (idx) => {
    const parts = [];
    for (let i = 0; i < n; i++) {
      const bit = (idx >> (n - 1 - i)) & 1;
      parts.push(literal(vars[i], bit === 1));
    }
    return parts.join(" & ");
  };

  const maxtermExpr = (idx) => {
    const parts = [];
    for (let i = 0; i < n; i++) {
      const bit = (idx >> (n - 1 - i)) & 1;
      parts.push(literal(vars[i], bit === 0));
    }
    return parts.join(" | ");
  };

  const dnf =
    minterms.length === 0
      ? "0"
      : minterms.length === 1 << n
        ? "1"
        : minterms.map(mintermExpr).join(" | ");

  const cnf =
    maxterms.length === 0
      ? "1"
      : maxterms.length === 1 << n
        ? "0"
        : maxterms.map(maxtermExpr).map((c) => `(${c})`).join(" & ");

  return {
    vars,
    rows,
    cnf,
    dnf,
    expression: input.replace(/\s+/g, " ").trim(),
  };
}

/**
 * Vlerësues minimal formulash Excel për testet (only the subset the exporter writes):
 * numbers, strings, + − * /, unary minus, parentheses, cell refs with optional sheet and $,
 * ranges, SUM, SUMIF(range,"x",sumRange) and MAX. Referenced formula cells are evaluated
 * recursively (cached results are ignored), so a wrong reference shows up as a wrong number.
 */
import type ExcelJS from 'exceljs';

type Value = number | string | Value[];

interface Token {
  kind: 'num' | 'str' | 'ref' | 'name' | 'op';
  text: string;
}

const TOKEN_RE =
  /\s*(?:(\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)|"((?:[^"]|"")*)"|((?:'(?:[^']|'')+'|[A-Za-z_][\w.]*)!\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?|\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?)(?![\w(])|([A-Z][A-Z0-9.]*)(?=\()|([-+*/(),]))/y;

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  TOKEN_RE.lastIndex = 0;
  let index = 0;
  while (index < formula.length) {
    if (/^\s*$/.test(formula.slice(index))) break;
    TOKEN_RE.lastIndex = index;
    const m = TOKEN_RE.exec(formula);
    if (!m) throw new Error(`Formulë e panjohur pranë: ${formula.slice(index)}`);
    if (m[1] !== undefined) tokens.push({ kind: 'num', text: m[1] });
    else if (m[2] !== undefined) tokens.push({ kind: 'str', text: m[2].replace(/""/g, '"') });
    else if (m[3] !== undefined) tokens.push({ kind: 'ref', text: m[3] });
    else if (m[4] !== undefined) tokens.push({ kind: 'name', text: m[4] });
    else tokens.push({ kind: 'op', text: m[5] });
    index = TOKEN_RE.lastIndex;
  }
  return tokens;
}

function colNumber(letters: string): number {
  return [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
}

function parseAddress(address: string): { row: number; col: number } {
  const m = /^\$?([A-Z]+)\$?(\d+)$/.exec(address);
  if (!m) throw new Error(`Adresë e pavlefshme: ${address}`);
  return { col: colNumber(m[1]), row: Number(m[2]) };
}

export class FormulaEvaluator {
  private depth = 0;

  constructor(private readonly wb: ExcelJS.Workbook) {}

  /** Value of a cell: formulas are recomputed, plain values returned as they are. */
  cellValue(sheetName: string, row: number, col: number): number | string {
    const ws = this.wb.getWorksheet(sheetName);
    if (!ws) throw new Error(`Mungon fleta ${sheetName}`);
    const value = ws.getCell(row, col).value as unknown;
    if (value && typeof value === 'object' && 'formula' in (value as object)) {
      if (++this.depth > 200) throw new Error('Referencë rrethore');
      try {
        return this.evaluate(sheetName, (value as { formula: string }).formula);
      } finally {
        this.depth--;
      }
    }
    if (typeof value === 'number' || typeof value === 'string') return value;
    return 0; // empty cells count as 0, as in Excel
  }

  evaluate(sheetName: string, formula: string): number {
    const tokens = tokenize(formula);
    let pos = 0;
    const peek = () => tokens[pos];
    const take = (text?: string) => {
      const token = tokens[pos++];
      if (!token || (text !== undefined && token.text !== text)) throw new Error(`Pritej ${text ?? 'token'} te ${formula}`);
      return token;
    };
    const num = (v: Value): number => {
      if (Array.isArray(v)) throw new Error(`Varg në vend të numrit te ${formula}`);
      return typeof v === 'number' ? v : Number(v);
    };

    const ref = (text: string): Value => {
      const bang = text.lastIndexOf('!');
      const sheet = bang >= 0 ? text.slice(0, bang).replace(/^'|'$/g, '').replace(/''/g, "'") : sheetName;
      const [from, to] = (bang >= 0 ? text.slice(bang + 1) : text).split(':');
      const a = parseAddress(from);
      if (!to) return this.cellValue(sheet, a.row, a.col);
      const b = parseAddress(to);
      const out: Value[] = [];
      for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r++) {
        for (let c = Math.min(a.col, b.col); c <= Math.max(a.col, b.col); c++) out.push(this.cellValue(sheet, r, c));
      }
      return out;
    };

    const call = (name: string, args: Value[]): number => {
      const flat = (v: Value): Value[] => (Array.isArray(v) ? v.flatMap(flat) : [v]);
      switch (name) {
        case 'SUM':
          return args.flatMap(flat).reduce<number>((s, v) => s + (typeof v === 'number' ? v : 0), 0);
        case 'MAX':
          return Math.max(...args.flatMap(flat).filter((v): v is number => typeof v === 'number'));
        case 'SUMIF': {
          const [range, criteria, sumRange] = args as [Value[], string, Value[]];
          return range.reduce<number>((s, v, i) => (v === criteria && typeof sumRange[i] === 'number' ? s + (sumRange[i] as number) : s), 0);
        }
        default:
          throw new Error(`Funksion i panjohur ${name}`);
      }
    };

    const factor = (): Value => {
      const token = take();
      if (token.kind === 'num') return Number(token.text);
      if (token.kind === 'str') return token.text;
      if (token.kind === 'ref') return ref(token.text);
      if (token.kind === 'name') {
        take('(');
        const args: Value[] = [];
        if (peek()?.text !== ')') {
          args.push(expr());
          while (peek()?.text === ',') {
            take(',');
            args.push(expr());
          }
        }
        take(')');
        return call(token.text, args);
      }
      if (token.text === '-') return -num(factor());
      if (token.text === '(') {
        const v = expr();
        take(')');
        return v;
      }
      throw new Error(`Token i papritur ${token.text} te ${formula}`);
    };

    const term = (): Value => {
      let v = factor();
      while (peek()?.text === '*' || peek()?.text === '/') {
        const op = take().text;
        const rhs = num(factor());
        v = op === '*' ? num(v) * rhs : num(v) / rhs;
      }
      return v;
    };

    function expr(): Value {
      let v = term();
      while (peek()?.text === '+' || peek()?.text === '-') {
        const op = take().text;
        const rhs = num(term());
        v = op === '+' ? num(v) + rhs : num(v) - rhs;
      }
      return v;
    }

    const result = expr();
    if (pos !== tokens.length) throw new Error(`Mbetje e papërpunuar te ${formula}`);
    return num(result);
  }
}

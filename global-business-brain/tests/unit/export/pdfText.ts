/**
 * Nxjerrja e tekstit nga një PDF i pakompresuar i pdfkit-it (vetëm për teste).
 *
 * pdfkit writes each line as a TJ array of hex strings (WinAnsi bytes) separated by kerning
 * numbers, e.g. `[<50> 50 <eb72>] TJ`. Joining the hex parts and decoding WinAnsi gives the line.
 */

/** WinAnsi bytes 0x80–0x9F that differ from Latin-1. */
const WIN_ANSI_HIGH: Record<number, string> = {
  0x80: '€',
  0x82: '‚',
  0x83: 'ƒ',
  0x84: '„',
  0x85: '…',
  0x86: '†',
  0x87: '‡',
  0x88: 'ˆ',
  0x89: '‰',
  0x8a: 'Š',
  0x8b: '‹',
  0x8c: 'Œ',
  0x8e: 'Ž',
  0x91: '‘',
  0x92: '’',
  0x93: '“',
  0x94: '”',
  0x95: '•',
  0x96: '–',
  0x97: '—',
  0x98: '˜',
  0x99: '™',
  0x9a: 'š',
  0x9b: '›',
  0x9c: 'œ',
  0x9e: 'ž',
  0x9f: 'Ÿ',
};

function decodeHex(hex: string): string {
  let out = '';
  for (let i = 0; i + 1 < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    out += WIN_ANSI_HIGH[byte] ?? String.fromCharCode(byte);
  }
  return out;
}

/** Text lines in drawing order (one per TJ operator). */
export function extractPdfLines(pdf: Buffer): string[] {
  const source = pdf.toString('latin1');
  const lines: string[] = [];
  for (const match of source.matchAll(/\[((?:<[0-9a-fA-F]*>|[^\]<])*)\]\s*TJ/g)) {
    lines.push([...match[1].matchAll(/<([0-9a-fA-F]*)>/g)].map((h) => decodeHex(h[1])).join(''));
  }
  return lines;
}

/** All text with lines joined by spaces and whitespace (incl. no-break spaces) collapsed. */
export function extractPdfText(pdf: Buffer): string {
  return extractPdfLines(pdf).join(' ').replace(/[\s ]+/g, ' ');
}

export function countPdfPages(pdf: Buffer): number {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
}

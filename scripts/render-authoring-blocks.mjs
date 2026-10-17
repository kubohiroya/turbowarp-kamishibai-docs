import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const snapshot = JSON.parse(
  await readFile(new URL('sources/dsl4-authoring-blocks.json', root), 'utf8'),
);
const output = new URL('docs/images/block-authoring/', root);
const width = 760;
const colors = {authoring: '#683f8f', action: '#086f78'};
const escape = (value) =>
  String(value).replace(
    /[&<>"']/gu,
    (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'})[c],
  );
const measure = (value, size = 16) =>
  [...String(value)].reduce((sum, c) => sum + (c.codePointAt(0) > 255 ? size : size * 0.61), 0);

function wrap(value, maxWidth, size = 16) {
  const lines = [''];
  for (const c of String(value)) {
    if (measure(lines.at(-1) + c, size) > maxWidth && lines.at(-1)) lines.push('');
    lines[lines.length - 1] += c;
  }
  return lines;
}

function labelLayout(node, x, y, available) {
  const pieces = node.text.split(/(\[[A-Z]+\])/u).filter(Boolean);
  let cursorX = x + 14;
  let cursorY = y + 12;
  let lineHeight = 25;
  const elements = [];
  for (const piece of pieces) {
    const input = /^\[([A-Z]+)\]$/u.exec(piece);
    const value = input ? String(node.inputs[input[1]] ?? '') : piece;
    const lines = wrap(value || ' ', available - 48, input ? 15 : 16);
    const itemWidth = Math.min(
      available - 28,
      Math.max(...lines.map((line) => measure(line, input ? 15 : 16))) + (input ? 16 : 0),
    );
    if (cursorX + itemWidth > x + available - 12) {
      cursorX = x + 14;
      cursorY += lineHeight + 5;
      lineHeight = 25;
    }
    const itemHeight = Math.max(25, lines.length * 21 + 6);
    if (input)
      elements.push(
        `<rect x="${cursorX}" y="${cursorY - 2}" width="${itemWidth}" height="${itemHeight}" rx="6" fill="#fff"/>`,
      );
    lines.forEach((line, i) =>
      elements.push(
        `<text x="${cursorX + (input ? 8 : 0)}" y="${cursorY + 17 + i * 21}" fill="${input ? '#172b40' : '#fff'}" font-size="${input ? 15 : 16}">${escape(line)}</text>`,
      ),
    );
    cursorX += itemWidth + 5;
    lineHeight = Math.max(lineHeight, itemHeight);
  }
  return {height: cursorY - y + lineHeight + 10, elements: elements.join('')};
}

function renderNodes(nodes, x, startY, available) {
  let y = startY;
  let svg = '';
  for (const node of nodes) {
    assert.ok(colors[node.color]);
    if (node.kind === 'hat' && y > startY) y += 28;
    const label = labelLayout(node, x, y, available);
    const child =
      node.kind === 'c'
        ? renderNodes(node.children ?? [], x + 24, y + label.height + 4, available - 24)
        : null;
    const height = child ? label.height + 4 + child.height + 22 : label.height;
    const notch = 'h 16 l 5 5 h 20 l 5 -5';
    const top =
      node.kind === 'hat'
        ? `M ${x} ${y + 10} Q ${x + 24} ${y - 12} ${x + 68} ${y + 2} H ${x + available - 8}`
        : `M ${x + 8} ${y} ${notch} H ${x + available - 8}`;
    const bottom = child
      ? `q 8 0 8 8 V ${y + label.height - 8} q 0 8 -8 8 H ${x + 32} q -8 0 -8 8 V ${y + height - 28} q 0 8 8 8 H ${x + available - 8} q 8 0 8 8 V ${y + height - 8} q 0 8 -8 8 H ${x + 46} l -5 5 h -20 l -5 -5 H ${x + 8} q -8 0 -8 -8 V ${y + 8} q 0 -8 8 -8 Z`
      : `q 8 0 8 8 V ${y + height - 8} q 0 8 -8 8 H ${x + 46} l -5 5 h -20 l -5 -5 H ${x + 8} q -8 0 -8 -8 V ${y + 10} Z`;
    svg += `<g data-opcode="${escape(node.opcode)}"><path d="${top} ${bottom}" fill="${colors[node.color]}" stroke="#fff" stroke-width="1"/>${label.elements}${child?.svg ?? ''}</g>`;
    y += height + 3;
  }
  return {svg, height: y - startY};
}

await mkdir(output, {recursive: true});
for (const diagram of snapshot.diagrams) {
  assert.match(diagram.id, /^[a-z0-9-]+$/u);
  const heading = wrap(diagram.title, width - 48, 18);
  const top = 28 + heading.length * 26;
  const body = renderNodes(diagram.nodes, 20, top + 10, width - 40);
  const height = top + body.height + 38;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${escape(diagram.title)}</title>
<desc id="desc">${escape('Issue #883の新ハット形式の台本ブロック。複数のハットは独立した台本として配置します。上から順につなぎ、シーンの命令はC字の内側に配置します。入力欄の長い値は図中だけで折り返しています。')}</desc>
<rect width="${width}" height="${height}" rx="12" fill="#f3f6fa"/>
<g font-family="ui-monospace, Menlo, monospace" font-weight="500">${heading.map((line, i) => `<text x="24" y="${30 + i * 26}" font-size="18" fill="#172b40">${escape(line)}</text>`).join('')}${body.svg}</g>
</svg>
`;
  await writeFile(new URL(`${diagram.id}.svg`, output), svg);
}
console.log(`Rendered ${snapshot.diagrams.length} block authoring diagrams.`);

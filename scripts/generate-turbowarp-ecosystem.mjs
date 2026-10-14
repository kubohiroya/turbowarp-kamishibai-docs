import {readFile, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {format} from 'prettier';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const Ajv = /** @type {any} */ (require('ajv'));
const inventoryPath = path.join(projectRoot, 'sources/turbowarp-ecosystem.json');
const schemaPath = path.join(projectRoot, 'sources/turbowarp-ecosystem.schema.json');
const outputPath = path.join(projectRoot, 'docs/developer-guides/turbowarp-ecosystem.md');
const legacyNeedles = ['tm', 'pose'].join('');

const categories = [
  ['recognition-input-network', '認識・入力・通信'],
  ['state-assets', '状態・素材'],
  ['presentation-interaction', '表示・対話'],
  ['development-distribution', '開発・配布基盤'],
  ['application-content', '統合application／content'],
  ['upstream-fork', 'upstream fork'],
];

function markdownTable(rows) {
  return [
    '| Product | Surface | Responsibility | Package |',
    '| --- | --- | --- | --- |',
    ...rows.map(
      (entry) =>
        `| [${entry.productName}](https://github.com/${entry.repository}) | ${entry.surface.join(', ')} | ${entry.responsibility} | \`${entry.packageName}\` |`,
    ),
  ].join('\n');
}

function bulletList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function categorySection(id, title, entries) {
  const categoryEntries = entries.filter((entry) => entry.category === id);
  const details = categoryEntries
    .map(
      (entry) => `### ${entry.productName}

- Repository: [${entry.repository}](https://github.com/${entry.repository})
- Package: \`${entry.packageName}\`
- Surface: ${entry.surface.join(', ')}
- Input: ${entry.inputs.join(', ') || 'none'}
- Output: ${entry.outputs.join(', ') || 'none'}
- Direct dependencies: ${entry.dependencies.join(', ') || 'none'}
- Optional integrations: ${entry.optionalIntegrations.join(', ') || 'none'}
- Representative use case: ${entry.useCase}
- License policy: ${entry.licensePolicy}
- Status: ${entry.status}${entry.extensionId ? `\n- Extension ID: \`${entry.extensionId}\`` : ''}
`,
    )
    .join('\n');

  return `## ${title}

${markdownTable(categoryEntries)}

${details}`;
}

function mermaidFlow() {
  return `\`\`\`mermaid
flowchart LR
  scratch[Scratchでの創作] --> turbowarp[TurboWarpと既存機能拡張]
  turbowarp --> typescript[TypeScriptによる独自機能拡張]
  typescript --> vite[Vite Plugin]
  vite --> bundles[standalone bundle / manifest / Composition API]
  bundles --> sb3[SB3 Toolchain]
  camera[TurboWarp-Camera-Source] --> tm[TurboWarp Teachable Machine]
  camera --> jsqr[jsQR]
  tm --> async[TurboWarp-Async-Input]
  named[TurboWarp Named Data] --> asset[TurboWarp Asset Cache]
  asset --> bubble[Bubble]
  text[Text Lines] --> bubble
  svg[TurboWarp-SVG-Text] --> bubble
  async --> app[TurboWarp-Kamishibai]
  asset --> app
  kvs[TurboWarp KVS] --> app
  expression[TurboWarp-Runtime-Expression] --> app
  bubble --> app
  diagnostic[TurboWarp-Diagnostic-Overlay] --> app
  sb3 --> app
  app --> docs[Docs]
  app --> samples[Samples]
\`\`\``;
}

function generatedMarkdown(inventory) {
  const entries = inventory.repositories;
  return `# ${inventory.overview.title}

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

更新日: ${inventory.generatedOn}

文書状態: TurboWarp-Kamishibai \`v4.0.0-rc.8\` 文書群から公開するTurboWarp ecosystem overview

この文書は \`sources/turbowarp-ecosystem.json\` を正本として生成しています。repository、package、guide link、利用surface、関係図のnodeがずれた場合は、正本dataと生成検査を更新してください。

## Concept

${inventory.overview.rationale}

${bulletList(inventory.overview.learningPath)}

このecosystemは、Scratch作品をいきなり別言語へ移すためのものではありません。TurboWarpのblock UIで試せるStandalone extensionと、host applicationから組み合わせるComposition APIを分け、同じ機能を学習・制作・配布の流れへ接続するためのものです。

機能は一枚岩にせず、camera、recognition、input、state、asset、text、bubble、diagnostic、networkへ分けます。個々のrepositoryは小さく検証可能な責務を持ち、TurboWarp-Kamishibaiはそれらを教材・作品・Web配布へ接続する統合applicationとして扱います。

## Relationship Flow

${mermaidFlow()}

図は次の関係を示します。TypeScriptで書いた機能拡張はVite pluginでstandalone bundle、manifest、Composition API向け出力へ分かれ、SB3 ToolchainでScratch/TurboWarp projectのsource管理と再現可能buildへ接続します。Camera SourceはTurboWarp Teachable MachineとjsQRへ映像sourceを渡し、Async Inputは認識・device・application eventを作品の実行tickから扱える状態へ整えます。SVG Text、Text Lines、Asset CacheはBubbleの表示素材と台詞を支え、KVSはbinary stateを保存し、Diagnostic Overlayは停止理由や検証結果を画面へ出します。TurboWarp-Kamishibaiはこれらを統合し、DocsとSamplesが利用者・教材作者・開発者の入口を提供します。

## Inventory Policy

- product name、package name、repository slug、Extension ID、opcodeは同じものとして扱わない。
- current entryではTurboWarp-Kamishibai、TurboWarp紙芝居、TurboWarp Teachable Machine、\`turbowarp-kamishibai-app\`を使う。
- old product name、old repository slug、old Extension ID、old opcode prefixはHistory、Migration、source provenanceだけに限定する。
- version numberを本文に固定する場合はinventoryまたはrelease記録と一致検査できる場所へ置く。
- docsとして扱う本文と独自図はCC BY-SA 4.0、build scriptとsite codeはMPL-2.0、第三者素材は個別noticeに従う。

${categories.map(([id, title]) => categorySection(id, title, entries)).join('\n')}

## Repository Integration Checklist

主要repositoryのREADMEには、この文書と同じ一覧を複製しません。各READMEには短い導線だけを置き、詳細な相互関係はこの中央indexへ集約します。

- TurboWarp機能拡張: READMEからこのoverviewへ一文で案内する。
- templateとVite plugin: 新規機能拡張を作る開発者向けに、このoverviewを設計背景として案内する。
- SB3 Toolchain: manifest、migration plan、reproducible buildの説明からこのoverviewへ接続する。
- TurboWarp-Kamishibai: applicationが統合するpackage群をこのoverviewへ委譲し、READMEには利用者向け導線を残す。
- DocsとSamples: 公開siteの入口から、このoverview、チュートリアル、作品libraryを行き来できるようにする。
`;
}

function assertNoCurrentLegacyTerms(markdown) {
  const blocked = [legacyNeedles, 'TM' + 'Pose', 'TM' + 'POSE', `turbowarp-${legacyNeedles}`];
  const violations = blocked.filter((needle) => markdown.includes(needle));
  if (violations.length > 0) {
    throw new Error(
      `Generated ecosystem guide contains current-text legacy term(s): ${violations.join(', ')}`,
    );
  }
}

async function main() {
  const [inventory, schema] = await Promise.all([
    readFile(inventoryPath, 'utf8').then(JSON.parse),
    readFile(schemaPath, 'utf8').then(JSON.parse),
  ]);
  const ajv = new Ajv({allErrors: true});
  ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/u);
  ajv.addFormat('uri', {
    validate(value) {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  });
  const validate = ajv.compile(schema);
  if (!validate(inventory)) {
    throw new Error(`Invalid ecosystem inventory: ${ajv.errorsText(validate.errors)}`);
  }

  const markdown = await format(generatedMarkdown(inventory), {parser: 'markdown'});
  assertNoCurrentLegacyTerms(markdown);

  if (process.argv.includes('--check')) {
    const current = await readFile(outputPath, 'utf8');
    if (current !== markdown) {
      throw new Error(
        'docs/developer-guides/turbowarp-ecosystem.md is not in sync with sources/turbowarp-ecosystem.json.',
      );
    }
    return;
  }

  await writeFile(outputPath, markdown);
}

await main();

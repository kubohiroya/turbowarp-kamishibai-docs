import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {documentationConfig, staffDocumentConfig, workshopDocumentConfig} from '../docs/config.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

function localReferences(source) {
  const references = [];
  for (const match of source.matchAll(/(?:\]\(|\bsrc=")([^)<>"]+)(?:\)|")/gu)) {
    const reference = match[1].split('#')[0];
    if (reference && !/^(?:data:|https?:|mailto:|#)/iu.test(reference)) references.push(reference);
  }
  return references;
}

test('resolves local links and images in every Markdown source', () => {
  const sources = [
    ...documentationConfig.documents.map((document) =>
      path.join(projectRoot, 'docs', document.sourceDirectory, document.sourceFilename),
    ),
    ...['README.md', 'play.md', 'create.md'].map((filename) =>
      path.join(projectRoot, 'docs/tutorials', filename),
    ),
    ...[workshopDocumentConfig.coverFilename, workshopDocumentConfig.sourceFilename].map(
      (filename) =>
        path.join(projectRoot, 'docs', workshopDocumentConfig.sourceDirectory, filename),
    ),
    path.join(
      projectRoot,
      'docs',
      staffDocumentConfig.sourceDirectory,
      staffDocumentConfig.sourceFilename,
    ),
  ];

  for (const sourcePath of sources) {
    const source = readFileSync(sourcePath, 'utf8');
    for (const match of source.matchAll(
      /https:\/\/kubohiroya\.github\.io\/(?:scratch-gui|turbowarp-extension-data-editor)\/editor\.html[^)\s\]]*/gu,
    )) {
      const editor = new URL(match[0]);
      assert.equal(editor.pathname, '/turbowarp-extension-data-editor/editor.html', sourcePath);
      assert.equal(editor.searchParams.get('lang'), 'ja', sourcePath);
      assert.equal(editor.searchParams.has('blockEditorDialogs'), false, sourcePath);
      if (editor.searchParams.has('project_url')) {
        assert.match(
          editor.searchParams.get('project_url'),
          /^https:\/\/kubohiroya\.github\.io\/turbowarp-kamishibai-samples\/stories\//u,
          sourcePath,
        );
      }
    }
    for (const reference of localReferences(source)) {
      assert(
        existsSync(path.resolve(path.dirname(sourcePath), reference)),
        `${sourcePath}: ${reference}`,
      );
    }
  }
});

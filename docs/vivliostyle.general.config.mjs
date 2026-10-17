import {defineConfig} from '@vivliostyle/cli';
import {fileURLToPath} from 'node:url';

import {documentationConfig, findDocument} from './config.mjs';
import {createSelectiveImageCopyAsset} from '../scripts/publication-assets.mjs';

const docsRoot = fileURLToPath(new URL('./', import.meta.url));

export function createDocumentVivliostyleConfig(sourceFilename) {
  const selectedDocument = findDocument(sourceFilename);
  if (selectedDocument === undefined) {
    throw new Error(`Unknown document: ${sourceFilename}`);
  }

  return defineConfig({
    title: selectedDocument.title,
    author: documentationConfig.author,
    language: 'ja',
    size: 'A4',
    viewerParam: 'bookMode=true',
    entry: [
      {
        path: `${selectedDocument.sourceDirectory}/${selectedDocument.sourceFilename}`,
        output: documentationConfig.standaloneArticleHtmlFilename,
      },
    ],
    theme: ['theme.css', 'general-theme.css'],
    workspaceDir:
      `../tmp/vivliostyle/${selectedDocument.collectionId}/` +
      selectedDocument.sourceFilename.replace(/\.md$/u, ''),
    copyAsset: {
      ...createSelectiveImageCopyAsset({
        rootDirectory: docsRoot,
        sourcePaths: [
          `${selectedDocument.sourceDirectory}/${selectedDocument.sourceFilename}`,
          'theme.css',
          'general-theme.css',
        ],
      }),
      excludes: [
        'dist/**',
        'tmp/**',
        'user-guides/**',
        'dsl-author-guides/**',
        'block-author-guides/**',
        'developer-guides/**',
        'tutorials/**',
        'turbowarp-programmer-guides/**',
        'workshops/**',
      ],
    },
    toc: {
      title: '目次',
      htmlPath: documentationConfig.standaloneHtmlFilename,
      sectionDepth: documentationConfig.tocSectionDepth,
    },
  });
}

const sourceFilename = process.env.DOCUMENT_SOURCE;
if (sourceFilename === undefined) {
  throw new Error('DOCUMENT_SOURCE is required.');
}

export default createDocumentVivliostyleConfig(sourceFilename);

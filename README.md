# TurboWarp Kamishibai Documentation

English | [日本語](README.ja.md)

This repository holds the general documents, the documents for Kamishibai DSL authors, the documents for developers and the workshop material of [TurboWarp Kamishibai](https://github.com/kubohiroya/turbowarp-kamishibai-app), and publishes them as a GitHub Pages site of their own.

The document sources were moved here with their history from merge commit `8166edb3a8b7ed360685bdcd6534c000054105bd` of PR #238, made under the earlier repository name and still in the history of the current `turbowarp-kamishibai-app`. The three developer documents that had stayed behind in `docs/design/` and `docs/development/` at that commit were moved as well. The display order of the documents is kept in `docs/config.mjs`, and file names no longer carry the old numeric prefixes.

## What each published site is for

- `turbowarp-kamishibai-app`: the application itself, and the public entry point that leads to the app, the documents and the samples
- `turbowarp-kamishibai-docs`: the HTML of every document, the Vivliostyle Viewer, and the workshop material as PDF
- `turbowarp-kamishibai-samples`: the sample scripts and the works that can be run

The public entry point stays at `https://kubohiroya.github.io/turbowarp-kamishibai-app/`. The Pages site of this repository is planned at `https://kubohiroya.github.io/turbowarp-kamishibai-docs/`.

The published root of the documentation site shows nothing but the version-selection banner. The shared routes to the workshops, the samples and the downloads are offered by the AppBar and the official front page; the version-specific document lists are not mixed together, but offered by these dedicated tops:

- `/3.2/`: documents for maintaining TXT scripts, the 3.2.x app, and existing works and teaching material
- `/4.0/`: documents for authoring anew with YAML projects, include statements and the preview/build toolchain
- `/workshops/`: a separate entry point listing the workshop material by date and DSL series

For each version-specific document, the ordinary HTML (`index.html`), the Viewer body (`document.html`), `publication.json` and the local assets are generated under `/3.2/` or `/4.0/`. The earlier URLs without a version number get no automatic redirect; a page is left there pointing at the corresponding new URL and the version-selection root. The `publication.json` that the earlier Vivliostyle Viewer URLs refer to is kept as well, as a Web Publication that shows the same notice about the move.

## How the documents are grouped

Rather than reproducing the `docs/general/` it came from, the material is split by reader and purpose:

| Directory                 | Readers                                                   |
| ------------------------- | --------------------------------------------------------- |
| `docs/user-guides/`       | general users, parents, teachers, workshop participants   |
| `docs/tutorials/`         | people playing through, and building, DSL 4.0 in order    |
| `docs/dsl-author-guides/` | people authoring or migrating works in the Kamishibai DSL |
| `docs/developer-guides/`  | people maintaining the app, SB3 files and extensions      |
| `docs/workshops/`         | workshop participants, staff and organisers               |

For the exact file mapping, the dependency boundaries and the record of what was done, see [MIGRATION.md](MIGRATION.md).

The provenance of the current published version and of the Schema is kept in `sources/dsl4/app-release.json`, generated from the app's published releases. Release candidates count too, and the commit, the release metadata and the size and SHA-256 of the Standard SB3 of the same tag are verified. Whether something is published to npm is confirmed separately. For hand-written prose, screens and samples, the version is the one each document states. When the published version moves on, an older version's verification result is not reread as the new version's. The 4.0 documents carry a pointer to the currently published app. They live under `/4.0/tutorials/`, and the 4.0 list leads to "play a kamishibai" and "make a kamishibai". The manifest of the published samples, starter and web build as of rc.25, and the check of the 16 published files, are kept as history. For the current version of the samples, look at the samples repository. Real cameras and real poses have not been verified again. The pinned commit, where things were fetched from, how they were verified, and what past verification covers are recorded in `DSL4-PUBLICATION-STATUS.md` and `sources/dsl4/user-guide-4.0-public-surfaces.json`.

Terminology, code notation, how a specific concept is introduced the first time, and when to use which kind of figure follow the [TurboWarp Kamishibai documentation writing-style guide](WRITING-STYLE.md). The distinction between a pinned DSL 4.0 implementation, an official release, a published screen and a document's status is kept in [the notation standard for DSL 4.0 document and publication status](DSL4-PUBLICATION-STATUS.md). The checks of the concept diagrams in ordinary HTML, at narrow widths, in print and as fragments are recorded in [the DSL 4.0 diagram and fragment QA record](DSL4-DIAGRAM-QA.md). The real DSL 4.0 screens reproduced from published rc.5, and the diagrams tracking the implementation of source, runtime and the live reload transaction, are kept in [the DSL 4.0 implementation visual record](DSL4-IMPLEMENTATION-VISUALS.md).

## Development

Node.js 24.0.0 or newer and pnpm 11.

```bash
pnpm install
pnpm check
```

`pnpm build` runs an incremental build and verifies its output. To generate only, use `pnpm build:publications`; to force every publication to be regenerated, `pnpm build:publications:full` (with verification as well, `pnpm build:full`).

The incremental build is common to every kind of publication: it collects as input the Markdown, the figures it refers to, the shared theme, the fonts, the Vivliostyle settings and the build scripts. It compares the oldest modification time among the `build-info.json` completion marker and the required outputs against the newest modification time among the inputs, and regenerates only the publications with a missing required output, mismatched metadata, or a newer input. Shared assets and post-processed HTML whose content has not changed are not written again.

Each document's Web Publication is generated into `dist/`. The only PDFs are the workshop material under `docs/workshops/`, which produces a PDF for publication in `dist/` and a PDF for checking in `output/pdf/`. The pinned information about where the material came from, and the list of extensions, are kept in [`sources/turbowarp-kamishibai-app.json`](sources/turbowarp-kamishibai-app.json).

### Maintaining and publishing the DSL reference

The DSL 3 series and DSL 4.0 differ in where their reference's source of truth lives and how it is maintained.

The published site treats DSL 3.2 and DSL 4.0 as officially supported in parallel, with a dedicated section and dedicated pages per version. To maintain existing TXT scripts and 3.2.x, choose 3.2; to author anew with YAML projects, include statements and the preview/build toolchain, choose 4.0.

- DSL 3 series (the declarations the current implementation accepts are 3.1 and 3.2): the hand-written Markdown carried over from past releases, [`docs/dsl-author-guides/command-reference.md`](docs/dsl-author-guides/command-reference.md), continues to be maintained in this repository.
- DSL 4.0: [`docs/dsl-author-guides/dsl-4.0-schema-reference.md`](docs/dsl-author-guides/dsl-4.0-schema-reference.md) is generated deterministically from a pinned snapshot of the upstream JSON Schema, a source lock, and Japanese annotations.

Both Markdown files go into the same Vivliostyle Web Publication process in `pnpm build`, which prepares the ordinary HTML version (the `index.html` of each published directory) and the Vivliostyle Viewer version (`publication.json`) at once. The ordinary HTML holds the table of contents and the body on one page; on a wide screen the contents is pinned to the top left and shown as a tree whose heading levels expand and collapse. The Viewer's reading order contains only `document.html`, which keeps it from being shown twice alongside the combined HTML. The DSL 3 series is not replaced by a JSON Schema, nor made to look as though it is generated the same way as DSL 4.0.

The material for the workshop on 1 August 2026 is combined into the ordinary HTML `index.html` as well: cover, contents and body for participants, contents and body for staff. The on-screen contents tree shares its CSS and JavaScript with the general documents. In the Viewer and in PDF the combined HTML is kept out of the reading order, which preserves the existing typesetting units: cover, contents and body for participants, and body only for staff.

"The TurboWarp Kamishibai app, teaching material and toolchain guide" is also maintained as separate Markdown for 3.2 and for 4.0, each with an ordinary HTML version and a Vivliostyle Viewer version. The 3.2 version is offered as an independent developer publication under `/3.2/` and the 4.0 version under `/4.0/`, and the earlier URLs without a version number keep a notice about the move.

The release smoke is likewise maintained as separate Markdown, URLs and publications for 3.x and 4.0. The 4.0 version takes [`docs/developer-guides/release-smoke-4.0.md`](docs/developer-guides/release-smoke-4.0.md) and [`sources/dsl4/release-smoke-4.0-candidate.json`](sources/dsl4/release-smoke-4.0-candidate.json) as its source of truth, pinning the candidate commit, the Schema, the feature flags, the SB3, the web build, the checks on real devices, the release stop and the rollback as one set.

The user guide is likewise maintained as separate Markdown, URLs and publications for 3.x and 4.0. The 4.0 version takes [`docs/user-guides/user-guide-4.0.md`](docs/user-guides/user-guide-4.0.md) and [`sources/dsl4/user-guide-4.0-public-surfaces.json`](sources/dsl4/user-guide-4.0-public-surfaces.json) as its source of truth: the prose for general readers covers starting, input, finishing, running again and recovering from a failure, while the machine-readable data records the published URL, the version, the checksum and the checks on real devices separately.

The release history is likewise maintained as separate Markdown, URLs and publications for 3.x and 4.0. The 4.0 version takes [`docs/dsl-author-guides/dsl-4.0-history.md`](docs/dsl-author-guides/dsl-4.0-history.md) and [`sources/dsl4/release-history-4.0.json`](sources/dsl4/release-history-4.0.json) as its source of truth, tracking implemented and verified candidates separately from the official publication status across tags, GitHub Releases, npm and production Pages.

How to change the way 4.0 material is arranged is maintained in [the DSL 4.0 asset conversion guide](docs/dsl-author-guides/dsl-4.0-asset-conversion-guide.md). It covers converting between embedded and local material, taking in remote material, and the build and rollback that follow a conversion, and generates its HTML and Viewer body into `/4.0/dsl-author-guides/dsl-4.0-asset-conversion-guide/`.

### Generating the DSL 4.0 Schema reference

The DSL 4.0 reference is generated deterministically from a pinned snapshot of the upstream JSON Schema, a source lock and Japanese annotations. At present the DSL 4.0 completion commit — which carries the normative JSON Schema, the surface specification, and the conforming implementation and its tests — is pinned as one revision. The Schema is not generated from the runtime implementation. An ordinary build makes no network connection and reads only the pinned snapshot. The author-facing contract for include statements, which are handled outside the Schema before composition, is kept in the script-authoring guide, on the evidence of the pinned surface specification and the conforming implementation and tests.

```bash
pnpm docs:dsl4:check
pnpm docs:dsl4:generate
pnpm docs:dsl4:sync -- --repository ../turbowarp-kamishibai-app --commit <commit>
```

Run `docs:dsl4:sync` explicitly only to look into a candidate Schema under development. It fetches `schema/dsl-4.schema.json` from the given commit, records the SHA-256 and the source URL in the lock file, and then regenerates the reference. Do not edit the generated Markdown; change the Japanese descriptions, the order and the examples in [`sources/dsl4/annotations.ja.json`](sources/dsl4/annotations.ja.json).

### Following the app's published artifacts

An ordinary local build uses the verified snapshot and needs no network connection. To update to the published version, run `pnpm docs:app:sync`. It updates the dependency information, the Schema and the 4.0 entry point, and regenerates the Schema reference. A failure to fetch, to verify, or to validate the annotations stops publication.

Pages runs on updates to main, on manual dispatch, and on an `app-release-published` repository dispatch. There is no scheduled poll of the app's published version. Every run fetches, verifies and checks the published app, and publishes only artifacts that passed. If fetching, verification or annotation validation fails, publication stops and the previously verified published artifacts stay in place.

`app-release-published` is a receiving end. Releases in other repositories do not propagate automatically, and at the time this was investigated the app had no code to send that notification. After the app publishes a new version, Docs and Samples are updated by an approved manual dispatch or by an update to main, and the publication is confirmed as actually live. Each run records in its job summary the time of the check, the verified release, the source commit, the SB3 hash, what it was compared against, and the difference verdict. The summary is the result of comparing dependencies; publication itself is confirmed from the deploy job and the published URL.

Compare the [Actions history](https://github.com/kubohiroya/turbowarp-kamishibai-docs/actions) with the [published `app-release.json`](https://kubohiroya.github.io/turbowarp-kamishibai-docs/app-release.json). A maintainer with write access who updates it by hand runs the following, then confirms that deploy succeeded and checks the version, commit and hash at the published URL:

```bash
gh workflow run pages.yml --repo kubohiroya/turbowarp-kamishibai-docs --ref main
```

What is taken from an app release is the pointer to the published version, and the Schema. A specification difference in hand-written prose, or a check of a new version's screens, needs its own review. Automatic syncing never presents unchecked prose as "verified against the latest version". To roll back, revert this change and the dependency information, and publish the last checked docs again.

The preparation is tracked in [issue #1](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/1), moving the prose in [issue #3](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/3), and moving the remaining documents and the generation machinery in [issue #5](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/5).

## License

- documents for general readers, DSL authors and developers, the shared images and what is generated from them: CC BY-SA 4.0
- the workshop material and what is generated from it: Copyright © 2026 Hiroya Kubo. All rights reserved.
- the build scripts, site shell, settings and tests that are explicitly listed: MPL-2.0

There is no single license that applies to this repository as a whole. For exactly what applies to each file, see [LICENSES.md](LICENSES.md).

The 4.0 author-facing entry point is split into script blocks, the script DSL, and the detailed material on writing a script. Each authoring path carries "make a kamishibai" and "the Kamishibai DSL 4.0 script authoring guide", and the existing DSL-version URLs are kept. The block figures can be regenerated from `sources/dsl4-authoring-blocks.json` with `node scripts/render-authoring-blocks.mjs`. Editing one instruction at a time, and playing directly from the empty-named root, are described against published prerelease 4.0.0-rc.25: open a block-script SB3 with its material, start it with the green flag, and close the title to play.

# DSL 4.0 release smoke

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: 公開プレリリース`4.0.0-rc.8`の再現・公開照合・追加smoke手順<br />
対象Issue: [turbowarp-kamishibai-docs #47](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/47)、[#169](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/169)

本書はリリース担当者向けで、一般的な動作確認を説明する文書ではありません。一般的な使い方は
[大人向け概要](../user-guides/executive-summary-adult-4.0.md)、実装の責務は
[ソフトウェアメンテナンスガイド](developer-guide-4.0.md)を参照してください。

`v4.0.0-rc.8`はnpm `next`、GitHub prerelease、Pagesのダウンロード導線として公開済みです。ただし、
推奨安定版は`v3.2.3`で、正式版`v4.0.0`は未公開です。Standard SB3の配布正本はGitHub Releaseです。
公開サンプルは、この公開SB3とfreeze commitから再生成したlockを別途照合します。

| 用語     | この文書での意味                                          |
| -------- | --------------------------------------------------------- |
| manifest | version、commit、成果物、検証結果を固定する機械可読な記録 |
| checksum | 取得・再生成した成果物が固定byte列と一致するか確認する値  |

## 固定値

正本は`sources/dsl4/release-smoke-4.0-candidate.json`です。

| 対象               | 固定値                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| candidate merge    | `ad244910b6bf579b8eb7c7af70d72b7ca4b1fff6`                                           |
| freeze／tag commit | `29c0deadcb98badf94a0244c479ca896dc71f842`                                           |
| version            | `4.0.0-rc.8`                                                                         |
| release source     | tag `v4.0.0-rc.8`（現行branchへ展開copyを保持しない）                                |
| source identity    | `sha256:8edbc02a06b3770cce0a89cf658367df129d974d53f401258b69f0713762014a`            |
| Schema SHA-256     | `46ff159c29e13704d707dae8e0d2ad3a146b6aa8a68a968614e6ef56d112f135`                   |
| Standard SB3       | 6,749,955 bytes / `91d7f594aaf922450fba359a90c7c26e7c1dfda51cf002534cb4605dbb0d7041` |
| npm tarball        | 6,492,990 bytes / `a7b91378e6345c530515cc4e8f82314c3c5f2a19d3e136de5e4fe8bff8d24c5e` |

固定commitを取得します。

```bash
git clone https://github.com/kubohiroya/turbowarp-kamishibai-app.git
git -C turbowarp-kamishibai-app checkout --detach 29c0deadcb98badf94a0244c479ca896dc71f842
git -C turbowarp-kamishibai-app status --short
```

## Feature flag snapshot

すべてのDSL 4.0 flagは既定OFFです。配布surfaceは起動時に次のsnapshotを明示します。
ポーズoverlayには専用flagがなく、`poseRecognition.preview.overlay`を記述した全runtime profileで同じ契約を使います。
rc.8固定の記録のため、rc.8の名前`poseRecognition`で記述します。rc.11以降の台本では`recognition.preview.overlay`です。

| Surface               | ONにするflag                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Standard production   | `dsl4Runtime`、`dsl4AppShell`、`dsl4PoseFeedbackModes`、`dsl4SpeechAdvanceTypewriter`、`dsl4TurboWarpActionSurface`            |
| 非埋め込みdevelopment | Standard productionに加え、`dsl4WebPreviewAdapter`、`dsl4BrowserDistributionBuild`、`dsl4PreviewReloadOverlay`、`dsl4Debugger` |

`dsl4TurboWarpActionSurface`により、23個のcore actionを可視blockとして公開します。4個の内部制御blockは
非表示のままです。smoke中に既定値を変更しません。

## 自動検証

```bash
cd turbowarp-kamishibai-app
pnpm install --frozen-lockfile
pnpm release:dsl4:check
pnpm verify:full
pnpm release:check
shasum -a 256 dist/downloads/kamishibai-4.0.0-rc.8.sb3
```

candidate PRの`pnpm verify:full`はNode系test 1,161件、Chromium test 13件を通過しました。
[GitHub Actionsの記録](https://github.com/kubohiroya/turbowarp-kamishibai-app/actions/runs/32361658847/job/96402336784)を
一次証跡とします。

## 公開物を照合する

公開元を別々に取得し、固定値と照合します。

```bash
curl -fL \
  https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.8/kamishibai-4.0.0-rc.8.sb3 \
  -o kamishibai-4.0.0-rc.8.sb3
shasum -a 256 kamishibai-4.0.0-rc.8.sb3

npm view @kubohiroya/tm-kamishibai@4.0.0-rc.8 \
  version dist.tarball dist.integrity dist.shasum
npm view @kubohiroya/tm-kamishibai dist-tags
```

確認済みのnpm integrityは
`sha512-nQmvHakwLWZioi1gOUZatKwyLe2nD3GPJbEBrqDqm5mzqQhbbLEMGl3znJQpVs0JRfzyeLI1JDTcGrePiIpjUg==`です。
`next`は`4.0.0-rc.8`、`latest`は`3.2.3`であることを確認します。

## TurboWarp surfaceを確認する

rc.8 Standard SB3をfresh TurboWarp Editorで開き、次を確認します。

1. composite IDが`kubohiroyakamishibai4`である
2. Runtimeと6つの外部機能拡張、合計7 memberの見出しと文書ボタンが表示される
3. Runtime由来の23 core action blockが表示される
4. TurboWarp blockからの実行がYAMLと同じregistry、Schema正規化、ActionContext、lifecycleを通る
5. Asset Manager 0.11.0、Async Input 0.4.0、Bubble 0.10.0、Runtime Expression 0.4.0、
   SVG Text 0.5.0、TurboWarp Teachable Machine 1.12.0のexact pinと一致する
6. remote codeを取得せず、PoseNet model dataをprojectから復元できる
7. `poseRecognition.preview.overlay`設定時にSVGの関節とボーンが表示され、省略時は非表示になる
8. Bubble 0.10.0由来の31個の可視blockと、組み込み`say`／`think` styleが表示される
9. `bubbleClosePolicies`の秒数、入力待ち、両者のraceが、inline指定と同じspeech lifecycleで完了する
10. 未定義`closePolicy`と、`closePolicy`＋inline `seconds`／`waitFor`の競合をbuild前に拒否する

## Browser／CLI Previewを確認する

Browser-owned Previewではuser gestureでproject directoryを選び、正常YAML、不正YAMLからの復帰、asset変更、
reload overlay、camera control、pose feedback、停止後のresource解放を確認します。source本文、local absolute path、
session token、file handle、camera device IDをログやSB3へ保存しません。

CLI Previewは候補packageとversion付きStandard SB3を使います。

```bash
pnpm exec tm-kamishibai preview-dsl4 --watch \
  --base /absolute/path/to/kamishibai-4.0.0-rc.8.sb3 \
  --project-root /absolute/path/to/project \
  --source-manifest /absolute/path/to/project/project.source.json \
  --control-profile production \
  --channel bundled
```

token付きloopback URLだけを開き、runtime-ready、source／asset変更、診断、safe stop、Ctrl+C後の
socket／watcher／timer解放を確認します。

## 実カメラ・実ポーズ

camera contextの責務境界は[Issue #601](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/601)で
Chrome 151と物理cameraを使って測定しました。実際と同じ1 draw／1 read経路では`willReadFrequently`に
再現性のある高速化がなく、WebGLでは全条件で悪化したため、TurboWarp Teachable Machine 1.12.0は通常contextを使用します。
CPU推論時にChromiumのreadback警告が1回出る場合がありますが、警告抑制だけを目的に成果物を書き換えません。

現時点の判定は次のとおりです。

| 項目                       | rc.8の状態 |
| -------------------------- | ---------- |
| 自動test／Chromium         | 合格       |
| npm／GitHub／Pages公開照合 | 合格       |
| camera context物理測定     | 合格       |
| overlay browser確認        | 合格       |

追加の物理確認ではcamera許可／拒否、preview、`legacy`と必要時の`latest-needed`、model準備の中断、認識feedback、
overlayの位置合わせ、scene遷移、終了時のtrack／model／timer解放を確認します。camera frameは保存しません。

## Release-stop条件

- commit、version、Schema、source identity、flag snapshot、artifact hashの不一致
- 23 core action、7 member見出し／文書ボタン、dependency pinの不一致
- 名前付きclose policyとinline終了条件で、入力購読、timeout、cancel、Bubble cleanupが一致しない
- 同じ入力から生成したSB3またはWeb版の非決定性
- Browser Preview、CLI Preview、Standard SB3での診断または挙動差
- camera拒否、model中断、asset失敗、無効source、runtime例外での部分commitまたはresource残留
- production成果物へのpreview token、debug session、local path、file handleの混入

## Rollback

公開済みrc.8のtag、SB3、npm tarballを同じversionで差し替えません。

1. npmの`next`を`4.0.0-rc.7`へ戻す
2. GitHub prereleaseとPagesへ影響範囲と回避策を追記する
3. 必要ならPagesを`a7f377d4675a9bf9acc8691a11d269ff3d78118b`へ戻す
4. 修正版を`4.0.0-rc.9`としてbuild、検証、公開する
5. 推奨安定版`3.2.3`と過去のversion付き成果物を変更しない

文書だけをrollbackする場合は、このMarkdown、candidate manifest、リリース履歴、`docs/config.mjs`、
`site/4.0/index.html`、対応testを同じcommitで戻します。

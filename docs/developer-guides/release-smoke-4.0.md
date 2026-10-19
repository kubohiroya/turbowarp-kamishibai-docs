# DSL 4.0 release smoke

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書基準: 公開プレリリース`4.0.0-rc.23`、commit `2f2889fe9df88548a92b0925ca3008c5c62682e5`、2026年10月19日。
正式版4.0.0は未公開です。これは再現と照合の手順であり、未実行項目をpassとする記録ではありません。

本書はリリース担当者向けで、一般的な動作確認を説明する文書ではありません。

| 用語     | 意味                                         |
| -------- | -------------------------------------------- |
| manifest | 版・成果物・照合範囲を固定する機械可読な記録 |
| checksum | 取得した成果物のバイト列を照合する値         |

## Schemaと公開runtimeの二つの基準

公開runtimeの調査基準は`4.0.0-rc.23`（`2f2889fe`）です。Schemaリファレンスも同じ公開commitへ固定し、portraitの`placement`、`offset`、`cornerRadius`はrc.23で利用できます。
公開版の入力を検査するときは`sources/dsl4/dsl-4.0-rc.23.schema.json`を使い、
現行Schemaの出典は`sources/dsl4/source-lock.json`で確認します。旧版の検証結果を現行版へ読み替えません。

## 固定値

正本は`sources/dsl4/release-smoke-4.0-candidate.json`です。

| 対象               | 固定値                                                                             |
| ------------------ | ---------------------------------------------------------------------------------- |
| freeze／tag commit | `2f2889fe9df88548a92b0925ca3008c5c62682e5`                                         |
| source identity    | `sha256:1600bea27fccd29a22212fa12cf8f9ff30e947a8164f552429f8930b1720d93f`          |
| Schema SHA-256     | `55221950a3649c6f97594e3b2dd54e0d623f97fee67842e179ab99347bf0ec27`                 |
| Standard SB3       | 6922003 bytes / `ecbb74f950f74236a0bbe38c6b821745d8d100fc02075c634881ab1d837c7998` |
| npm tarball        | 6657881 bytes / `e917e13fccb42354167967f07d7d310d427f0885f115a0da744fae0cc728f728` |

## Feature flag snapshot

汎用defaultはすべてOFFです。Standard productionは起動時にsnapshotを明示して有効化します。
現在のON一覧はcandidateの`runtime.featureFlags.standardProductionEnabled`と固定ソースの
`src/dsl4/feature-flags.ts`で照合します。crossfade、読取状態、式namespace、プレビューの反転と操作UI、
broadcast、Bubbleの高度な表示、カメラ許可段などを含みます。
ポーズoverlayには専用flagがなく、`recognition.preview.overlay`の宣言を使います。

## 自動検証

固定tagをcheckoutし、依存をlockどおりに用意してから、変更の影響に合う上流のVitest対象を選びます。
TypeScriptへ移行したrc.23のsuiteを、rc.8当時の`node --test`や件数で説明しません。
rc.23公開時の本体・samples CIの結果はcandidateの出典URLで追跡します。この文書更新では上流suiteを再実行せず、旧版の件数もrc.23へ読み替えません。文書側の検証結果はIssue #205に記録します。

## 公開物を照合する

[GitHub Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.23)からStandard SB3を取得し、上記size／hashと照合します。

```bash
curl -fL https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.23/kamishibai-4.0.0-rc.23.sb3 -o kamishibai-4.0.0-rc.23.sb3
shasum -a 256 kamishibai-4.0.0-rc.23.sb3
npm view @kubohiroya/turbowarp-kamishibai-app@4.0.0-rc.23 version dist.tarball dist.integrity dist.shasum
npm view @kubohiroya/turbowarp-kamishibai-app dist-tags
```

npm integrityは`sha512-m9TCa1ElwSC2BNk8i2iGBl5UzYKAMWyzNP4ATNF+EV60xconL9t3G3tgkap20m5wJWbuRVG+LDw+i59BIaNQOQ==`です。今回SB3とnpm tarballの実バイトを照合しました。
確認時のnpm `latest`と`next`はrc.23で、推奨安定版3.2.3とは別です。Pagesのversion付きSB3も取得し、GitHub Releaseと同じsize/hashであることを確認済みです。
公開サンプルは3作品のmanifestのruntime commitを照合しました。公開12ファイルのsize/hash、Web作品、実Editorでのブロック台本の直接再生を確認済みです。実カメラ・実ポーズは未検証です。

## TurboWarp surfaceを確認する

Standard SB3のbundleは8 member、表示されるopcode付きblockは200個です。
runtimeには29個のcore actionと17個の読取状態blockがあります。旧source宣言block2個は削除されています。
Teachable Machineは3.5.1、Bubbleは0.13.0、Camera Sourceは0.15.0、素材保持はAsset Cache 0.1.0です。
`bubbleClosePolicies`と`closePolicy`、`recognition`と`recognitionModel`、変数更新actionを確認します。
ブロック定義の抽出と、実際の作品の実行確認は別の検証です。

## Browser／CLI Previewを確認する

正常な台本の開始・変更・停止、失敗ダイアログとメニューへ戻る操作を確認します。
ローカルプレビューはリモートassetを取得しません。`K4-ASSET-REMOTE-DISABLED`の場合はローカル配信またはbuild済み作品を使います。
ブラウザーのOFFLINE／CORS／CONNECTと、CLIの`K4-ASSET-REMOTE-TLS-001`を区別します。
CONNECTでは証明書障害の可能性とDNS・サーバ停止等の可能性を分けて説明します。
サンドボックス内で許可した場合は、パレットの再読込案内を確認します。

## 実カメラ・実ポーズ

今回の文書更新では未実施です。camera frameは保存しません。
Camera Sourceの起動・lease、previewの反転・カメラ選択、認識・overlay・停止時の解放を、実機で確認した場合だけ記録します。
rc.8の旧証跡はcandidateの`historicalCandidates`に保存しています。TurboWarp Teachable Machine 1.12.0、
Bubble 0.10.0、23個のcore action、上流unit 1,161件とChromium 13件等は当時の記録であり、rc.23のpassではありません。

## Release-stop条件

checksum不一致、Schemaと公開blockの食い違い、必要な実行確認の未完了を成功として記録しないでください。
上流リリースの受け入れ条件は固定したrelease metadataと対応するIssueで確認します。
文書の公開可否と、アプリの安定版リリース完了を同じ判定にしません。

## Rollback

公開済みrc.23を同じversionで差し替えません。必要なら直前のrc.22または推奨安定版3.2.3へ戻します。
文書の誤りは本Issueの差分をrevertして直前の確認済み記述へ戻します。
旧versionのSB3、履歴、実機測定値は削除・上書きしません。

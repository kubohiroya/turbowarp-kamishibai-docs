# DSL 4.0 release smoke

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書基準: 公開プレリリース`4.0.0-rc.25`、commit `a68f8dc4d38b4609c8387192d3be0376963735e3`、2026年10月19日。
正式版4.0.0は未公開です。これは再現と照合の手順であり、未実行項目をpassとする記録ではありません。

本書はリリース担当者向けで、一般的な動作確認を説明する文書ではありません。

| 用語     | 意味                                         |
| -------- | -------------------------------------------- |
| manifest | 版・成果物・照合範囲を固定する機械可読な記録 |
| checksum | 取得した成果物のバイト列を照合する値         |

## Schemaと公開runtimeの二つの基準

公開runtimeの調査基準は`4.0.0-rc.25`（`a68f8dc4`）です。Schemaリファレンスも同じ公開commitへ固定し、portraitの`placement`、`offset`、`cornerRadius`はrc.25で利用できます。
公開版の入力を検査するときは`sources/dsl4/dsl-4.0-rc.25.schema.json`を使い、
現行Schemaの出典は`sources/dsl4/source-lock.json`で確認します。旧版の検証結果を現行版へ読み替えません。

## 固定値

正本は`sources/dsl4/release-smoke-4.0-candidate.json`です。

| 対象               | 固定値                                                                             |
| ------------------ | ---------------------------------------------------------------------------------- |
| freeze／tag commit | `a68f8dc4d38b4609c8387192d3be0376963735e3`                                         |
| source identity    | `sha256:0e0ed3c9a8b99e2fd6aee84818a3400e619a1adfd844dc0d0b3b0b00d84158ca`          |
| Schema SHA-256     | `55221950a3649c6f97594e3b2dd54e0d623f97fee67842e179ab99347bf0ec27`                 |
| Standard SB3       | 6923215 bytes / `d6b8d73e27685ac8359a17ade7c5c9cb4596ab22413eae9bf33d060351d0ab29` |
| npm tarball        | 6664616 bytes / `79fb6803bd6b1abc41c3776ee3c27b205b90c90bc8a333fdd2fc5760fc3ec3a3` |

## Feature flag snapshot

汎用defaultはすべてOFFです。Standard productionは起動時にsnapshotを明示して有効化します。
現在のON一覧はcandidateの`runtime.featureFlags.standardProductionEnabled`と固定ソースの
`src/dsl4/feature-flags.ts`で照合します。crossfade、読取状態、式namespace、プレビューの反転と操作UI、
broadcast、Bubbleの高度な表示、カメラ許可段などを含みます。
ポーズoverlayには専用flagがなく、`recognition.preview.overlay`の宣言を使います。

## 自動検証

固定tagをcheckoutし、依存をlockどおりに用意してから、変更の影響に合う上流のVitest対象を選びます。
rc.25のTypeScript／Vitest suiteを、rc.8当時の`node --test`や件数で説明しません。
rc.25公開時の本体・samples CIの結果はcandidateの出典URLで追跡します。この文書更新では上流suiteを再実行せず、旧版の件数もrc.25へ読み替えません。文書側の検証結果はIssue #217に記録します。

## 公開物を照合する

[GitHub Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.25)からStandard SB3を取得し、上記size／hashと照合します。

```bash
curl -fL https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.25/kamishibai-4.0.0-rc.25.sb3 -o kamishibai-4.0.0-rc.25.sb3
shasum -a 256 kamishibai-4.0.0-rc.25.sb3
npm view @kubohiroya/turbowarp-kamishibai-app@4.0.0-rc.25 version dist.tarball dist.integrity dist.shasum
npm view @kubohiroya/turbowarp-kamishibai-app dist-tags
```

npm integrityは`sha512-gruNLzXoJVMwybzsZ6zwgHMItz63wpvK3Uu96EYklX1aBGpo6jwPI60kze6MjggglmcaRebhe42U6CP3n5c5/Q==`です。今回SB3とnpm tarballの実バイトを照合しました。
確認時のnpm `latest`と`next`はrc.25で、推奨安定版3.2.3とは別です。Pagesのversion付きSB3も取得し、GitHub Releaseと同じsize/hashであることを確認済みです。
公開サンプル3作品のruntime commitと公開16ファイルのsize/hashを照合しました。同じバイト列のWeb作品と実Editorでのブロック台本再生を確認しています。実カメラ・実ポーズは未検証です。

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
TurboWarp-Plus-Editorでは[機能拡張セキュリティ](../user-guides/user-guide-4.0.md#extension-security)でアイコン順・非対応理由・「動作に必要」を確認します。
必須宣言のある拡張で「サンドボックスあり」を選べないことと、明示的な選択・OKまで実行されないことを確認します。
旧Editorでサンドボックス内の実行を選べた場合は、パレットの再読込案内も確認します。

## 実カメラ・実ポーズ

今回の文書更新では未実施です。camera frameは保存しません。
Camera Sourceの起動・lease、previewの反転・カメラ選択、認識・overlay・停止時の解放を、実機で確認した場合だけ記録します。
rc.8の旧証跡はcandidateの`historicalCandidates`に保存しています。TurboWarp Teachable Machine 1.12.0、
Bubble 0.10.0、23個のcore action、上流unit 1,161件とChromium 13件等は当時の記録であり、rc.25のpassではありません。

## Release-stop条件

checksum不一致、Schemaと公開blockの食い違い、必要な実行確認の未完了を成功として記録しないでください。
上流リリースの受け入れ条件は固定したrelease metadataと対応するIssueで確認します。
文書の公開可否と、アプリの安定版リリース完了を同じ判定にしません。

## Rollback

公開済みrc.25を同じversionで差し替えません。必要なら直前の確認済みrc.23または推奨安定版3.2.3へ戻します。
文書の誤りは本Issueの差分をrevertして直前の確認済み記述へ戻します。
旧versionのSB3、履歴、実機測定値は削除・上書きしません。

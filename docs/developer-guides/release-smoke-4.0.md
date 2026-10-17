# DSL 4.0 release smoke

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書基準: 公開プレリリース`4.0.0-rc.22`、commit `f8048b8c4ebd0ecd6213bb87582862034b2b88ce`、2026年10月17日。
正式版4.0.0は未公開です。これは再現と照合の手順であり、未実行項目をpassとする記録ではありません。

本書はリリース担当者向けで、一般的な動作確認を説明する文書ではありません。

| 用語     | 意味                                         |
| -------- | -------------------------------------------- |
| manifest | 版・成果物・照合範囲を固定する機械可読な記録 |
| checksum | 取得した成果物のバイト列を照合する値         |

## Schemaと公開runtimeの二つの基準

公開runtimeの調査基準は`4.0.0-rc.22`（`f8048b8c`）です。Schemaリファレンスはmainの
実装基準`450a5bb`を保持し、portraitの`placement`、`offset`、`cornerRadius`はrc.22未対応として区別します。
公開版の入力を検査するときは`sources/dsl4/dsl-4.0-rc.22.schema.json`を使い、
新しい実装Schemaの出典は`sources/dsl4/source-lock.json`で確認します。両者の検証結果を混同しません。

## 固定値

正本は`sources/dsl4/release-smoke-4.0-candidate.json`です。

| 対象               | 固定値                                                                             |
| ------------------ | ---------------------------------------------------------------------------------- |
| freeze／tag commit | `f8048b8c4ebd0ecd6213bb87582862034b2b88ce`                                         |
| source identity    | `sha256:44e85ea98dd7d4aef7bbd08c21610675bef8cd9a6244196a9fac54caa712ee6f`          |
| Schema SHA-256     | `f61955685c51ed7cfe3ed5b760ca6d290929ab9fdc4b8a912cdb901135c613ac`                 |
| Standard SB3       | 6911464 bytes / `3731ed3a58c000d40f65057fbe5e27b340bae915df11e863fd55c98ba061b5c9` |
| npm tarball        | 6667560 bytes / `b4b2b4ae68f39d3eabc358c9b8172d7b4f26952eb95730eb11b66d81527badbd` |

## Feature flag snapshot

汎用defaultはすべてOFFです。Standard productionは起動時にsnapshotを明示して有効化します。
現在のON一覧はcandidateの`runtime.featureFlags.standardProductionEnabled`と固定ソースの
`src/dsl4/feature-flags.ts`で照合します。crossfade、読取状態、式namespace、プレビューの反転と操作UI、
broadcast、Bubbleの高度な表示、カメラ許可段などを含みます。
ポーズoverlayには専用flagがなく、`recognition.preview.overlay`の宣言を使います。

## 自動検証

固定tagをcheckoutし、依存をlockどおりに用意してから、変更の影響に合う上流のVitest対象を選びます。
TypeScriptへ移行したrc.22のsuiteを、rc.8当時の`node --test`や件数で説明しません。
この文書更新では上流suiteを実行していません。文書側の検証結果はIssue #195に記録します。

## 公開物を照合する

[GitHub Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.22)からStandard SB3を取得し、上記size／hashと照合します。

```bash
curl -fL https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.22/kamishibai-4.0.0-rc.22.sb3 -o kamishibai-4.0.0-rc.22.sb3
shasum -a 256 kamishibai-4.0.0-rc.22.sb3
npm view @kubohiroya/turbowarp-kamishibai-app@4.0.0-rc.22 version dist.tarball dist.integrity dist.shasum
npm view @kubohiroya/turbowarp-kamishibai-app dist-tags
```

npm integrityは`sha512-CHT3k06i/Jrw6jeIr6liwAt7k869CSWsW77vWT1MwM4sRVRjsT7Q0/w12t286i5yzYXmJk1tVkvLw8TFE2qMWQ==`です。今回SB3とnpm tarballの実バイトを照合しました。
確認時のnpm `latest`と`next`はrc.22で、推奨安定版3.2.3とは別です。Pagesのversion付きSB3は404で、照合成功として扱いません。
公開サンプルは3作品のmanifestのruntime commitを照合しました。各サンプルの再hash・再生は未実施です。

## TurboWarp surfaceを確認する

Standard SB3のbundleは8 member、表示されるopcode付きblockは202個です。
runtimeには29個のcore action、2個のsource宣言block、17個の読取状態blockがあります。
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
Bubble 0.10.0、23個のcore action、上流unit 1,161件とChromium 13件等は当時の記録であり、rc.22のpassではありません。

## Release-stop条件

checksum不一致、Schemaと公開blockの食い違い、必要な実行確認の未完了を成功として記録しないでください。
上流リリースの受け入れ条件は固定したrelease metadataと対応するIssueで確認します。
文書の公開可否と、アプリの安定版リリース完了を同じ判定にしません。

## Rollback

公開済みrc.22を同じversionで差し替えません。必要ならrc.21または推奨安定版3.2.3へ戻します。
文書の誤りは本Issueの差分をrevertして直前の確認済み記述へ戻します。
旧versionのSB3、履歴、実機測定値は削除・上書きしません。

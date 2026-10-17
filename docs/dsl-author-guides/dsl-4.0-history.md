# 紙芝居DSL 4.0 リリース履歴

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: 公開プレリリースと安定版を区別する4.0系列の履歴<br />
対象Issue: [turbowarp-kamishibai-docs #42](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/42)、[#169](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/169)

この文書は開発・リリース担当者向けで、アプリの使い方や台本作成の
入門書ではありません。初めて使う方は
[大人向け概要](../user-guides/executive-summary-adult-4.0.md)、実際に試す方は
[操作説明書](../user-guides/user-guide-4.0.md)から始めてください。機械可読な正本は
[`sources/dsl4/release-history-4.0.json`](https://github.com/kubohiroya/turbowarp-kamishibai-docs/blob/main/sources/dsl4/release-history-4.0.json)です。

## この文書の読み方

版ごとの記録は、いずれも同じ順序で並んでいます。目的の情報がどの見出しにあるかは、次の対応で探してください。

| 見出し               | 記録している内容                                        |
| -------------------- | ------------------------------------------------------- |
| 固定revisionと公開先 | tag、commit、Schema SHA-256、GitHub・npm・Pagesの公開先 |
| 「rc.Nからの変更」   | その版で加わった機能と、作り直した公開物                |
| exact dependency pin | その版がexact pinしている機能拡張の版                   |
| 公開成果物           | SB3とnpm tarballのバイト数、SHA-256、registry integrity |
| 検証、制約、rollback | 通過した検証、未完了の確認、問題が起きたときに戻す先    |

新しい版ほど上にあります。末尾の「次のversionを追記する」は、この履歴を更新する担当者向けの手順です。

## 最初に出てくる言葉

| 状態             | 意味                                                             |
| ---------------- | ---------------------------------------------------------------- |
| 公開プレリリース | npm `next`、GitHub prerelease、Pages成果物として公開された候補版 |
| 安定版           | リリースが安定運用向けに推奨する版（npm latestとは別に確認）     |
| 公開サンプル基準 | サンプル作品、starter、Web版を生成したruntimeの版                |

2026年10月17日現在、公開プレリリースは`v4.0.0-rc.22`です。正式版`v4.0.0`は未公開です。
リリースノート上の推奨安定版は`v3.2.3`ですが、現行packageのnpm `latest`／`next`はともにrc.22です。
以下のrc.10以前の公開・検証記録は当時の事実として保存し、rc.22へ読み替えません。

## 4.0.0-rc.22

状態: **公開プレリリース**。実装基準はcommit `f8048b8c4ebd0ecd6213bb87582862034b2b88ce`です。
GitHub Release・npm配布物は実際に取得してsize／hashを照合しました。公開サンプルは3作品のmanifestを照合しました。
今回、上流suite、ブラウザー再生、実カメラ・実ポーズの再検証は行っていません。

### 固定revisionと公開先

| 対象              | 固定値                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| tag               | `v4.0.0-rc.22`                                                                                                                       |
| commit            | `f8048b8c4ebd0ecd6213bb87582862034b2b88ce`                                                                                           |
| source identity   | `sha256:44e85ea98dd7d4aef7bbd08c21610675bef8cd9a6244196a9fac54caa712ee6f`                                                            |
| Schema SHA-256    | `f61955685c51ed7cfe3ed5b760ca6d290929ab9fdc4b8a912cdb901135c613ac`                                                                   |
| GitHub prerelease | [v4.0.0-rc.22](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.22)                                     |
| npm               | [@kubohiroya/turbowarp-kamishibai-app@4.0.0-rc.22](https://www.npmjs.com/package/@kubohiroya/turbowarp-kamishibai-app/v/4.0.0-rc.22) |
| 公開サンプル基準  | 4.0.0-rc.22。各公開manifestのruntime commitを照合                                                                                    |

### rc.8以降の変更と反映先

| 版・確認基準           | 変更                                                           | 確認する契約                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rc.9                   | 表示とBGMのcrossfade                                           | presentation.transitions、audio.bgm.transition、action／sceneのtransition                                                                                                                              |
| rc.10                  | Extension ID移行と名称・公開先の整理                           | kubohiroyatm、互換性・移行ガイド                                                                                                                                                                       |
| rc.11（未公開）／rc.12 | package／CLI移行、TypeScript・Vitest・Viteへの移行             | dist公開subpath、src／testの.ts参照、メンテナンスガイド                                                                                                                                                |
| rc.13                  | TurboWarp-Kamishibaiのpackage／CLI名称                         | @kubohiroya/turbowarp-kamishibai-app、turbowarp-kamishibai                                                                                                                                             |
| rc.14                  | YAMLとブロック台本を往復するCLI                                | validate-dsl4 --format canonical-json、author-block-dsl、export-block-dsl                                                                                                                              |
| rc.15                  | 認識拡張のpackage名変更                                        | @kubohiroya/turbowarp-teachable-machine                                                                                                                                                                |
| rc.16／rc.17           | Camera Source同梱とlease不具合修正                             | rc.16はポーズ作品へ使用しない、Camera Sourceがカメラを所有                                                                                                                                             |
| rc.18                  | カメラプレビュー操作UIの接続                                   | recognition.preview.controls、K4-HOST-PREVIEW-CONTROLS-001                                                                                                                                             |
| rc.19                  | 対応ブラウザーのタイトルでカメラ許可                           | dsl4UserMediaPermissionGate、非対応環境は従来の取得経路                                                                                                                                                |
| rc.20／rc.21           | プレビューと推論入力の分離・画像モードの向き・preview終了      | Teachable Machine 3.5.1、中央正方形と左右反転、停止時の接続終了                                                                                                                                        |
| rc.22                  | リモート取得失敗の原因表示・preview失敗ダイアログ・sandbox案内 | K4-ASSET-REMOTE-OFFLINE-001、K4-ASSET-REMOTE-CORS-001、K4-ASSET-REMOTE-CONNECT-001、K4-ASSET-REMOTE-TLS-001                                                                                            |
| rc.22固定ソースの照合  | 旧snapshotとの差分（個別の導入版は未特定）                     | recognition／recognitionModel、imageInputToChangeScene、setVariable／changeVariable／toggleVariable、BGM音量・停止、Actor.setTextのruby、読取専用runtime surface、Asset ManagerからAsset Cacheへの置換 |

個別の導入版を特定していない項目は、rc.22固定ソースで確認した現行契約として記録しています。
rc.11は未公開で、変更内容はrc.12に含まれます。rc.16にはポーズ認識のlease経路の不具合があり、rc.17で修正されています。
台本のdocument versionは引き続き`kamishibai: '4.0'`です。

### exact dependency pin

- `@kubohiroya/turbowarp-app-shell@0.2.0`
- `@kubohiroya/turbowarp-asset-cache@0.1.0`
- `@kubohiroya/turbowarp-async-input@0.7.0`
- `@kubohiroya/turbowarp-bubble@0.13.0`
- `@kubohiroya/turbowarp-camera-source@0.15.0`
- `@kubohiroya/turbowarp-extension-manifest@0.2.0`
- `@kubohiroya/turbowarp-kvs@0.1.0`
- `@kubohiroya/turbowarp-live-reload-controller@0.2.0`
- `@kubohiroya/turbowarp-local-preview@0.1.0`
- `@kubohiroya/turbowarp-runtime-adapter@0.2.0`
- `@kubohiroya/turbowarp-runtime-expression@0.6.0`
- `@kubohiroya/turbowarp-svg-text@0.10.0`
- `@kubohiroya/turbowarp-teachable-machine@3.5.1`
- `@teachablemachine/pose@0.8.6`
- `@tensorflow/tfjs@1.3.1`
- `@turbowarp/scratch-storage@2.0.0`
- `@turbowarp/scratch-svg-renderer@1.1.0`
- `base64-js@1.5.1`
- `brfs@2.0.2`
- `buffer@6.0.3`
- `fflate@0.8.3`
- `scratch-audio@github:TurboWarp/scratch-audio#aba00cd02e36d95407effafa03f3678e4c669b30`
- `scratch-render@github:TurboWarp/scratch-render#a67f7c9c07d459582c227d4fd3fae8f59d8fc9ce`
- `scratch-vm@github:TurboWarp/scratch-vm#c4823421cb7c17d8d8a89878851ce1668c26a21f`
- `vite@^8.3.3`
- `yaml@2.9.0`

### 公開成果物

| 成果物       | bytes   | SHA-256                                                            |
| ------------ | ------- | ------------------------------------------------------------------ |
| Standard SB3 | 6911464 | `3731ed3a58c000d40f65057fbe5e27b340bae915df11e863fd55c98ba061b5c9` |
| npm tarball  | 6667560 | `b4b2b4ae68f39d3eabc358c9b8172d7b4f26952eb95730eb11b66d81527badbd` |

npm integrity: `sha512-CHT3k06i/Jrw6jeIr6liwAt7k869CSWsW77vWT1MwM4sRVRjsT7Q0/w12t286i5yzYXmJk1tVkvLw8TFE2qMWQ==`。
Pagesのversion付きSB3 URLは確認時に404だったため、[GitHub ReleaseのSB3](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.22/kamishibai-4.0.0-rc.22.sb3)を使います。

### 検証、制約、rollback

今回の照合は配布物とmanifestの確認です。実行テストや実カメラの成功を意味しません。
過去のカメラ測定は当時の版にだけ帰属し、rc.22へ適用しません。
問題時は公開済みrc.21または推奨安定版3.2.3へ戻し、rc.22を同じversionで差し替えません。
文書だけに問題がある場合は文書変更をrevertし、確認済みの基準へ戻します。

## 4.0.0-rc.10

状態: **公開プレリリース**<br />
公開日時: 2026年8月26日 05:27 JST

### 固定revisionと公開先

| 対象                  | 固定値                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 追跡Issue             | [`#661`](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/661)                                                                                                                     |
| candidate PR          | [`#663`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/663) / `235b0bfce403fd8a6e3026bd23b6562b53c132e5`                                                                          |
| freeze PR／tag commit | [`#664`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/664) / [`65f5e70`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/65f5e705921b6c92ba6ec5373ec13eff5101f2c6) |
| 公開記録PR            | [`#665`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/665) / `ce397b4be9a0f26ad2392e4193afa701b2834cb8`                                                                          |
| release source        | tag `v4.0.0-rc.10`。現行branchへ展開copyを保持しない                                                                                                                                            |
| source identity       | `sha256:ed05e732c9c0a0d7f43d85802450c88871bdab938a6809f7898815ae3cea714f`                                                                                                                       |
| Schema SHA-256        | `22edefa88eaa928edb8ae6fb6a8f9dce89e56ad2feb63ebaa91337757540a1df`                                                                                                                              |
| GitHub prerelease     | [`v4.0.0-rc.10`](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.10)                                                                                              |
| npm                   | [`4.0.0-rc.10`](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.10)、dist-tag `next`                                                                                     |
| Pages                 | [download一覧](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/) / `ce397b4be9a0f26ad2392e4193afa701b2834cb8`                                                                   |

作者向けSchemaリファレンスはtag commit `65f5e705921b6c92ba6ec5373ec13eff5101f2c6`と同じ
Schema SHA-256を固定します。

### rc.8からの変更

- TurboWarp Teachable Machineの新しいExtension IDと`kubohiroyatm` runtime IDへ移行する
- TurboWarp-Kamishibaiの表示名、リポジトリURL、Pages URLを現行名へ揃える
- TurboWarp-TM 2.0.0、Bubble 0.11.0、関連TurboWarp機能拡張のexact pinへ更新する
- 公開サンプルのSB3、Web版、lockをrc.10 freeze commitから再生成する

### exact dependency pin

| package                                    | version |
| ------------------------------------------ | ------- |
| `@kubohiroya/turbowarp-asset-manager`      | 0.14.0  |
| `@kubohiroya/turbowarp-async-input`        | 0.6.0   |
| `@kubohiroya/turbowarp-bubble`             | 0.11.0  |
| `@kubohiroya/turbowarp-runtime-expression` | 0.5.0   |
| `@kubohiroya/turbowarp-svg-text`           | 0.9.0   |
| `@kubohiroya/turbowarp-tm`                 | 2.0.0   |

### 公開成果物

| 成果物                                                                                                                           | byte      | 完全性情報                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| [Standard SB3](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.10/kamishibai-4.0.0-rc.10.sb3) | 6,787,273 | SHA-256 `a8620868f5da118c142cf2a11db6679ce7fab8b8ef84f5e6cce26887d61e94ec` |
| [npm tarball](https://registry.npmjs.org/@kubohiroya/tmpose-kamishibai/-/tmpose-kamishibai-4.0.0-rc.10.tgz)                      | 6,517,684 | SHA-256 `dfb42cbf86ca45465298be357f5852ae52aefc7f226c3c6742ee1c5c6e317c3c` |

npm registry integrityは
`sha512-U8iLEYCgdvR46Q9S7ieLMt8UZF2chVtuoKoYSmuZKh8GbVZW8vFxY7XEySwQh6KywPv/gnoxwh56Q0P9axAk+g==`です。
GitHub ReleaseとPagesのSB3は同じbyte数とSHA-256です。

### 検証、公開サンプル、rollback

公開サンプルは[samples PR #131](https://github.com/kubohiroya/turbowarp-kamishibai-samples/pull/131)で
rc.10 freeze commitから再生成し、[Pages deployment](https://github.com/kubohiroya/turbowarp-kamishibai-samples/actions/runs/32901209798)と
公開manifestを照合しました。camera contextの物理測定はrc.8時点の証跡を履歴として維持し、rc.10ではCIとPages上の
SB3/Web成果物の再現性を確認しています。

- DSL document versionは引き続き`kamishibai: "4.0"`
- rc.8以前のversion付きSB3とtagを差し替えない
- 問題時はnpm `next`を`4.0.0-rc.9`へ戻し、公開済みrc.10のバイト列を上書きしない
- 修正版は`4.0.0-rc.11`以降として公開する

## 4.0.0-rc.8

状態: **公開プレリリース**<br />
公開日時: 2026年8月20日 21:02 JST

### 固定revisionと公開先

| 対象                  | 固定値                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 追跡Issue             | [`#647`](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/647)                                                                                                                     |
| candidate PR          | [`#648`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/648) / `ad244910b6bf579b8eb7c7af70d72b7ca4b1fff6`                                                                          |
| freeze PR／tag commit | [`#649`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/649) / [`29c0dea`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/29c0deadcb98badf94a0244c479ca896dc71f842) |
| 公開記録PR            | [`#650`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/650) / `36b4d3bb4c1c809004dab9b0327857b394727a58`                                                                          |
| release source        | tag `v4.0.0-rc.8`。現行branchへ展開copyを保持しない                                                                                                                                             |
| source identity       | `sha256:8edbc02a06b3770cce0a89cf658367df129d974d53f401258b69f0713762014a`                                                                                                                       |
| Schema SHA-256        | `46ff159c29e13704d707dae8e0d2ad3a146b6aa8a68a968614e6ef56d112f135`                                                                                                                              |
| GitHub prerelease     | [`v4.0.0-rc.8`](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.8)                                                                                                |
| npm                   | [`4.0.0-rc.8`](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.8)、dist-tag `next`                                                                                       |
| Pages                 | [download一覧](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/) / `ff3867cfe32b3ff7c0c7cc9314e71459df55419d`                                                                   |

作者向けSchemaリファレンスはtag commit `29c0deadcb98badf94a0244c479ca896dc71f842`と同じ
Schema SHA-256を固定します。

### rc.7からの変更

- トップレベルの`bubbleClosePolicies`へ、秒数、`waitFor: advance`、または両方を名前付きで定義可能にした
- `Actor.say`／`Actor.think`の`closePolicy`でpolicyを1件参照し、既存のspeech lifecycleへ展開する
- `closePolicy`とaction内の`seconds`／`waitFor`の同時指定、未定義policyを決定的な診断で拒否する
- 従来のinline `seconds`／`waitFor`は互換経路として維持する
- Bubbleを0.10.0へexact pinし、Scratch互換の組み込み`say`／`think` styleとclose-policy blockをbundleする
- 公開サンプルのSB3、Web版、lockをrc.8 freeze commitから再生成する

### exact dependency pin

| package                                    | version |
| ------------------------------------------ | ------- |
| `@kubohiroya/turbowarp-asset-manager`      | 0.11.0  |
| `@kubohiroya/turbowarp-async-input`        | 0.4.0   |
| `@kubohiroya/turbowarp-bubble`             | 0.10.0  |
| `@kubohiroya/turbowarp-runtime-expression` | 0.4.0   |
| `@kubohiroya/turbowarp-svg-text`           | 0.5.0   |
| `@kubohiroya/turbowarp-tmpose`             | 1.12.0  |

### 公開成果物

| 成果物                                                                                                                         | byte      | 完全性情報                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------- |
| [Standard SB3](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.8/kamishibai-4.0.0-rc.8.sb3) | 6,749,955 | SHA-256 `91d7f594aaf922450fba359a90c7c26e7c1dfda51cf002534cb4605dbb0d7041` |
| [npm tarball](https://registry.npmjs.org/@kubohiroya/tmpose-kamishibai/-/tmpose-kamishibai-4.0.0-rc.8.tgz)                     | 6,492,990 | SHA-256 `a7b91378e6345c530515cc4e8f82314c3c5f2a19d3e136de5e4fe8bff8d24c5e` |

npm registry integrityは
`sha512-nQmvHakwLWZioi1gOUZatKwyLe2nD3GPJbEBrqDqm5mzqQhbbLEMGl3znJQpVs0JRfzyeLI1JDTcGrePiIpjUg==`です。
GitHub ReleaseとPagesのSB3は同じbyte数とSHA-256です。

### 検証、公開サンプル、rollback

candidate PRの`pnpm verify:full`はNode系1,161件とChromium 13件を通過しました。記録は
[GitHub Actions](https://github.com/kubohiroya/turbowarp-kamishibai-app/actions/runs/32361658847/job/96402336784)で確認できます。
公開サンプルは[samples PR #126](https://github.com/kubohiroya/turbowarp-kamishibai-samples/pull/126)で
rc.8 freeze commitから再生成し、[Pages deployment](https://github.com/kubohiroya/turbowarp-kamishibai-samples/actions/runs/32368656029)と
公開manifestを照合しました。camera contextの既存物理測定を維持し、rc.8のrecognitionとoverlayは公開Web版で
起動・停止・cleanupを確認しています。

- DSL document versionは引き続き`kamishibai: "4.0"`
- `closePolicy`を使わないrc.7以前のDSL 4台本は変更不要
- rc.7以前のversion付きSB3とtagを差し替えない
- 問題時はnpm `next`を`4.0.0-rc.7`へ戻し、公開済みrc.8のbyte列を上書きしない
- 修正版は`4.0.0-rc.9`以降として公開する

## 4.0.0-rc.7

状態: **公開プレリリース**<br />
公開日時: 2026年8月16日 19:36 JST

### 固定revisionと公開先

| 対象                  | 固定値                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 追跡Issue             | [`#630`](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/630)                                                                                                                     |
| candidate PR          | [`#633`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/633) / `449eea670e4616b4ea155e9f42cae4742ba1cd1a`                                                                          |
| freeze PR／tag commit | [`#634`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/634) / [`3a5f31d`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/3a5f31d2519dfb2b9dab32b2c377762c774d5844) |
| 公開記録PR            | [`#635`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/635) / `9bf0f8a7c6130d93c175b03048c4c4209e7f6eca`                                                                          |
| release source        | tag `v4.0.0-rc.7`。現行branchへ展開copyを保持しない                                                                                                                                             |
| source identity       | `sha256:838e82d33a9ecb67da81eafdc115afd4fd856db2721d1160ee601a389b6a96a7`                                                                                                                       |
| Schema SHA-256        | `bb96f6fd503ee7a747b48b4cdc30db227b5d3171854c2b83a47a96c15ed7fd79`                                                                                                                              |
| GitHub prerelease     | [`v4.0.0-rc.7`](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.7)                                                                                                |
| npm                   | [`4.0.0-rc.7`](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.7)、dist-tag `next`                                                                                       |
| Pages                 | [download一覧](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/)                                                                                                                |

作者向けSchemaリファレンスはtag commit `3a5f31d2519dfb2b9dab32b2c377762c774d5844`と同じ
Schema SHA-256を固定します。

### rc.6からの変更

- TMPoseを1.12.0へexact pin
- 公開API／opcodeの`startPredict`、`stopPredict`、`isPredicting`を
  `startRecognition`、`stopRecognition`、`isRecognizing`へ置換
- `getPredictionConfidence`と`getPredictLoopState`もrecognition用語へ統一
- 旧predict opcodeの互換aliasを残さず、ブロック文とAPIの用語を一致させた
- `poseRecognition.preview.overlay`は専用feature flagなしで利用できるrc.6の契約を維持
- 公開サンプルのSB3、Web、lockをrc.7 freeze commitから再生成

### exact dependency pin

| package                                    | version |
| ------------------------------------------ | ------- |
| `@kubohiroya/turbowarp-asset-manager`      | 0.11.0  |
| `@kubohiroya/turbowarp-async-input`        | 0.4.0   |
| `@kubohiroya/turbowarp-bubble`             | 0.7.0   |
| `@kubohiroya/turbowarp-runtime-expression` | 0.4.0   |
| `@kubohiroya/turbowarp-svg-text`           | 0.5.0   |
| `@kubohiroya/turbowarp-tmpose`             | 1.12.0  |

### 公開成果物

| 成果物                                                                                                                         | byte      | 完全性情報                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------- |
| [Standard SB3](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.7/kamishibai-4.0.0-rc.7.sb3) | 6,684,157 | SHA-256 `3ad25911b9255d51273b37f24fa0d056e6ec72418f314e97c743ad52300380f8` |
| [npm tarball](https://registry.npmjs.org/@kubohiroya/tmpose-kamishibai/-/tmpose-kamishibai-4.0.0-rc.7.tgz)                     | 6,446,348 | SHA-256 `9f0055694521f60abcc7c0a072b251489b9c9ac48b6760b6cff773a22977c38a` |

npm registry integrityは
`sha512-LfXNBg2ORGRex8j31NyDBEg0Zn/X7tosecX+B1Bav1V6S6gd4eqJAnYblOHlXYX+wvSiptMndwo22uWbPTCX8A==`です。
GitHub ReleaseとPagesのSB3は同じbyte数とSHA-256です。

### 検証、制約、rollback

candidate PRの`pnpm verify:full`はNode系1,159件とChromium 13件を通過しました。記録は
[GitHub Actions](https://github.com/kubohiroya/turbowarp-kamishibai-app/actions/runs/31941807053/job/95151986429)で確認できます。
rc.7は認識APIの用語を修正したreleaseで、camera contextとoverlayの責務境界はrc.6から変更していません。
公開サンプルはChromium／WebKitでrecognitionとoverlayの起動・停止・cleanupを検証しています。

- DSL document versionは引き続き`kamishibai: "4.0"`
- `overlay`省略時は非表示、記述して`visible`省略時は表示
- rc.6以前のversion付きSB3とtagを差し替えない
- 問題時はnpm `next`を`4.0.0-rc.6`へ戻し、公開済みrc.7のbyte列を上書きしない
- 修正版は`4.0.0-rc.8`以降として公開する

## 4.0.0-rc.6

状態: **公開プレリリース**<br />
公開日時: 2026年8月16日 16:08 JST

### 固定revisionと公開先

| 対象                  | 固定値                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 追跡Issue             | [`#624`](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/624)                                                                                                                     |
| candidate PR          | [`#625`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/625) / `4efec1963af04b50c080bef7095f598da928ac84`                                                                          |
| freeze PR／tag commit | [`#626`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/626) / [`4c360cd`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/4c360cd9845f9dcdbf7ecbffaa2fe4c1462af8b6) |
| 公開記録PR            | [`#627`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/627) / `72cf2fa8c5a989169cd3929614cf61e77eef25af`                                                                          |
| release source        | tag `v4.0.0-rc.6`。現行branchへ展開copyを保持しない                                                                                                                                             |
| source identity       | `sha256:ebdde314be4d929894bce9eb511f340c61879b2b9ff8366ae31cabbb00bfbf10`                                                                                                                       |
| Schema SHA-256        | `bb96f6fd503ee7a747b48b4cdc30db227b5d3171854c2b83a47a96c15ed7fd79`                                                                                                                              |
| GitHub prerelease     | [`v4.0.0-rc.6`](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.6)                                                                                                |
| npm                   | [`4.0.0-rc.6`](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.6)、dist-tag `next`                                                                                       |
| Pages                 | [download一覧](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/)                                                                                                                |

作者向けSchemaリファレンスはtag commit `4c360cd9845f9dcdbf7ecbffaa2fe4c1462af8b6`と同じ
Schema SHA-256を固定します。

### rc.5からの変更

- TMPoseを1.11.0へexact pinし、camera canvasのcontext／readback責務をTMPose上流へ集約
- `poseRecognition.preview.overlay`からSVGの関節とボーンを表示し、style、最低confidence、confidence連動を設定可能にした
- overlay専用feature flagを設けず、DSL 4.0 runtimeでSchemaに設定があれば公開Composition APIへ接続
- scratch-renderとPackagerへ警告抑制patchを当てず、実測に基づく上流責務を維持
- project source manifestを任意化し、唯一の`.k4.yml`を自動選択できるようにした
- 公開SB3の正本をGitHub Releasesへ移し、旧`release-sources/`の展開copyを廃止

### exact dependency pin

| package                                    | version |
| ------------------------------------------ | ------- |
| `@kubohiroya/turbowarp-asset-manager`      | 0.11.0  |
| `@kubohiroya/turbowarp-async-input`        | 0.4.0   |
| `@kubohiroya/turbowarp-bubble`             | 0.7.0   |
| `@kubohiroya/turbowarp-runtime-expression` | 0.4.0   |
| `@kubohiroya/turbowarp-svg-text`           | 0.5.0   |
| `@kubohiroya/turbowarp-tmpose`             | 1.11.0  |

### 公開成果物

| 成果物                                                                                                                         | byte      | 完全性情報                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------- |
| [Standard SB3](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.6/kamishibai-4.0.0-rc.6.sb3) | 6,684,010 | SHA-256 `be0e38d6179873894db2363751955ccd68b971a829a5b09c048e54986fbd7796` |
| [npm tarball](https://registry.npmjs.org/@kubohiroya/tmpose-kamishibai/-/tmpose-kamishibai-4.0.0-rc.6.tgz)                     | 6,446,010 | SHA-256 `6581c73b61f90762383bc8284699bb994dc396951ae3bfdd271249a362c99eba` |

npm registry integrityは
`sha512-q4amPLLmVrsh60ZhNo6sjtCYLwBVH8nosmElbh/LGdX4/4gVBw4oohcgIgAZLm5G0VmgWxfj3NJ0fxHLe+C7bg==`です。
GitHub ReleaseとPagesのSB3は同じbyte数とSHA-256です。

### 検証、制約、rollback

freeze PRの`pnpm verify:full`はNode系1,212件とChromium 13件を通過しました。記録は
[GitHub Actions](https://github.com/kubohiroya/turbowarp-kamishibai-app/actions/runs/31931898431/job/95127903375)で確認できます。
物理cameraの測定では通常Canvas2D contextに再現性のある劣化がなく、CPU推論時のChromium readback警告は
性能根拠のない抑制をせず許容します。camera frameは保存していません。

- DSL document versionは引き続き`kamishibai: "4.0"`
- `overlay`省略時は非表示、記述して`visible`省略時は表示
- rc.5以前のversion付きSB3とtagを差し替えない
- 問題時はnpm `next`を`4.0.0-rc.5`へ戻し、公開済みrc.6のbyte列を上書きしない
- 修正版は`4.0.0-rc.7`として公開する

## 4.0.0-rc.5

状態: **公開プレリリース**<br />
公開日時: 2026年8月15日 03:55 JST

### 固定revisionと公開先

| 対象                  | 固定値                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 追跡Issue             | [`#583`](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/583)                                                                                                                     |
| candidate PR          | [`#593`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/593) / `9b3895638edba009ee4558a6c0594f077d9fbd6b`                                                                          |
| freeze PR／tag commit | [`#594`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/594) / [`f323a54`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6) |
| 公開記録PR            | [`#596`](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/596) / `f76af3b27973dad2ebab601550a585180eec1ad9`                                                                          |
| release source        | `release-sources/4.0.0-rc.5/app`                                                                                                                                                                |
| source identity       | `sha256:a6c4be01405af1b3070f6d02dc584a55bd2b45844ae48761aa3d4141ef474ca4`                                                                                                                       |
| Schema SHA-256        | `0d6bc7f58f849560f3e9125a660a2b5efc5d91f34d533963b9777d6f467ac136`                                                                                                                              |
| GitHub prerelease     | [`v4.0.0-rc.5`](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.5)                                                                                                |
| npm                   | [`4.0.0-rc.5`](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.5)、dist-tag `next`                                                                                       |
| Pages                 | [download一覧](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/)                                                                                                                |

作者向けSchemaリファレンスもtag commit `f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6`と同じSchema SHA-256を固定します。

### rc.4からの変更

- manifestに定義された全23 core actionを`kubohiroyakamishibai4`の可視TurboWarp blockとして公開
- TurboWarp blockをYAML台本と同じregistry、Schema正規化、ActionContext、lifecycleへ接続
- core Runtimeと6つの外部機能拡張、合計7 memberに見出しと文書ボタンを表示
- Bubble 0.7.0で実測幅の折り返し、native reveal、音声、表示animationを利用可能にした
- TMPose 1.10.0で`poseRecognition.modelInitialization`の`legacy`／`latest-needed`、並列初期化、
  AbortSignalによる中断を追加した。既定値は`legacy`／`parallel: false`
- PoseNet model dataをruntime JavaScriptのBase64からproject model dataへ移した
- playback runtimeをauthoring runtimeから分離し、SB3を7,866,652 bytesから6,664,571 bytesへ縮小した

### exact dependency pin

| package                                    | version |
| ------------------------------------------ | ------- |
| `@kubohiroya/turbowarp-asset-manager`      | 0.11.0  |
| `@kubohiroya/turbowarp-async-input`        | 0.4.0   |
| `@kubohiroya/turbowarp-bubble`             | 0.7.0   |
| `@kubohiroya/turbowarp-runtime-expression` | 0.4.0   |
| `@kubohiroya/turbowarp-svg-text`           | 0.5.0   |
| `@kubohiroya/turbowarp-tmpose`             | 1.10.0  |

### 公開成果物

| 成果物                                                                                                     | byte      | 完全性情報                                                                 |
| ---------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| [Standard SB3](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/kamishibai-4.0.0-rc.5.sb3)  | 6,664,571 | SHA-256 `2494b43f43f7b7acbd1ce9d307fcff383d239931aa46de550f76c3eb3ec40f3c` |
| [npm tarball](https://registry.npmjs.org/@kubohiroya/tmpose-kamishibai/-/tmpose-kamishibai-4.0.0-rc.5.tgz) | 6,425,111 | SHA-256 `f7e9075a0a4445367aa38b2a9a2b71a5a22ff471e7d3795c9a9b1430685c7b23` |

npm registry integrityは
`sha512-RF4kHhE2e1EzKu5eYwMdV4//8uVj8OflafQ5R1GlRVmQz2ONcdVZfeY6fvB9EC/VO7irL7deH1h9Cqo08jWj7A==`です。
PagesとGitHub Releaseから取得したSB3は同じbyte数とSHA-256でした。

### 検証

candidateの`pnpm verify:full`はNode test 1,224件とChromium test 63件を通過しました。記録は
[GitHub Actions](https://github.com/kubohiroya/turbowarp-kamishibai-app/actions/runs/31823718461/job/94842799234)で確認できます。

rc.3で行った実カメラ・実ポーズ確認は、TMPose、PoseNet model data、モデル初期化経路が変わったrc.5の
合格証跡には流用しません。rc.5の自動検証と公開照合は合格、物理camera／poseの再確認は未完了として
[release smoke](../developer-guides/release-smoke-4.0.md)へ記録します。

### 制約とrollback

- DSL document versionは引き続き`kamishibai: "4.0"`
- Structured Data Standalone／DebugとAction Contextは既定OFF
- rc.4以前のversion付きSB3とrelease sourceを差し替えない
- 問題時はnpm `next`を`4.0.0-rc.4`へ戻し、GitHub prereleaseとPagesへ注意事項を追加する
- rc.5のbyte列を上書きせず、修正版は`4.0.0-rc.6`として公開する

## 次のversionを追記する

既存項目のchecksumや制約を上書きせず、新しい履歴項目を先頭へ追加します。

1. tag、release commit、公開日時、GitHub Release、npm、Pagesを確認する
2. release source、source identity、Schema SHA-256、feature flag snapshotを固定する
3. SB3とnpm tarballを独立に取得し、byte数、checksum、registry integrityを照合する
4. 自動検証と、変更範囲に応じた実ブラウザ／camera／pose証跡を記録する
5. 安定版、公開プレリリース、公開サンプル基準を区別する
6. rollback先と、公開済み成果物を上書きしない修正版versionを記録する

上流での確認例です。

```bash
git show --no-patch v4.0.0-rc.7
gh release view v4.0.0-rc.7 --repo kubohiroya/turbowarp-kamishibai-app
npm view @kubohiroya/tmpose-kamishibai@4.0.0-rc.7 version dist.integrity
shasum -a 256 kamishibai-4.0.0-rc.7.sb3
```

# DSL 4.0 文書・公開状態の表記基準

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

DSL 4.0の実装、プレリリース、安定版、公開サンプル、文書の状態を混同しないため、次の語を使います。

| 状態             | 意味                                                             |
| ---------------- | ---------------------------------------------------------------- |
| 実装基準         | 固定commitとSchemaで実装内容を調査・検証した基準                 |
| 公開プレリリース | npm `next`、GitHub prerelease、Pages成果物として公開された候補版 |
| 安定版           | npm `latest`と通常のダウンロード導線で推奨する版                 |
| 公開サンプル基準 | サンプル作品、スターター、Web版を生成したruntimeの版             |
| 文書状態         | どの実装、配布物、公開画面を説明する資料かの区別                 |

## 2026年8月26日の確認結果

- DSL 4.0文書の現在の実装基準はannotated tag `v4.0.0-rc.10`のcommit
  [`65f5e705921b6c92ba6ec5373ec13eff5101f2c6`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/65f5e705921b6c92ba6ec5373ec13eff5101f2c6)
- `v4.0.0-rc.10`はnpmの`next`、GitHub prerelease、PagesのStandard SB3として公開済み
- rc.10のStandard SB3は`kamishibai-4.0.0-rc.10.sb3`、6,787,273 bytes、SHA-256
  `a8620868f5da118c142cf2a11db6679ce7fab8b8ef84f5e6cce26887d61e94ec`
- 安定版の推奨は`v3.2.3`で、正式版`v4.0.0`は未公開
- 公開中の4.0サンプル作品、スターター、Web版はrc.10から再生成した成果物
- rc.10の作者経路とサンプル再生経路を、本文とmachine-readable manifestで同じruntime基準へ固定する

確認元:
[v4.0.0-rc.10 GitHub prerelease](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.10)、
[npm 4.0.0-rc.10](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.10)、
[Pages downloads](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/)

## rc.10で文書へ反映する差分

- トップレベルの`bubbleClosePolicies`で、吹き出しを閉じる条件を名前付きで再利用可能にした
- `Actor.say`／`Actor.think`の`closePolicy`から、秒数、入力待ち、または両者のraceを一つ選んで参照する
- action内の`seconds`／`waitFor`は後方互換として維持し、`closePolicy`との同時指定をエラーにする
- Bubbleを0.10.0へexact pinし、Scratch互換の組み込み`say`／`think` styleとclose-policy blockを利用する
- 公開サンプルのSB3、Web版、lockをrc.10 freeze commitから再生成した

## 公開画面に基づく文書

- [紙芝居アプリ 4.0 操作説明書](docs/user-guides/user-guide-4.0.md)は公開画面を説明する
- [紙芝居を遊ぶ](docs/tutorials/play.md)は公開サンプル成果物rc.10を対象にする
- [紙芝居DSL 4.0 台本作成ガイド](docs/dsl-author-guides/dsl-4.0-author-guide.md)はrc.10 Standard SB3の
  `bubbleClosePolicies`、`closePolicy`、既存のinline指定との使い分けを説明する
- 公開URL、版、checksumなどの追跡情報は
  [`sources/dsl4/user-guide-4.0-public-surfaces.json`](sources/dsl4/user-guide-4.0-public-surfaces.json)へ固定する

## リリース記録

- [紙芝居DSL 4.0 リリース履歴](docs/dsl-author-guides/dsl-4.0-history.md)はrc.10のtag、公開URL、成果物、
  dependencyとrollbackを記録する
- [DSL 4.0 release smoke](docs/developer-guides/release-smoke-4.0.md)はrc.10の自動検証と公開照合を記録する
- rc.10のclose-policy契約とBubble 0.10.0 pinに加え、camera contextとoverlay cleanupの継続確認を記録する

## 安定版4.0.0の公開時に更新する情報

- annotated `v4.0.0` tagとrelease commit
- GitHub Release URL、公開日、release asset URL／size／SHA-256／provenance
- npm 4.0.0のregistry URLとintegrity
- production Pagesのversionとartifact checksum
- 4.0.0で再生成したサンプル、スターター、Web版のruntime基準

未公開のtag、release asset、npm情報を公開済みとして本文へ固定しません。rc.8以前の公開記録と、将来の
安定版4.0.0の状態は別の履歴項目として管理します。

## 更新手順

1. GitHub Release、npm registry、Pages成果物を一次情報で確認する
2. 実装基準、公開プレリリース、安定版、公開サンプル基準を別々に記録する
3. 各文書、machine-readable manifest、テストを同じ変更で更新する
4. 4.0トップと文書メタデータを更新し、build後の公開表示を確認する
5. 問題があれば未確認の公開情報を削除し、確認済みのversion、commit、checksumへ戻す

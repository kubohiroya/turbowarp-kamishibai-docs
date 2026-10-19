# DSL 4.0ランタイム変数ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書基準: 公開プレリリース`4.0.0-rc.23`、commit `2f2889fe`、2026年10月19日。正式版4.0.0は未公開です。

台本変数は作品が宣言して書き換える値、公開ランタイム状態はランタイムが所有する読取専用の値です。
両者を同じ変数として扱わないでください。TurboWarpの正確なopcodeは
[連携リファレンス](../turbowarp-programmer-guides/dsl-4.0-runtime-variable-turbowarp-reference.md)を参照してください。

## 3種類の変数を区別する

| 種類               | 例                                | 書換え                         |
| ------------------ | --------------------------------- | ------------------------------ |
| 台本変数           | `variables`で宣言するscore、ready | 同じ型のcore action            |
| 公開ランタイム状態 | status、scene.id、pose.phase      | 読取専用                       |
| 互換Stage変数      | ポーズ認識、チャージ              | ランタイムが更新する0〜100の値 |

## 台本変数を宣言する

```yaml
variables:
  score: 0
  ready: false
  救助回数: 0
```

値はstring、有限number、booleanです。実行中に宣言時の型を変更しません。
分岐式ではASCIIの名前をそのまま、日本語等の名前を`vars["完全な名前"]`で参照します。

## 台本とTurboWarpから書き換える

```yaml
scenes:
  opening:
    - setVariable: {name: score, value: 10}
    - changeVariable: {name: score, by: 1}
    - toggleVariable: ready
```

`setVariable`は同じ型のリテラルを代入し、`changeVariable`はnumberへ有限数を加算し、
`toggleVariable`はbooleanを反転します。未宣言変数、型不一致、非有限の値は拒否します。
TurboWarpの同名core actionも同じ契約です。別の書込queueや書込専用feature flagを前提にしません。

## 公開ランタイム状態を分岐式で使う

`runtime["KEY"]`は読取専用です。たとえば現在のシーンは`runtime["scene.id"]`、ポーズの段階は
`runtime["pose.phase"]`で読みます。未知キー、計算したキー、関数呼出し、一般のプロパティ参照は受理しません。

```yaml
branches:
  result:
    - if: 'score >= 10 && runtime["pose.phase"] == "completed"'
      goto: success
    - else: retry
```

一回のbranch評価では台本変数とランタイム状態のsnapshotを共有し、評価途中に条件を変えません。
診断codeとstory pathはTurboWarpの専用reporterから確認できます。生の例外や内部handleは公開しません。

## 有効化と現行版との関係

汎用defaultはすべてOFFですが、rc.23のStandard productionでは`dsl4TurboWarpStateSurface`と
`dsl4ExpressionRuntimeState`がONです。書換えはcore actionであり、`dsl4TurboWarpStoryVariableWrite`は使いません。
カスタムhostは起動時snapshotを固定し、必要なsurfaceを明示します。

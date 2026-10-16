# DSL 4.0ランタイム変数ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: 変数と条件分岐を使うDSL 4.0紙芝居制作者\
現行公開仕様の基準: TurboWarp-Kamishibai 4.0.0-rc.8（`29c0dea`）、2026年8月20日

文書状態: **受け入れ済み・実装済み利用契約（既定OFF）**。[実装Issue #597](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/597)で
ソース実装とテストを追加しています。追加機能は機能フラグが既定OFFのため、4.0.0-rc.8の現行の公開APIには含まれません。

この文書は「台本を作る人向けドキュメント」に属し、台本変数の宣言、分岐式での参照、TurboWarpからの書込が
台本へ反映される時期を説明します。公開ブロックの正確な名前、戻り値、書込条件、機能フラグは、
[DSL 4.0ランタイム変数 TurboWarp連携リファレンス](../turbowarp-programmer-guides/dsl-4.0-runtime-variable-turbowarp-reference.md)を参照してください。

## 3種類の変数を区別する

DSL 4.0の作品で目にする変数には、役割の異なる3種類があります。

| 種類            | 例                            | 台本の分岐式                      | TurboWarp                     |
| --------------- | ----------------------------- | --------------------------------- | ----------------------------- |
| 台本変数        | `variables:`で宣言した`score` | `score`または`vars["名前"]`で参照 | 専用ブロックで読取・条件付き書込 |
| 公開ランタイム状態 | 現在のシーン、ポーズの段階         | `runtime["KEY"]`で読取            | 専用reporterで読取            |
| 互換Stage変数   | `ポーズ認識`、`チャージ`      | 自動では参照できない              | 通常の変数ブロックで参照         |

台本変数は作品が所有する値です。公開ランタイム状態は紙芝居ランタイムが所有する読取専用の値です。`ポーズ認識`と
`チャージ`はTurboWarpの変数モニターとの互換性のために残す値であり、台本変数や`runtime[...]`とは別の窓口です。

## 台本変数を宣言する

作品で増減・切替をしたい状態は、台本のトップレベル`variables:`へ初期値とともに宣言します。

```yaml
kamishibai: '4.0'

variables:
  score: 0
  ready: false
  message: ''
  救助回数: 0
```

値に使える型はstring、有限number、booleanです。型は初期値によって決まり、実行中も変わりません。

ASCIIの識別子として書ける名前は、分岐式でそのまま参照できます。日本語、空白、記号を含む名前は
`vars["完全な名前"]`で参照します。

```yaml
branches:
  result:
    - if: 'score >= 10 && ready == true'
      goto: success
    - if: 'vars["救助回数"] >= 2'
      goto: rescued
    - else: retry
```

## 公開ランタイム状態を分岐式で使う

シーン遷移を決める`branch[].if`では、台本変数に加えて、読取専用の`runtime["KEY"]`でランタイム状態を参照できます。
同じ状態はTurboWarpの公開reporterからも、同じ型と寿命で参照します。

| 式で使う名前                 | 意味                                            | 型     |
| ---------------------------- | ----------------------------------------------- | ------ |
| `runtime["status"]`          | 物語の実行状態                                  | string |
| `runtime["scene.id"]`        | 現在のシーンID                                  | string |
| `runtime["action.number"]`   | 現在のアクション番号（1始まり、非実行時は`0`）      | number |
| `runtime["action.path"]`     | 現在のアクションの安定パス                          | string |
| `runtime["pose.phase"]`      | `inactive/waiting/charging/completed/cancelled` | string |
| `runtime["pose.target"]`     | ポーズ対象のアクターID                              | string |
| `runtime["pose.name"]`       | 認識対象のポーズ名                                | string |
| `runtime["pose.stepNumber"]` | ポーズのステップ番号（1始まり、非実行時は`0`）        | number |
| `runtime["version"]`         | DSL 4.0ランタイムの版                        | string |

たとえば、TurboWarp側で加算した`score`と、直前のポーズ結果を組み合わせてシーンを選べます。

```yaml
branches:
  result:
    - if: 'score >= 10 && runtime["pose.phase"] == "completed"'
      goto: success
    - else: retry
```

未知のキー、計算したキー、プロパティ参照、関数呼出しは使えません。未知のキーは
`K4-EXPRESSION-RUNTIME-UNKNOWN`として安全停止し、意図しない条件で遷移しません。

## TurboWarpから台本変数を書き換える

TurboWarpでは、宣言済みの台本変数だけを専用ブロックから書き換えられます。書込ブロックにはstring、number、booleanの型を
指定し、その型が`variables:`の初期値の型と一致する必要があります。未宣言の変数、型の異なる値、有限でないnumberは
受け付けません。

書込はブロックを実行した瞬間に分岐結果を変えません。現在のアクションに紐付けて予約し、そのアクションが正常に終わった境界で
確定します。次の`branch`は確定した値を参照します。アクションが中断または失敗した場合、物語が停止した場合、または実行世代が
変わった場合、予約した書込は破棄されます。

<figure class="concept-flow"><figcaption>TurboWarpからの書込が台本変数へ反映されるまで</figcaption><div class="concept-flow__track"><span>TurboWarpが書込を予約</span><b aria-hidden="true">→</b><span>現在のactionが正常終了</span><b aria-hidden="true">→</b><span>action境界で台本変数へ反映</span><b aria-hidden="true">→</b><span>次のbranchが新しい値を参照</span></div><p class="concept-flow__note"><strong>反映されない場合:</strong> actionが正常に終わらなかった場合、予約した書込は台本変数へ入らずに破棄されます。</p></figure>

| 予約した後に起きたこと                   | 予約した書込                                | 次の`branch`が参照する値                                     |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| 現在のactionが正常に終了した             | action境界で反映する                        | 書込後の値                                                   |
| 現在のactionが中断された、または失敗した | 破棄する                                    | 書込前の値                                                   |
| 物語が停止した                           | 破棄する                                    | —                                                            |
| 再読み込み等で実行世代が変わった         | 破棄する                                    | 新しい世代の値                                               |
| `branch`の評価中に書込が届いた           | 次のaction境界で反映する                    | 評価中の`branch`は書込前の値、その次の`branch`から書込後の値 |
| 同じ境界で同じ変数へ複数の書込があった   | TurboWarpが受け付けた順で最後の値を反映する | 最後の書込の値                                               |

この順序により、同じbranch選択の途中で条件が変わることはありません。一回のbranch選択では、台本変数と公開ランタイム状態を
一つのスナップショットへ固定し、すべての規則で共有します。

## 使い分け

3種類の変数と2種類の書き換え口をどう選ぶかは、その値を誰が決めるのかで判断します。

- 得点、フラグ、選択結果など、作品が変更する値は`variables:`へ宣言します。
- 現在のシーンやポーズの完了状態など、ランタイムが決める値は`runtime["KEY"]`で読みます。
- TurboWarpの見た目や処理から台本変数を変える場合は、専用の型付き書込ブロックを使います。
- ポーズの百分率をモニターへ表示する既存作品では、Stage変数`ポーズ認識`と`チャージ`を引き続き使えます。

## 公開しない状態

分岐の条件は、作品の見た目や環境が変わっても同じ結果になる必要があります。そのため、実装の内部状態や環境に依存する値は、意図的に公開していません。

実行世代、イベント記録、生の例外メッセージ、履歴の配列、カメラの物理device ID、キャッシュ、binary backing、DOM handleなどは、
作品の安定した条件にはできないため公開しません。診断では安全なエラーコードとstory pathだけをTurboWarpのreporterから
参照できますが、失敗後は次のbranchを実行しないため`runtime[...]`には含めません。

## 有効化と現行版との関係

追加する窓口は次の機能フラグで段階導入します。

- `dsl4TurboWarpStateSurface`: TurboWarpの読取ブロック。既定OFF。
- `dsl4TurboWarpStoryVariableWrite`: TurboWarpの書込ブロック。既定OFF。
- `dsl4ExpressionRuntimeState`: 分岐式の`runtime["KEY"]`。既定OFF。

機能フラグがOFFの配布物では、追加ブロックをブロックパレットに表示せず、`runtime["KEY"]`も受理しません。既存の125個のブロック、Stage変数
`ポーズ認識`と`チャージ`、従来の台本変数による分岐には変更がありません。有効化された配布物を確認してから本機能を使ってください。

## 関連文書

- [DSL 4.0ランタイム変数 TurboWarp連携リファレンス](../turbowarp-programmer-guides/dsl-4.0-runtime-variable-turbowarp-reference.md): 公開ブロック、スナップショット、型付き書込、非公開境界
- [DSL 4.0ランタイム ブロックリファレンス](../turbowarp-programmer-guides/dsl-4.0-runtime-block-reference.md): 4.0.0-rc.8で現在公開されているブロックとStage変数
- [紙芝居DSL 4.0 台本作成ガイド](dsl-4.0-author-guide.md): `variables:`と`branch`を含む台本作成全体

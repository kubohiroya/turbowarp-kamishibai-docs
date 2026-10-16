# DSL 4.0ランタイム変数 TurboWarp連携リファレンス

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: DSL 4.0のランタイム変数をTurboWarp blockから利用する方\
現行公開仕様の基準: TurboWarp-Kamishibai 4.0.0-rc.8（`29c0dea`）、2026年8月20日

文書状態: **受け入れ済み・実装済み利用契約（既定OFF）**。[実装Issue #597](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/597)で
source実装とtestを追加しています。3つのfeature flagは既定OFFのため、追加surfaceは4.0.0-rc.8の現行公開APIには含まれません。\
現行仕様: [DSL 4.0ランタイム ブロックリファレンス](dsl-4.0-runtime-block-reference.md)

この文書は「TurboWarpでプログラムを書く人向けドキュメント」に属し、公開block、型付き書込、snapshotの確定時期、
feature flag、非公開境界を規定します。紙芝居の台本で`variables:`や分岐式を使う方法は、
[DSL 4.0ランタイム変数ガイド](../dsl-author-guides/dsl-4.0-runtime-variable-guide.md)を参照してください。

## 結論

現行のStage変数`ポーズ認識`と`チャージ`は、ポーズfeedbackをTurboWarpの変数monitorへ投影する互換surfaceとして
維持します。一方、次に公開する状態を通常のStage変数として追加することは推奨しません。ランタイムが所有する値を
誰でも改名・削除・書換えできる形にすると、名前衝突、型変換、再実行時の古い値、実行制御との競合が生じるためです。

代わりに、`Kamishibai DSL 4.0 Runtime`機能拡張の専用reporter／Boolean blockを使います。公開の優先順位は次のとおりです。

1. 台本で宣言した`variables:`の読取
2. 同じ公開状態をTurboWarp reporterとDSLの分岐式から参照する共通snapshot
3. 物語の実行状態、現在scene、現在action
4. 安全な診断codeとstory path
5. 既存2変数だけでは判別できないポーズのphase、対象、名前、step
6. ランタイムversion

台本変数の書換えは読取とは別のfeature flagで有効にします。生の例外message、実行世代、trace、
live reload、履歴配列、camera／cache／binary backingなどの実装状態は、物語のプログラムAPIには公開しません。

## 現在の公開状態

4.0.0-rc.8でTurboWarpの通常の変数blockから参照できるランタイム所有のStage変数は、次の2つだけです。

| Stage変数    | 内部の元データ           | 公開値 |
| ------------ | ------------------------ | ------ |
| `ポーズ認識` | pose eventの`confidence` | 0〜100 |
| `チャージ`   | pose eventの`progress`   | 0〜100 |

詳しい更新時期、feedback mode別の書換え可否、初期化条件は
[現行リファレンス](dsl-4.0-runtime-block-reference.md#現状turbowarpブロックから参照できる公開変数2変数)を参照してください。
台本トップレベルの`variables:`はこの2変数とは別で、rc.8にはTurboWarpから直接参照する公開blockがありません。

## 固定実装から棚卸しした内部状態

ここでいう内部状態は、TurboWarp側の作品ロジックに意味を持ち得る値です。`AbortController`、Promise、listener、lock、
DOM handleのような実行機構まで「公開変数」として数えるものではありません。

### Runtime controller

controllerのsnapshotには、次の状態があります。

| 内部field     | 型・値                                        | 用途                                   | 判定                     |
| ------------- | --------------------------------------------- | -------------------------------------- | ------------------------ |
| `variables`   | `Record<string, string \| number \| boolean>` | 台本が宣言した物語状態                 | 公開推奨（読取）         |
| `status`      | `idle/running/paused/failed/finished/stopped` | 物語executorの状態                     | 公開推奨                 |
| `sceneId`     | stringまたは`null`                            | 現在scene                              | 公開推奨                 |
| `actionIndex` | 0始まりの整数。非実行時は`-1`                 | scene内の現在位置                      | 表示用に変換して公開推奨 |
| `actionPath`  | actionの安定IDまたは`null`                    | 現在actionの参照                       | 公開推奨                 |
| `diagnostic`  | 構造化診断または`null`                        | 失敗code、位置、messageなど            | 安全部分だけ公開推奨     |
| `generation`  | 非負整数                                      | 中断後の古い非同期処理を無効化する世代 | 非公開                   |

snapshot外にもeventの`sequence`、内部`runId`、event `trace`、quiesce要求、各種cancel／skip lockがあります。
これらは実行の整合性を保つための値であり、TurboWarp作品が依存するとlive reloadやschedulerの変更を妨げるため非公開とします。

### Pose feedback

ポーズ状態eventは`phase`、`target`、`pose`、`stepIndex`、`confidence`、`progress`を持ちます。現在公開されているのは
後ろ2つを百分率にした値だけです。

| 内部field    | 型・値                                 | 判定                       |
| ------------ | -------------------------------------- | -------------------------- |
| `phase`      | `waiting/charging/completed/cancelled` | 公開推奨                   |
| `target`     | actor ID                               | 公開推奨                   |
| `pose`       | 認識対象のpose名                       | 公開推奨                   |
| `stepIndex`  | 0始まりの非負整数                      | 表示用に変換して公開推奨   |
| `confidence` | 0〜1                                   | 既存`ポーズ認識`で公開済み |
| `progress`   | 0〜1                                   | 既存`チャージ`で公開済み   |

### Navigation、application shell、診断surface

| 内部状態                              | 現在の内容                                                 | 判定                                       |
| ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| navigation mode／移動可否             | live/historyと現在cursorから導出できる状態                 | `前へ戻れる?`などのBooleanだけ条件付き公開 |
| history entries／scene visits／cursor | action、sceneの履歴配列と位置                              | 配列そのものは非公開                       |
| application status                    | `ready/title/menu/starting/running/building/error/stopped` | 物語`status`と別名にして条件付き公開       |
| extension version                     | rc.8に非表示reporterが存在                                 | 公開推奨                                   |
| last error                            | rc.8に生のmessageを返す非表示reporterが存在                | 生messageは非公開                          |
| runtime diagnostics                   | shell、runtime、resource、backingを含むJSON                | 開発診断専用。通常paletteには非公開        |
| binary backing／resource状態          | session backing、cache、登録model数など                    | 作品APIには非公開                          |

rc.8の非表示`statusReporter`はapplication shellの状態を返し、controllerの物語`status`とは意味が異なります。
既存reporterをそのまま表示すると同じ「runtime status」に2種類の意味が混在するため、公開時は名前とopcodeを分けます。

## 公開読取block

すべてreporterの呼出時点で、controllerが確定済みのsnapshotから値を返します。Stage変数やmonitorは自動作成しません。
block、型、値がない場合の戻り値を次のように固定します。

| 優先度 | block文                              | 戻り値                                                     | 値がない場合       |
| ------ | ------------------------------------ | ---------------------------------------------------------- | ------------------ |
| P0     | `story variable [NAME]`              | 宣言時と同じstring／number／boolean                        | 空文字             |
| P0     | `story variable [NAME] exists?`      | Boolean                                                    | `false`            |
| P0     | `story variable [NAME] type`         | `string/number/boolean/unknown`                            | `unknown`          |
| P0     | `story status`                       | `idle/running/paused/failed/finished/stopped`              | 常にいずれかを返す |
| P0     | `current scene id`                   | string                                                     | 空文字             |
| P0     | `current action number`              | 1始まりの整数                                              | `0`                |
| P0     | `current action path`                | actionの安定ID                                             | 空文字             |
| P0     | `last runtime error code`            | `K4-...`形式のstring                                       | 空文字             |
| P0     | `last runtime error story path`      | string                                                     | 空文字             |
| P0     | `pose phase`                         | `inactive/waiting/charging/completed/cancelled`            | `inactive`         |
| P0     | `pose target`                        | actor ID                                                   | 空文字             |
| P0     | `pose name`                          | string                                                     | 空文字             |
| P0     | `pose step number`                   | 1始まりの整数                                              | `0`                |
| P0     | `Kamishibai DSL 4.0 runtime version` | semantic version                                           | 空文字             |
| P2     | `can navigate to previous action?`   | Boolean                                                    | `false`            |
| P2     | `can navigate to next action?`       | Boolean                                                    | `false`            |
| P2     | `application status`                 | `ready/title/menu/starting/running/building/error/stopped` | `ready`            |

`story variable [NAME]`だけでは、未宣言と「宣言済みの空文字」を区別できません。分岐がその違いを必要とする場合は、
必ず`story variable [NAME] exists?`を併用します。値はScratchの文字列へ一律変換せず、元のprimitive型を保ちます。

`current action number`と`pose step number`は、TurboWarp利用者向けには1始まりで返します。内部の0始まりindexをそのまま
必要とする診断には、それぞれ安定IDの`current action path`と構造化診断を使います。

### 値の寿命

- 新しいstoryを開始すると、物語変数はそのstoryの宣言値または明示した開始値へ初期化します。
- scene／actionは実行位置がないとき空文字／`0`へ戻し、前回のstoryの値を残しません。
- ポーズの`completed/cancelled`と対象／名前／stepは、次のpose actionまたは新しいstory startまで保持します。1 tickだけの値にはせず、
  TurboWarp scriptが確実に観測できるようにします。
- 最終診断は同じstory runの間だけ保持し、新しいstartで空にします。stopだけでは検証用に保持します。
- dispose後はstatusを`stopped`、その他を「値がない場合」の値へ戻します。

| 値                                              | 設定・初期化される時点                          | 保持する期間                                       | dispose後            |
| ----------------------------------------------- | ----------------------------------------------- | -------------------------------------------------- | -------------------- |
| 物語変数                                        | 新しいstoryの開始時に宣言値または明示した開始値 | 書込がcommitされるまで同じ値                       | 「値がない場合」の値 |
| scene、action                                   | 実行位置が変わるたび                            | 実行位置がある間。なくなると空文字／`0`            | 「値がない場合」の値 |
| ポーズの`completed/cancelled`、対象、名前、step | pose actionの終了時                             | 次のpose actionまたは新しいstory startまで         | 「値がない場合」の値 |
| 最終診断                                        | runtimeの失敗時                                 | 同じstory runの間。stopでは保持し、新しいstartで空 | 「値がない場合」の値 |
| status                                          | 状態が変わるたび                                | 常に現在の状態                                     | `stopped`            |

## 分岐式も同じ公開snapshotを参照する

公開状態はTurboWarp blockだけの便宜機能ではありません。値を評価してsceneを選ぶ`branch[].if`も、同じ値を
同じ型と寿命で参照できる必要があります。block reporterと式評価器が別々のcopyやlive値を読む設計にはしません。

### rc.8で式から参照できる現在の値

4.0.0-rc.8のcontrollerは、`branch` actionを開始したときのトップレベル`variables:`を不変snapshotにして
Runtime Expressionへ渡します。ASCIIのbare nameとして書ける名前は`score >= 10`のように参照し、それ以外の名前は
`vars["救助回数"] >= 2`のように完全一致で参照できます。

現在の式環境に自動では入らないものは次のとおりです。

- Stage変数`ポーズ認識`と`チャージ`
- TurboWarpのStage／sprite変数
- Temporary Variablesが所有するruntime variable
- controllerの`status`、scene、action、diagnostic、pose eventなどのシステム状態

したがって、rc.8では「台本`variables:`は式で参照できるが、TurboWarp blockからは直接参照できない」という非対称が
あります。公開読取／書込blockはこの台本変数と同じcontroller snapshotへ接続します。

### 予約済み`runtime[...]`namespace

システム状態は台本変数へ平坦に混ぜません。Runtime Expressionでは、string literalだけを受理する読取専用の
`runtime["KEY"]`構文を使います。一般のproperty access、計算したkey、object traversal、関数呼出しは許可しません。

| 式で使う名前                 | 同じ値を返す公開surface              | 型     |
| ---------------------------- | ------------------------------------ | ------ |
| `runtime["status"]`          | `story status`                       | string |
| `runtime["scene.id"]`        | `current scene id`                   | string |
| `runtime["action.number"]`   | `current action number`              | number |
| `runtime["action.path"]`     | `current action path`                | string |
| `runtime["pose.phase"]`      | `pose phase`                         | string |
| `runtime["pose.target"]`     | `pose target`                        | string |
| `runtime["pose.name"]`       | `pose name`                          | string |
| `runtime["pose.stepNumber"]` | `pose step number`                   | number |
| `runtime["version"]`         | `Kamishibai DSL 4.0 runtime version` | string |

例として、TurboWarp側で型付き書込を受け付けた`score`と、直前のポーズ結果を同時に使えます。

```yaml
branches:
  result:
    - if: 'score >= 10 && runtime["pose.phase"] == "completed"'
      goto: success
    - else: retry
```

`last runtime error code`と`last runtime error story path`は、runtimeが`failed`になった後の診断用reporterです。
失敗後は次のbranch式を実行しないため、式namespaceには入れません。条件付き公開のapplication statusやhistory移動可否も、
式評価時の意味と決定性が定まるまでは追加しません。

### snapshotと評価順

一回のbranch選択では、最初のruleを評価する前に次の値を一つの不変snapshotへ固定し、`else`を含む全ruleで共有します。

<figure class="concept-flow"><figcaption>branch選択で参照する値が決まるまで</figcaption><div class="concept-flow__track"><span>直前のactionが正常終了</span><b aria-hidden="true">→</b><span>action境界で書込と公開状態を確定</span><b aria-hidden="true">→</b><span><code>branch</code>開始時に一つのsnapshotへ固定</span><b aria-hidden="true">→</b><span><code>else</code>を含む全ruleを上から評価</span><b aria-hidden="true">→</b><span>移動先のsceneを決定</span></div><p class="concept-flow__note"><strong>評価中に届いた書込:</strong> 現在の選択結果を変えず、次のaction境界で確定してから次の<code>branch</code>で参照されます。</p></figure>

1. 直前のaction境界までにcommitした台本`variables:`
2. 同じ境界で確定した公開runtime状態
3. 次のpose actionまたはstory startまで保持している直前のpose終端状態

ruleごとにStage変数やTemporary Variablesを読み直してはいけません。TurboWarp scriptからの台本変数書込は、前節の
型付きqueueがaction境界でcommitされた場合にだけ次のbranch snapshotへ入ります。branch評価中に到着した書込は、
現在の選択結果を変えず、次のaction境界以降から見えるようにします。

未知の`runtime` keyはstable code `K4-EXPRESSION-RUNTIME-UNKNOWN`で式評価を安全停止します。namespaceに渡せる値は
string、finite number、booleanだけとし、`null`、object、array、例外、handleは渡しません。

## 台本変数を書き換える型付きblock

台本変数はbranch条件に使われるため、TurboWarpからの書換え自体には明確な利用価値があります。ただし、Scratch VMの
暗黙の文字列／数値変換をそのままcontrollerへ渡すと型保証が壊れます。読取surfaceとは別のfeature flagで、次の
型指定blockを使います。

| block文                                          | 契約                                                          |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `set story variable [NAME] to [VALUE] as [TYPE]` | `TYPE`は`string/number/boolean`。宣言済み型との完全一致が必須 |
| `change number story variable [NAME] by [DELTA]` | number変数だけを原子的に加算                                  |
| `last story variable write accepted?`            | 呼出scriptにおける直前の書込受付結果                          |

書込は呼出中にcontrollerのobjectを直接変更せず、現在の実行`generation`へ紐付けたqueueへ積みます。
`broadcastMessageAndWait`の受信scriptがすべて終了した次のaction境界でcommitし、その後のbranchから新しい値を見せます。
actionがcancel／failされた場合やgenerationが変わった場合は破棄します。同じ境界で同じ変数へ複数の書込がある場合は、
TurboWarp schedulerが受付けた順の最後を採用します。加算blockはcommit時に一つずつ適用し、read-modify-write競合を避けます。

次の場合は受付を拒否し、値を変更しません。

- 未宣言の名前、または宣言済み型と`TYPE`が異なる
- numberに`NaN`、`Infinity`、有限でない値を指定した
- booleanに`true/false`以外を指定した
- story未実行、runtime停止後、cancel済みaction、古いgenerationから呼んだ

エラーmessageではなく、`last story variable write error code`を将来追加する場合は、名前・型不一致・状態不一致を安定codeで
区別します。書込を許可しない配布物ではblock自体をpaletteに表示しません。

## 公開しない状態

次の値は、ランタイム内部の観測やデバッグには必要でも、TurboWarp作品の安定APIにはしません。

- `generation`、event `sequence`、`runId`、event trace
- AbortSignal、quiesce token／candidate／revision、reloadの途中状態、skip／cancel lock
- navigationの生history配列、keymap、canonical keymap、cursor、内部visit ID
- session binary backing、cache key、Object URL、source locator、resource所有権や登録数
- cameraの物理device ID、DOM handle、listener、model／previewの内部object
- 生の例外message、stack、任意の`details`、runtime diagnostics JSON
- action envelopeやcustom action引数をStageの大域変数へ複製したもの

custom actionの名前・対象・引数・完了／失敗は、action実行中だけ有効な既存実装のfeature-gated Action Context block surfaceで
扱うべきです。
生の診断messageには上流例外や環境固有情報が入り得るため、redaction契約ができるまではcodeとstory pathだけを公開します。

## 段階導入とロールバック

### Feature flag

- `dsl4TurboWarpStateSurface`: 読取reporter／Boolean block。既定OFF。
- `dsl4TurboWarpStoryVariableWrite`: 台本変数の書込block。既定OFFで、上の読取flagへ依存。
- `dsl4ExpressionRuntimeState`: `runtime["KEY"]`式namespace。既定OFFで、読取flagへ依存。

### 実装と有効化の単位

1. controller／pose eventから不変snapshotを作るadapterとunit testを実装しています。
2. 読取blockを`dsl4TurboWarpStateSurface`の内側に実装し、未実行値と再start／disposeをtestしています。
3. host／preview／live reloadの委譲を実装し、cancel、stop、式評価、世代切替を検証しています。
4. 同じsnapshot resolverを使う式namespaceを`dsl4ExpressionRuntimeState`の内側に実装しています。
5. 書込queueと型検証を`dsl4TurboWarpStoryVariableWrite`の内側に実装しています。
6. `broadcastMessageAndWait`とのcommit順、複数書込、branch snapshot、cancel／generation変更を回帰testしています。
7. Standard配布物で各flagをONにする判断は、release noteと公開fixtureを揃えた別の変更として行います。

問題が見つかった場合は起動時固定の該当flagをOFFにします。既定OFFの間は、現行の125 blockと2つのStage変数に
変更がありません。実装差分をrevertせず従来surfaceへ戻せ、書込だけをOFFにして読取を残すこともできます。

### 実装受け入れ基準

- reporterがcontrollerの不変snapshotだけを読み、Stage変数を作成・改名・更新しない
- 未実行、running、paused、failed、finished、stopped、再start、disposeの戻り値が上表どおりである
- story変数のprimitive型を保持し、未宣言と空文字をBoolean blockで区別できる
- 同じbranch選択の全ruleが同一snapshotを使い、reporterと式namespaceの型・値が一致する
- 生の例外、backing、camera、cache、traceを返さない
- 書込は型一致、action境界commit、cancel／generation変更時破棄を満たす
- flag OFFで現行のblock数、opcode、Stage変数、SB3互換性が変わらない

## 調査根拠

- [`runtime-controller.js`](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/src/dsl4/runtime-controller.js): snapshot、台本変数、generation、診断、event
- [`pose-feedback-policy.js`](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/src/dsl4/pose-feedback-policy.js): pose state eventの6 field
- [`navigation-session.js`](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/src/dsl4/navigation-session.js): navigation snapshot
- [`dsl4-runtime-extension-entry.js`](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/scripts/sb3/dsl4-runtime-extension-entry.js): rc.8の非表示reporter
- [`release-metadata/4.0.0-rc.8.json`](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/release-metadata/4.0.0-rc.8.json): 現行SB3の固定versionとartifact metadata

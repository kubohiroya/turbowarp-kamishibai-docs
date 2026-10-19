# DSL 4.0ランタイムからのメッセージに応じた動作の記述

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: DSL 4.0の台本と、TurboWarp Editorで作るプログラムを連携する方  
前提: YAML台本のsceneとaction、およびTurboWarpの「メッセージを受け取ったとき」を使えること

文書状態: 公開プレリリース4.0.0-rc.23向けガイド<br />
実装基準: 公開tag `v4.0.0-rc.23`のcommit `2f2889f`

この文書は4.0の正式リリースを保証するものではありません。利用するSB3に
`broadcastMessageAndWait`が含まれることを[公開元](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases)で
確認してください。

DSL 4.0の`broadcastMessageAndWait`は、台本からTurboWarpへ処理を依頼し、その処理が終わってから台本の
次のactionへ進むための命令です。台本で表しにくいゲーム、演出、計算、機器連携などをTurboWarp側に書き、
sceneの進行順序だけを台本側で管理できます。

## 最初に理解する流れ

<figure class="concept-flow"><figcaption>台本とTurboWarpプログラムの待ち合わせ</figcaption><div class="concept-flow__track"><span>台本がmessageを送る</span><b aria-hidden="true">→</b><span>一致する受信scriptを開始</span><b aria-hidden="true">→</b><span>すべての受信scriptが終了</span><b aria-hidden="true">→</b><span>台本の次actionへ進む</span></div><p class="concept-flow__note"><strong>待機の単位:</strong> Stage、sprite、cloneで、この送信によって開始した受信threadをすべて待ちます。</p></figure>

通常の「メッセージを送る」ではなく、Scratch／TurboWarpの「メッセージを送って待つ」に相当します。
受信scriptのどれかが終わらなければ、台本も次へ進みません。

## 1. 台本にmessageを書く

短い形式ではmessage名を直接書きます。

```yaml
scenes:
  miniGame:
    - broadcastMessageAndWait: playMiniGame
    - sound: Success
    - goto: ending
```

`stableId`も付ける場合はobject形式を使います。

```yaml
- broadcastMessageAndWait:
    stableId: play-mini-game
    message: playMiniGame
```

`message`は空でない文字列です。TurboWarp projectに登録した名前と、大文字・小文字、空白を含めて完全に
一致させます。たとえば`playMiniGame`と`PlayMiniGame`は別の名前です。前後の空白も自動では除きません。

## 2. TurboWarp側に受信scriptを書く

TurboWarp Editorで、処理を担当するStageまたはspriteへ次の形のscriptを置きます。

```text
「playMiniGame」を受け取ったとき
  ゲーム用の表示を準備する
  得点を0にする
  10秒待つ、または終了条件を待つ
  ゲーム用の表示を片付ける
```

Eventsカテゴリの「メッセージを受け取ったとき」で`playMiniGame`を作ると、その名前がprojectのmessage登録簿へ
追加されます。YAMLに書いただけではTurboWarp側のmessageは作られません。

一つのmessageをStageと複数のspriteが受け取っても構いません。DSL 4.0ランタイムは、この送信によって開始した
すべての受信scriptが終了するまで待ちます。受信時に開始したcloneのscriptも待機対象です。

## 3. 終了する処理として書く

受信scriptは、有限時間で最下端まで到達するようにします。

| 書き方                                   | 結果                                    |
| ---------------------------------------- | --------------------------------------- |
| 数秒待ち、演出を終えてscriptを終了する   | 演出後に台本が次へ進む                  |
| 条件を待ち、条件成立後に片付けて終了する | 操作の完了後に台本が次へ進む            |
| 「ずっと」で終わらない                   | 台本も待ち続ける                        |
| 別messageを「送る」だけで自分は終了する  | 別message側の終了は待機対象にならない   |
| 別messageを「送って待つ」                | 別message側も終了してから自分が終了する |

常駐処理を開始したい場合は、開始messageと停止messageを分け、その常駐threadの終了を
`broadcastMessageAndWait`の完了条件にしない設計にします。

## 4. 複数の担当へ分ける

同じmessageを、たとえば次の三つへ分担できます。

- Stage: 背景と照明を変更する
- `MiniGame` sprite: ゲーム本体を実行する
- `SoundDirector` sprite: 開始音と終了音を再生する

三つの受信scriptのうち最後の一つが終了した時点で、台本の次actionが始まります。処理順が必要なら、
一つの受信script内で順番に呼ぶか、TurboWarp側でも「メッセージを送って待つ」を使います。

![Stage、MiniGame、SoundDirectorの受信scriptが同時に始まり、最後に終わったMiniGameの終了時点で台本の次のactionが始まる時間の流れ](../images/dsl4-broadcast-wait-timeline.svg)

_図: 受信scriptは同時に始まり、台本は最も遅く終わる受信scriptを待ちます。_

## 5. 中断とscene移動

sceneのskip、作品の停止、projectの再起動などでactionがキャンセルされると、DSL 4.0ランタイムは、その
`broadcastMessageAndWait`呼び出しが開始した受信threadだけを停止します。ほかの処理が開始した同名messageの
threadや、無関係なthreadは停止しません。キャンセル後は受信完了待ちの監視も解放されます。

| 対象                                                     | キャンセル時の扱い                              |
| -------------------------------------------------------- | ----------------------------------------------- |
| この`broadcastMessageAndWait`が開始した受信thread        | DSL 4.0ランタイムが停止する                     |
| ほかの処理が開始した同名messageのthread                  | 停止しない                                      |
| 無関係なthread                                           | 停止しない                                      |
| 受信完了待ちの監視                                       | 解放する                                        |
| 受信scriptが開始した外部装置、タイマー、独自のlistener等 | 自動では解放されない。TurboWarp側で後片付けする |

受信scriptが外部装置、タイマー、独自のイベントlistenerなどを開始する場合、その後片付けはTurboWarp側の
scriptまたは利用する機能拡張のライフサイクル契約に従ってください。Scratch threadの停止だけでは、外部資源が
自動的に解放されるとは限りません。

## 6. messageが見つからない場合

指定名がTurboWarp projectのmessage登録簿に存在しない場合、送信は行われず、actionは直ちに完了します。
登録済みでも受信scriptが一つもなければ、messageは送られますが待つthreadがないため直ちに完了します。

| message登録簿にある | 受信scriptがある | 送信     | actionの完了                                 |
| ------------------- | ---------------- | -------- | -------------------------------------------- |
| ない                | —                | 行わない | 直ちに完了する                               |
| ある                | ない             | 行う     | 待つthreadがないため直ちに完了する           |
| ある                | ある             | 行う     | 開始したすべての受信scriptの終了後に完了する |

意図せず直ちに完了した場合は、上の二行のどちらかに当たっています。

意図しない即時完了を防ぐため、次を確認します。

1. Eventsカテゴリの受信hatに同じmessage名がある
2. YAMLとTurboWarpで大文字・小文字、全角・半角、前後の空白が一致する
3. 受信hatが、完成SB3に含まれるStageまたはspriteに置かれている
4. 受信scriptが最後まで終了する

## 7. 動作確認

次の最小確認を行います。

1. 受信scriptの先頭で変数`phase`を`started`にする
2. 1秒待つ
3. `phase`を`finished`にする
4. 台本では`broadcastMessageAndWait`直後に別の背景または効果音を設定する
5. 直後のactionが、`phase = finished`より前に実行されないことを確認する

複数receiverを使う場合は待ち時間を変え、最も遅いreceiverが終了するまで次actionへ進まないことも確認します。

## 関連資料

- [紙芝居DSL 4.0 台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)
- [紙芝居DSL 4.0 Schemaリファレンス](../dsl-author-guides/dsl-4.0-schema-reference.md#broadcastmessageandwait)
- [DSL 4.0ランタイム ブロックリファレンス](dsl-4.0-runtime-block-reference.md)

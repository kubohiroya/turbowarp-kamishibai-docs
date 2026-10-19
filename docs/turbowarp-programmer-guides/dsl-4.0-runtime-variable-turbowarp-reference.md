# DSL 4.0ランタイム変数 TurboWarp連携リファレンス

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書基準: 公開プレリリース`4.0.0-rc.25`、commit `a68f8dc4`、2026年10月19日。正式版4.0.0は未公開です。

本書はrc.25の読取状態blockと台本変数の更新actionを説明します。
[変数の利用ガイド](../dsl-author-guides/dsl-4.0-runtime-variable-guide.md)と
[ブロック一覧](dsl-4.0-runtime-block-reference.md)を併用してください。

## 現在の公開状態

Extension IDは`kubohiroyakamishibai4`、runtime member IDは`kubohiroyakamishibairuntime4`です。
保存時のopcodeは`kubohiroyakamishibairuntime4__`を下の名前へ付けたものです。
状態surfaceは17個の読取blockを公開します。Stage変数`ポーズ認識`／`チャージ`とは別の窓口です。

| opcode                              | 種類     | ブロック文                         |
| ----------------------------------- | -------- | ---------------------------------- |
| `storyVariableReporter`             | reporter | story variable [NAME]              |
| `storyVariableExists`               | Boolean  | story variable [NAME] exists?      |
| `storyVariableType`                 | reporter | story variable [NAME] type         |
| `storyStatusReporter`               | reporter | story status                       |
| `currentSceneIdReporter`            | reporter | current scene id                   |
| `currentActionNumberReporter`       | reporter | current action number              |
| `currentActionPathReporter`         | reporter | current action path                |
| `lastRuntimeErrorCodeReporter`      | reporter | last runtime error code            |
| `lastRuntimeErrorStoryPathReporter` | reporter | last runtime error story path      |
| `posePhaseReporter`                 | reporter | pose phase                         |
| `poseTargetReporter`                | reporter | pose target                        |
| `poseNameReporter`                  | reporter | pose name                          |
| `poseStepNumberReporter`            | reporter | pose step number                   |
| `runtimeVersionReporter`            | reporter | Kamishibai DSL 4.0 runtime version |
| `applicationStatusReporter`         | reporter | application status                 |
| `canNavigateToPreviousAction`       | Boolean  | can navigate to previous action?   |
| `canNavigateToNextAction`           | Boolean  | can navigate to next action?       |

## 台本変数の型と更新

`storyVariableReporter`／`storyVariableExists`／`storyVariableType`で宣言済みの値・存在・型を読みます。
更新は`setVariable`、`changeVariable`、`toggleVariable`のcore actionで行い、専用書込reporterはありません。
`setVariable`ブロックはNAME・VALUE・TYPEを受け、TYPEはstring／number／booleanを明示します。
YAMLでは`setVariable: {name: score, value: 10}`のようにリテラル値から型を決めます。

未知の変数、型不一致、有限でない数値は拒否します。未宣言変数を自動作成したり、別の型へ暗黙変換したりしません。
変数の更新はcore actionとして実行します。旧提案の`setStoryVariableString`等や、書込queueのcommit契約を
現在の公開仕様として使わないでください。

## 式namespace

`runtime["KEY"]`で利用できるキーは次のとおりです。

`status`、`scene.id`、`action.number`、`action.path`、`pose.phase`、`pose.target`、`pose.name`、`pose.stepNumber`、`version`。

action番号とpose step番号は1始まり、非実行時は0です。未知のキーは
`K4-EXPRESSION-RUNTIME-UNKNOWN`として拒否します。分岐ごとに一つのsnapshotを共有します。
診断、application status、履歴を前後に移動できるかどうかはTurboWarp側で確認し、式namespaceと混同しません。

## Feature flags

`dsl4TurboWarpStateSurface`は状態block、`dsl4ExpressionRuntimeState`は式namespaceを制御します。
汎用defaultはOFF、Standard productionはONです。`dsl4TurboWarpStoryVariableWrite`はrc.25のflag一覧にありません。
書換えはcore actionであるため専用flagを設けません。

## 公開しない状態

生の例外message、実行世代、trace、履歴配列、camera device ID、cache、binary backing、DOM handleを
作品の状態APIとして公開しません。ポーズはphase・対象・名前・stepを読み、内部のカメラ所有権を取得しません。

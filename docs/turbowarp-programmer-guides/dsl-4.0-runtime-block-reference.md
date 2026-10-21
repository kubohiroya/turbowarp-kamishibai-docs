# DSL 4.0ランタイム ブロックリファレンス

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書基準: 公開プレリリース`4.0.0-rc.25`、commit `a68f8dc4`、2026年10月19日。正式版4.0.0は未公開です。

対象: DSL 4.0ランタイムをTurboWarp Editorで開き、集約されたブロックからプログラムを書く方。
公開SB3のbundleが返す`getInfo()`を照合した一覧です。表示されるopcode付きブロックは200個、memberは8個です。
見出し・ドキュメントボタン・非表示ブロックは200個に含めません。表示の抽出は再生・実カメラの検証ではありません。

台本の変換コマンドと編集手順は、[YAMLとブロック台本SB3の相互変換ガイド](../dsl-author-guides/dsl-4.0-block-script-conversion-guide.md)を参照してください。
公開rc.25は、シーンごとに実命令ブロックを配置し、種類別の定義ブロックで台本を編集する形式に対応します。
生成SB3へ同梱する編集用拡張の補助ブロックは、Standard SB3を照合した下記の200個には含めません。

## ブロック台本の入口とincludeBlocks

公開rc.25では、生成SB3へ同梱する編集用拡張`kubohiroyakamishibaiauthoring4`に次のブロックがあります。
Standard SB3のRuntime memberは46ブロック、bundle全体は200ブロックです。
旧sourceハットと文字列命令は削除され、台本の入口は編集用拡張のハットへ統一されています。

- `kamishibai [VERSION] [LABEL]`（hat、opcode: `kamishibai`）: VERSIONは文字列4.0、LABELの既定は空文字。
- `includeBlocks [LABEL]`（command、opcode: `includeBlocks`）: 同じSB3内の名前付き台本を読み込む。
- `この部分を使う [ENABLED]`（command、opcode: `useSection`）: 定義列やscene内命令を囲み、オン／オフを選ぶC字ブロック。
  rc.25のCLIで`--block-sections true`を付けた場合だけパレットに表示します。既定は非表示です。
  scene全体とincludeBlocksは囲めません。外側のオフが優先し、開始し直すと反映します。

`kamishibai [4.0] [ラベル]`は台本ソースの入口と版・識別名の宣言を兼ねるハットです。
このハット自身はイベントを受信しません。ランタイムが起動時に宣言を検出し、接続された台本から物語を開始します。
旧`when kamishibai DSL source`を前段へ置く構成は使いません。
旧ハットの定義・生成・読取互換も残しません。旧ブロック台本は元のYAMLから再生成します。
埋込ランタイムを持つ旧ベースから生成する場合も、旧2定義を登録から除去します。

空でないラベルはSB3全体で一意です。同一Stage内でもStage/Sprite間でも参照できます。
Stageにある名前（LABEL）が空欄の台本1個がルートです。名前付き宣言だけでは、1個でもルートになりません。
`includeBlocks`は台本ハット直下の宣言列に置き、シーン内の命令にはできません。
参照切れ、重複、空参照、自己参照・循環、動的入力は診断します。
ラベルの改名時は参照元も編集してください。

素材を含む公開サンプルのブロック台本SB3は、緑の旗を押し、タイトルを閉じるとその台本を直接再生します。
物語終了後の「再読み込み」では、編集したブロックを読み直します。不正な台本は診断を表示します。
フォームで編集して再開する場合は、赤い停止ボタンで止めて値を保存し、緑の旗を押してタイトルを閉じます。
rc.25では、前のカメラ開始が許可待ちでも停止・破棄が完了し、次のタイトル表示と再開始を妨げません。
`file`素材には同梱済みのファイルbundleが必要です。Standard SB3へ台本ブロックを追加するだけでは、
外部ファイルの内容は取り込まれません。別の台本ファイルを選択済みの場合は、選択した台本を優先します。
生成・編集・保存と、分割YAMLへの書き戻し・再生用ビルドは
[相互変換ガイドのincludeBlocks手順](../dsl-author-guides/dsl-4.0-block-script-conversion-guide.md)を参照してください。

## パレットとドキュメントボタン

rc.25のCLIで生成した編集用SB3では、8種類の定義フォームとは別に、
`recognize actor [TARGET] pose steps [STEPS]`の書類アイコンから`STEPS`をフォームで編集できます。
「ポーズ認識の手順」の各行は`pose`が必須、`skin`・`sound`が任意で、1行以上が必要です。
フォームの登録と解除はSB3内の編集用拡張が担当し、表示ブロック200個の構成は変わりません。
以前の編集用SB3は、rc.25のCLIで再生成してください。

memberごとに見出し、`Open Documentation`、ブロックが並びます。
集約bundleのExtension IDは`kubohiroyakamishibai4`です。保存時のopcodeは`member ID__opcode`であり、
下の表では共通prefixを除いたmember内のopcodeを示します。member名、Extension ID、製品名を混同しないでください。

| member                      | version     | member ID                      | ブロック数 |
| --------------------------- | ----------- | ------------------------------ | ---------- |
| Kamishibai DSL 4.0 Runtime  | 4.0.0-rc.25 | `kubohiroyakamishibairuntime4` | 46         |
| Asset Cache                 | 0.1.0       | `kubohiroyaassetcache`         | 23         |
| Async Input                 | 0.7.0       | `kubohiroyaasyncinput`         | 9          |
| Bubble                      | 0.13.0      | `kubohiroyabubble`             | 31         |
| Camera Source               | 0.15.0      | `kubohiroyacamerasource`       | 38         |
| Runtime Expression          | 0.6.0       | `kubohiroyaruntimeexpression`  | 3          |
| SVG Text                    | 0.10.0      | `kubohiroyasvgtext`            | 2          |
| TurboWarp Teachable Machine | 3.5.1       | `kubohiroyatm`                 | 48         |

rc.25の素材保持はAsset Cacheが担当し、
カメラはCamera Sourceが所有し、Teachable Machineはleaseを通じて映像を読みます。

## 現状TurboWarpブロックから参照できる公開変数（2変数）

互換Stage変数`ポーズ認識`と`チャージ`は0〜100の数値です。台本変数`variables:`とは別です。
ランタイムが所有するため、作品の得点やフラグの保存先には使いません。
初期化・完了・中断時には0へ戻し、`recognition.feedback.mode`に従って表示します。
通常の変数blockで読めるこの2変数に加え、rc.25では専用の読取reporterで台本変数・ランタイム状態を参照できます。

台本変数の書換えはcore actionの`setVariable`／`changeVariable`／`toggleVariable`を使います。
`setStoryVariableString`等の旧提案の書込blockや`dsl4TurboWarpStoryVariableWrite`は現行APIではありません。
宣言済みの変数だけを同じ型で更新し、値の意味はYAMLとブロック台本で共通です。
詳細は[ランタイム変数リファレンス](dsl-4.0-runtime-variable-turbowarp-reference.md)を参照してください。

## Kamishibai DSL 4.0 Runtime 4.0.0-rc.25（46ブロック）

29個のcore actionと17個の読取状態blockを含みます。

| opcode                              | 種類     | ブロック文                                                       | 引数                          |
| ----------------------------------- | -------- | ---------------------------------------------------------------- | ----------------------------- |
| `stage`                             | command  | set stage backdrop [BACKDROP]                                    | BACKDROP                      |
| `bgm`                               | command  | play BGM [SOUND]                                                 | SOUND                         |
| `stopBgm`                           | command  | stop BGM over [SECONDS] seconds                                  | SECONDS                       |
| `setBgmVolume`                      | command  | set BGM volume to [VOLUME] % over [SECONDS] seconds              | VOLUME、SECONDS               |
| `sound`                             | command  | play sound [SOUND] until done                                    | SOUND                         |
| `wait`                              | command  | wait [SECONDS] seconds                                           | SECONDS                       |
| `debugger`                          | command  | debugger                                                         | —                             |
| `broadcastMessageAndWait`           | command  | broadcast [MESSAGE] and wait                                     | MESSAGE                       |
| `transition`                        | command  | transition [EFFECT] for [SECONDS] seconds                        | EFFECT、SECONDS               |
| `goto`                              | command  | go to scene [SCENE]                                              | SCENE                         |
| `branch`                            | command  | choose branch [BRANCH]                                           | BRANCH                        |
| `setVariable`                       | command  | set story variable [NAME] to [VALUE] as [TYPE]                   | NAME、VALUE、TYPE             |
| `changeVariable`                    | command  | change story variable [NAME] by [BY]                             | NAME、BY                      |
| `toggleVariable`                    | command  | toggle story variable [NAME]                                     | NAME                          |
| `keyInputToChangeScene`             | command  | wait for key routes [ROUTES]                                     | ROUTES                        |
| `touchInputToChangeScene`           | command  | wait for actor touch routes [ROUTES]                             | ROUTES                        |
| `poseInputToChangeScene`            | command  | wait for pose routes [ROUTES]                                    | ROUTES                        |
| `imageInputToChangeScene`           | command  | wait for image label routes [ROUTES]                             | ROUTES                        |
| `show`                              | command  | show actor [TARGET] skin [SKIN] x [X] y [Y] scale [SCALE] %      | TARGET、SKIN、X、Y、SCALE     |
| `hide`                              | command  | hide actor [TARGET]                                              | TARGET                        |
| `setTransparency`                   | command  | set actor [TARGET] transparency spec [SPEC]                      | TARGET、SPEC                  |
| `moveTo`                            | command  | move actor [TARGET] to x [X] y [Y] in [SECONDS] seconds [EASING] | TARGET、X、Y、SECONDS、EASING |
| `say`                               | command  | actor [TARGET] say spec [SPEC]                                   | TARGET、SPEC                  |
| `think`                             | command  | actor [TARGET] think spec [SPEC]                                 | TARGET、SPEC                  |
| `setSkin`                           | command  | set actor [TARGET] skin [SKIN] optional scale [SCALE]            | TARGET、SKIN、SCALE           |
| `setLayer`                          | command  | set actor [TARGET] layer [LAYER]                                 | TARGET、LAYER                 |
| `loop`                              | command  | loop actor [TARGET] costume steps [STEPS]                        | TARGET、STEPS                 |
| `setText`                           | command  | set text actor [TARGET] to [TEXT] style [STYLE]                  | TARGET、TEXT、STYLE           |
| `pose`                              | command  | recognize actor [TARGET] pose steps [STEPS]                      | TARGET、STEPS                 |
| `storyVariableReporter`             | reporter | story variable [NAME]                                            | NAME                          |
| `storyVariableExists`               | Boolean  | story variable [NAME] exists?                                    | NAME                          |
| `storyVariableType`                 | reporter | story variable [NAME] type                                       | NAME                          |
| `storyStatusReporter`               | reporter | story status                                                     | —                             |
| `currentSceneIdReporter`            | reporter | current scene id                                                 | —                             |
| `currentActionNumberReporter`       | reporter | current action number                                            | —                             |
| `currentActionPathReporter`         | reporter | current action path                                              | —                             |
| `lastRuntimeErrorCodeReporter`      | reporter | last runtime error code                                          | —                             |
| `lastRuntimeErrorStoryPathReporter` | reporter | last runtime error story path                                    | —                             |
| `posePhaseReporter`                 | reporter | pose phase                                                       | —                             |
| `poseTargetReporter`                | reporter | pose target                                                      | —                             |
| `poseNameReporter`                  | reporter | pose name                                                        | —                             |
| `poseStepNumberReporter`            | reporter | pose step number                                                 | —                             |
| `runtimeVersionReporter`            | reporter | Kamishibai DSL 4.0 runtime version                               | —                             |
| `applicationStatusReporter`         | reporter | application status                                               | —                             |
| `canNavigateToPreviousAction`       | Boolean  | can navigate to previous action?                                 | —                             |
| `canNavigateToNextAction`           | Boolean  | can navigate to next action?                                     | —                             |

## Asset Cache 0.1.0（23ブロック）

[上流の説明書](https://kubohiroya.github.io/turbowarp-asset-cache/)で引数の意味と寿命を確認できます。

| opcode                    | 種類     | ブロック文                                                                            | 引数                     |
| ------------------------- | -------- | ------------------------------------------------------------------------------------- | ------------------------ |
| `registerAsset`           | command  | register resource [RESOURCE_ID] as asset [NAME]                                       | RESOURCE_ID、NAME        |
| `assetErrorType`          | reporter | asset registration error type                                                         | —                        |
| `assetErrorLabel`         | reporter | asset registration error label                                                        | —                        |
| `deleteMemoryAsset`       | command  | delete asset [NAME] from memory                                                       | NAME                     |
| `deleteAllMemoryAssets`   | command  | delete all assets from memory                                                         | —                        |
| `deleteCachedAsset`       | command  | delete asset [NAME] from cache                                                        | NAME                     |
| `deleteAllCachedAssets`   | command  | delete all assets from cache                                                          | —                        |
| `isLoaded`                | Boolean  | asset [NAME] is loaded                                                                | NAME                     |
| `setTextValue`            | command  | set text asset [NAME] to [VALUE]                                                      | NAME、VALUE              |
| `setTextStyle`            | command  | set text asset [NAME] style [PROPERTY] to [VALUE]                                     | NAME、PROPERTY、VALUE    |
| `setThisSpriteSkin`       | command  | show asset [NAME] on this sprite                                                      | NAME                     |
| `setSpriteSkin`           | command  | show asset [NAME] on [SPRITE] (compatibility)                                         | SPRITE、NAME             |
| `startActorLoop`          | command  | loop actor [ACTOR] through assets [ASSETS] for seconds [DURATIONS]                    | ACTOR、ASSETS、DURATIONS |
| `startActorSequence`      | command  | play actor [ACTOR] through assets [ASSETS] for seconds [DURATIONS] once in background | ACTOR、ASSETS、DURATIONS |
| `stopActorAnimation`      | command  | stop animation of actor [ACTOR]                                                       | ACTOR                    |
| `finishAllActorSequences` | command  | finish all actor sequences                                                            | —                        |
| `setStageSkin`            | command  | set stage backdrop to asset [NAME]                                                    | NAME                     |
| `playSound`               | command  | play asset [NAME] as sound                                                            | NAME                     |
| `playSoundUntilDone`      | command  | play asset [NAME] as sound until done                                                 | NAME                     |
| `stopSound`               | command  | stop asset sound [NAME]                                                               | NAME                     |
| `stopAllSounds`           | command  | stop all asset sounds                                                                 | —                        |
| `getAssetMimeType`        | reporter | MIME type of asset [NAME]                                                             | NAME                     |
| `getVersion`              | reporter | Asset Cache version                                                                   | —                        |

## Async Input 0.7.0（9ブロック）

[上流の説明書](https://kubohiroya.github.io/turbowarp-async-input/)で引数の意味と寿命を確認できます。

| opcode                            | 種類    | ブロック文                                                                                         | 引数                                |
| --------------------------------- | ------- | -------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `listenForKey`                    | command | listen for key [KEY_ID] set runtime var [RUNTIME_VAR] to [VALUE]                                   | KEY_ID、RUNTIME_VAR、VALUE          |
| `listenForKeyAndBroadcast`        | command | listen for key [KEY_ID] set runtime var [RUNTIME_VAR] to [VALUE] and broadcast [MESSAGE]           | KEY_ID、RUNTIME_VAR、VALUE、MESSAGE |
| `stopListeningForKey`             | command | stop listening for key [KEY_ID] for this target                                                    | KEY_ID                              |
| `stopAllKeyListeners`             | command | stop all key listeners registered by this target                                                   | —                                   |
| `listenForTouch`                  | command | listen for touch on this sprite set runtime var [RUNTIME_VAR] to [VALUE]                           | RUNTIME_VAR、VALUE                  |
| `listenForTouchAndBroadcast`      | command | listen for touch on this sprite set runtime var [RUNTIME_VAR] to [VALUE] and broadcast [MESSAGE]   | RUNTIME_VAR、VALUE、MESSAGE         |
| `stopListeningForTouch`           | command | stop listening for touch on this sprite                                                            | —                                   |
| `stopAllInputListeners`           | command | stop all input listeners registered by this target                                                 | —                                   |
| `listenForActorTouchAndBroadcast` | command | listen for touch on actor [ACTOR] set runtime var [RUNTIME_VAR] to [VALUE] and broadcast [MESSAGE] | ACTOR、RUNTIME_VAR、VALUE、MESSAGE  |

## Bubble 0.13.0（31ブロック）

[上流の説明書](https://kubohiroya.github.io/turbowarp-bubble/)で引数の意味と寿命を確認できます。

| opcode                         | 種類     | ブロック文                                                                                                   | 引数                                 |
| ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `defineBubbleStyle`            | command  | define bubble style [STYLE] using text style [TEXT_STYLE]                                                    | STYLE、TEXT_STYLE                    |
| `defineBubbleClosePolicy`      | command  | define bubble close policy [POLICY] trigger [TRIGGER] condition [CONDITION] timeout [TIMEOUT] seconds        | POLICY、TRIGGER、CONDITION、TIMEOUT  |
| `setBubblePlacement`           | command  | set bubble placement [PLACEMENT] for bubble style [STYLE]                                                    | PLACEMENT、STYLE                     |
| `setPortraitBase`              | command  | set portrait base [ASSET] for bubble style [STYLE]                                                           | ASSET、STYLE                         |
| `setPortraitLayout`            | command  | set portrait [PLACEMENT] offset x [X] y [Y] zoom [ZOOM] % corner radius [RADIUS] px for bubble style [STYLE] | PLACEMENT、X、Y、ZOOM、RADIUS、STYLE |
| `setBubbleDistance`            | command  | set bubble distance [DISTANCE] for bubble style [STYLE]                                                      | DISTANCE、STYLE                      |
| `setBubbleVisualStyle`         | command  | set bubble visual style [VISUAL_STYLE] for bubble style [STYLE]                                              | VISUAL_STYLE、STYLE                  |
| `setBubbleTailLength`          | command  | set bubble tail length [LENGTH] for bubble style [STYLE]                                                     | LENGTH、STYLE                        |
| `setBubbleOffset`              | command  | set bubble offset x [X] y [Y] scale [SCALE] % for bubble style [STYLE]                                       | X、Y、SCALE、STYLE                   |
| `setBlinkFrames`               | command  | set blink frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]                                   | ASSETS、SECONDS、STYLE               |
| `setLipSyncFrames`             | command  | set lip-sync frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]                                | ASSETS、SECONDS、STYLE               |
| `setContinueFrames`            | command  | set continue frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]                                | ASSETS、SECONDS、STYLE               |
| `setBubbleReveal`              | command  | set bubble reveal unit [UNIT] every [SECONDS] seconds layout [LAYOUT] for bubble style [STYLE]               | UNIT、SECONDS、LAYOUT、STYLE         |
| `setBubbleWordDelimiters`      | command  | set bubble word delimiters [DELIMITERS] show [SHOW] for bubble style [STYLE]                                 | DELIMITERS、SHOW、STYLE              |
| `setBubbleRevealSound`         | command  | set bubble reveal sound [ASSET] for bubble style [STYLE]                                                     | ASSET、STYLE                         |
| `setBubbleVoice`               | command  | set bubble voice [ASSET] for bubble style [STYLE]                                                            | ASSET、STYLE                         |
| `finishBubbleReveal`           | command  | finish [UNIT] with condition [CONDITION] or timeout after [TIMEOUT] seconds                                  | UNIT、CONDITION、TIMEOUT             |
| `setBubbleShowAnimation`       | command  | set bubble show animation [MOTION] for [SECONDS] seconds for bubble style [STYLE]                            | MOTION、SECONDS、STYLE               |
| `setBubbleHideAnimation`       | command  | set bubble hide animation [MOTION] for [SECONDS] seconds for bubble style [STYLE]                            | MOTION、SECONDS、STYLE               |
| `animateBubble`                | command  | animate this bubble [MOTION]                                                                                 | MOTION                               |
| `shakeBubble`                  | command  | shake this bubble direction [DIRECTION] count [COUNT] ease [EASE]                                            | DIRECTION、COUNT、EASE               |
| `explodeBubble`                | command  | explode this bubble relative scale [SCALE] count [COUNT] ease [EASE]                                         | SCALE、COUNT、EASE                   |
| `animateBubbleShape`           | command  | animate bubble shape to [VISUAL_STYLE] speed [SPEED] for [SECONDS] seconds                                   | VISUAL_STYLE、SPEED、SECONDS         |
| `say`                          | command  | say [MESSAGE]                                                                                                | MESSAGE                              |
| `think`                        | command  | think [MESSAGE]                                                                                              | MESSAGE                              |
| `showWithBubbleStyle`          | command  | show [MESSAGE] with bubble style [STYLE]                                                                     | MESSAGE、STYLE                       |
| `setBubbleAnimationMode`       | command  | set this bubble animation mode [MODE]                                                                        | MODE                                 |
| `waitForBubbleContinue`        | command  | wait with this bubble until condition [CONDITION] or timeout after [TIMEOUT] seconds                         | CONDITION、TIMEOUT                   |
| `waitAndCloseBubbleWithPolicy` | command  | wait and close this bubble using close policy [POLICY]                                                       | POLICY                               |
| `closeBubble`                  | command  | close this bubble                                                                                            | —                                    |
| `getVersion`                   | reporter | Bubble version                                                                                               | —                                    |

## Camera Source 0.15.0（38ブロック）

[上流の説明書](https://kubohiroya.github.io/turbowarp-camera-source/)で引数の意味と寿命を確認できます。

| opcode                                | 種類     | ブロック文                                                            | 引数                    |
| ------------------------------------- | -------- | --------------------------------------------------------------------- | ----------------------- |
| `startSharedCamera`                   | command  | start shared camera [CAMERA_ID] with device ID [DEVICE_ID]            | CAMERA_ID、DEVICE_ID    |
| `startRequestedSharedCamera`          | command  | start shared camera [CAMERA_ID] requested by this page                | CAMERA_ID               |
| `stopSharedCamera`                    | command  | stop shared camera [CAMERA_ID]                                        | CAMERA_ID               |
| `isCameraRunning`                     | Boolean  | shared camera [CAMERA_ID] is running?                                 | CAMERA_ID               |
| `cameraErrorCode`                     | reporter | shared camera [CAMERA_ID] error code                                  | CAMERA_ID               |
| `cameraError`                         | reporter | shared camera [CAMERA_ID] error                                       | CAMERA_ID               |
| `cameraDeviceIdReporter`              | reporter | shared camera [CAMERA_ID] device ID                                   | CAMERA_ID               |
| `showCameraPreview`                   | command  | show shared camera [CAMERA_ID] preview flipped [PREVIEW_FLIP]         | CAMERA_ID、PREVIEW_FLIP |
| `hideCameraPreview`                   | command  | hide shared camera [CAMERA_ID] preview                                | CAMERA_ID               |
| `cameraFrameWidth`                    | reporter | shared camera [CAMERA_ID] frame width                                 | CAMERA_ID               |
| `cameraFrameHeight`                   | reporter | shared camera [CAMERA_ID] frame height                                | CAMERA_ID               |
| `cameraFrameRate`                     | reporter | shared camera [CAMERA_ID] frame rate                                  | CAMERA_ID               |
| `refreshCameraDevices`                | command  | refresh camera devices                                                | —                       |
| `cameraDeviceCount`                   | reporter | camera device count                                                   | —                       |
| `cameraDeviceIdAt`                    | reporter | camera device ID at [INDEX]                                           | INDEX                   |
| `cameraDeviceLabelAt`                 | reporter | camera device label at [INDEX]                                        | INDEX                   |
| `registerCameraProfile`               | command  | register camera profile [PROFILE_JSON]                                | PROFILE_JSON            |
| `registerCameraProfileAs`             | command  | register camera profile [PROFILE_JSON] as [CAMERA_ID]                 | PROFILE_JSON、CAMERA_ID |
| `forgetCameraProfile`                 | command  | forget camera profile for [CAMERA_ID]                                 | CAMERA_ID               |
| `cameraProfileRegistered`             | Boolean  | camera [CAMERA_ID] is calibrated?                                     | CAMERA_ID               |
| `cameraProfileJson`                   | reporter | camera profile JSON for [CAMERA_ID]                                   | CAMERA_ID               |
| `cameraProfileYaml`                   | reporter | camera profile YAML for [CAMERA_ID]                                   | CAMERA_ID               |
| `cameraProfileError`                  | reporter | camera profile error                                                  | —                       |
| `cameraProfileErrorDetail`            | reporter | camera profile error detail                                           | —                       |
| `cameraProfileCompatibility`          | reporter | camera profile compatibility for [CAMERA_ID]                          | CAMERA_ID               |
| `cameraProfileCompatibilityDetail`    | reporter | camera profile compatibility detail for [CAMERA_ID]                   | CAMERA_ID               |
| `cameraProfileAdaptation`             | reporter | camera profile adaptation for [CAMERA_ID]                             | CAMERA_ID               |
| `cameraProfileIntrinsicsJson`         | reporter | camera intrinsics JSON for [CAMERA_ID]                                | CAMERA_ID               |
| `cameraConditionsJson`                | reporter | camera conditions JSON for [CAMERA_ID]                                | CAMERA_ID               |
| `cameraConditionsGeneration`          | reporter | camera conditions generation for [CAMERA_ID]                          | CAMERA_ID               |
| `saveCameraProfile`                   | command  | save camera profile for [CAMERA_ID] to browser storage                | CAMERA_ID               |
| `restoreStoredCameraProfile`          | command  | restore stored camera profile for [CAMERA_ID]                         | CAMERA_ID               |
| `restoreStoredCameraProfileForDevice` | command  | restore stored camera profile calibrated on the device of [CAMERA_ID] | CAMERA_ID               |
| `bindCameraProfileToDevice`           | command  | bind camera profile for [CAMERA_ID] to its current device             | CAMERA_ID               |
| `cameraProfileOnDevice`               | Boolean  | camera profile for [CAMERA_ID] belongs to its current device?         | CAMERA_ID               |
| `storedCameraProfileResult`           | reporter | stored camera profile result for [CAMERA_ID]                          | CAMERA_ID               |
| `storedCameraProfileDetail`           | reporter | stored camera profile detail for [CAMERA_ID]                          | CAMERA_ID               |
| `storedCameraProfilesGeneration`      | reporter | stored camera profiles generation                                     | —                       |

## Runtime Expression 0.6.0（3ブロック）

[上流の説明書](https://kubohiroya.github.io/turbowarp-runtime-expression/)で引数の意味と寿命を確認できます。

| opcode                           | 種類    | ブロック文                                                                                                            | 引数                                                      |
| -------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `runtimeCondition`               | Boolean | condition [EXPRESSION]                                                                                                | EXPRESSION                                                |
| `registerConditionalBroadcast`   | command | register [ID] conditional broadcast [CONDITION] [MESSAGE_ON_TRUE] / [MESSAGE_ON_FALSE] with [TIMEOUT] seconds timeout | ID、CONDITION、MESSAGE_ON_TRUE、MESSAGE_ON_FALSE、TIMEOUT |
| `unregisterConditionalBroadcast` | command | unregister [ID] conditional broadcast                                                                                 | ID                                                        |

## SVG Text 0.10.0（2ブロック）

[上流の説明書](https://kubohiroya.github.io/turbowarp-svg-text/)で引数の意味と寿命を確認できます。

| opcode        | 種類    | ブロック文                                                                                                | 引数                                             |
| ------------- | ------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `defineStyle` | command | define text style [STYLE] background [BACKGROUND] text [TEXT_COLOR] font [FONT] size [SIZE] align [ALIGN] | STYLE、BACKGROUND、TEXT_COLOR、FONT、SIZE、ALIGN |
| `setText`     | command | set this sprite text [TEXT] with style [STYLE]                                                            | TEXT、STYLE                                      |

## TurboWarp Teachable Machine 3.5.1（48ブロック）

[上流の説明書](https://kubohiroya.github.io/turbowarp-teachable-machine/)で引数の意味と寿命を確認できます。

| opcode                            | 種類     | ブロック文                                                       | 引数                         |
| --------------------------------- | -------- | ---------------------------------------------------------------- | ---------------------------- |
| `versionReporter`                 | reporter | Teachable Machine version                                        | —                            |
| `setRecognitionMode`              | command  | set recognition mode to [MODE]                                   | MODE                         |
| `recognitionModeReporter`         | reporter | recognition mode                                                 | —                            |
| `setComputeMode`                  | command  | set compute mode to [MODE]                                       | MODE                         |
| `computeModeReporter`             | reporter | compute mode                                                     | —                            |
| `computeBackendReporter`          | reporter | active compute backend                                           | —                            |
| `setModelURL`                     | command  | set model URL to [URL]                                           | URL                          |
| `startCamera`                     | command  | start camera                                                     | —                            |
| `stopCamera`                      | command  | stop camera                                                      | —                            |
| `isCameraRunning`                 | Boolean  | camera is running?                                               | —                            |
| `refreshCameraList`               | command  | refresh camera list                                              | —                            |
| `setCameraSelection`              | command  | set camera to [CAMERA]                                           | CAMERA                       |
| `cameraCountReporter`             | reporter | camera count                                                     | —                            |
| `cameraDeviceIdReporter`          | reporter | camera device ID                                                 | —                            |
| `cameraDeviceNameReporter`        | reporter | camera device name                                               | —                            |
| `showPreview`                     | command  | show camera preview                                              | —                            |
| `hidePreview`                     | command  | hide camera preview                                              | —                            |
| `isPreviewVisible`                | Boolean  | camera preview is visible?                                       | —                            |
| `setPreviewOpacity`               | command  | set camera preview opacity to [OPACITY]                          | OPACITY                      |
| `setPreviewPosition`              | command  | set camera preview position to [POSITION]                        | POSITION                     |
| `setPreviewMirroring`             | command  | set camera preview to [MIRRORING]                                | MIRRORING                    |
| `previewMirroringReporter`        | reporter | camera preview mirroring                                         | —                            |
| `setPoseOverlayVisibility`        | command  | set pose overlay [VISIBILITY]                                    | VISIBILITY                   |
| `isPoseOverlayVisible`            | Boolean  | pose overlay is visible?                                         | —                            |
| `setPoseJointStyle`               | command  | set [PART] joint color [COLOR] opacity [OPACITY] radius [RADIUS] | PART、COLOR、OPACITY、RADIUS |
| `setPoseBoneStyle`                | command  | set pose bone color [COLOR] opacity [OPACITY] width [WIDTH]      | COLOR、OPACITY、WIDTH        |
| `setPoseOverlayMinimumConfidence` | command  | set pose overlay minimum confidence to [CONFIDENCE]              | CONFIDENCE                   |
| `setPoseConfidenceScaling`        | command  | set pose [PROPERTY] confidence scaling [STATE]                   | PROPERTY、STATE              |
| `loadModel`                       | command  | load model                                                       | —                            |
| `isModelLoaded`                   | Boolean  | model is loaded?                                                 | —                            |
| `startRecognition`                | command  | start recognition                                                | —                            |
| `stopRecognition`                 | command  | stop recognition                                                 | —                            |
| `isRecognizing`                   | Boolean  | recognition is running?                                          | —                            |
| `currentPoseReporter`             | reporter | current label                                                    | —                            |
| `scoreReporter`                   | reporter | confidence                                                       | —                            |
| `poseScoreReporter`               | reporter | confidence of [NAME]                                             | NAME                         |
| `setAccumulatedPoseParameters`    | command  | set accumulated pose accumulation [ACCUMULATION] decay [DECAY]   | ACCUMULATION、DECAY          |
| `setAccumulatedPoseThreshold`     | command  | set accumulated pose threshold [THRESHOLD]                       | THRESHOLD                    |
| `resetAccumulatedPose`            | command  | reset accumulated pose scores                                    | —                            |
| `accumulatedPoseReporter`         | reporter | accumulated pose                                                 | —                            |
| `accumulatedScoreReporter`        | reporter | accumulated score                                                | —                            |
| `accumulatedPoseScoreReporter`    | reporter | accumulated score of [NAME]                                      | NAME                         |
| `isPose`                          | Boolean  | label is [NAME]?                                                 | NAME                         |
| `isPoseWithThreshold`             | Boolean  | label is [NAME] with confidence at least [THRESHOLD]?            | NAME、THRESHOLD              |
| `cameraMsReporter`                | reporter | camera startup time (ms)                                         | —                            |
| `modelLoadMsReporter`             | reporter | model load time (ms)                                             | —                            |
| `firstRecognitionMsReporter`      | reporter | first recognition time (ms)                                      | —                            |
| `lastErrorReporter`               | reporter | last error                                                       | —                            |

## rc.37で利用できる動画ブロック

`video` と `videoControl` は公開済みrc.37のStandard SB3と制作プレビューで標準ONです。
台本の版は4.0のままで、有効化用URLパラメータは不要です。
動画領域の `plane` と `zIndex`、再生操作、使い方と制約は[動画再生ガイド](../dsl-author-guides/dsl-4.0-video-guide.md)を参照してください。
このページの固定基準rc.25のブロック件数と一覧には、後から追加された動画ブロックを含めていません。

## 互換性と安全な使い方

この一覧の版と異なる拡張JavaScriptを単独で差し替えないでください。version付きStandard SB3、
保存済みopcode、member構成とmanifestを組にして管理します。rc.16はCamera Sourceのlease経路に不具合があるため、
ポーズ作品には使いません。サンドボックスで開いた場合はパレットの案内に従い、開き直して
「サンドボックスなしで実行する」を有効にします。

汎用feature flagは既定OFFです。Standard productionは`dsl4TurboWarpActionSurface`と
`dsl4TurboWarpStateSurface`を含む起動時snapshotを明示して有効にします。
読取状態のblockはruntimeの所有状態を公開し、生の例外・カメラdevice ID・内部handleを公開しません。

## 旧版のパレット画像

次の画像はrc.5／rc.7を撮影した履歴資料です。現在のmember数・opcode・ブロック数の正本は上のrc.25表です。
画像へ新しいブロックを合成せず、撮影版を保持します。

![TurboWarpの集約パレットに表示されたKamishibai DSL 4.0 Runtimeの23ブロック](../images/dsl4-palette-kamishibai-runtime.jpg)

![TurboWarpの集約パレットに表示されたAsset Cache 0.11.0の23ブロック](../images/dsl4-palette-asset-manager.jpg)

![TurboWarpの集約パレットに表示されたAsync Input 0.4.0の9ブロック](../images/dsl4-palette-async-input.jpg)

![TurboWarpの集約パレットに表示されたBubble 0.7.0の28ブロック](../images/dsl4-palette-bubble.jpg)

![TurboWarpの集約パレットに表示されたRuntime Expression 0.4.0の3ブロック](../images/dsl4-palette-runtime-expression.jpg)

![TurboWarpの集約パレットに表示されたSVG Text 0.5.0の2ブロック](../images/dsl4-palette-svg-text.jpg)

![TurboWarpの集約パレットに表示されたTurboWarp Teachable Machine 3.5.1の37ブロック](../images/dsl4-palette-tmpose.png)


## 次回4.0プレリリースの音声再生

rc.38の次の4.0プレリリース向けに、`audio`で停止状態の音声をIDへ準備し、`audioControl`で個別に再生・停止・一時停止・再開・シーク・音量・ミュート・速度を操作する構成を追加します。再生時は`fadeIn`・`volume`・`fadeOut`、停止時は`fadeOut`を指定できます。音量は100が既定で0以上の有限数、100超は増幅です。

対応するブロックは次の2つです。空の追加入力は省略・継承を表します。

- `prepare audio [ID] from [SOURCE_TYPE] [SOURCE] fade in [FADEIN] seconds volume [VOLUME] % fade out [FADEOUT] seconds`
- `audio [ID] [OPERATION] value [VALUE] fade in [FADEIN] seconds volume [VOLUME] % fade out [FADEOUT] seconds`

旧BGM/SEの命令と寿命・crossfadeは維持します。scene単位の新しい音声IDと、sceneを跨ぐ旧BGMは寿命が異なるため、既存作品のBGMを一律に置換しません。詳細は[音声再生ガイド](../dsl-author-guides/dsl-4.0-audio-guide.md)を参照してください。

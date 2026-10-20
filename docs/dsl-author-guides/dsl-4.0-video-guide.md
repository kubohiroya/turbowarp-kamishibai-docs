# DSL 4.0 動画再生ガイド（実験機能）

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: 台本やブロックで動画を表示し、ほかの命令と組み合わせる作者と、動画機能を組み込む開発者。

文書基準: 公開済みアプリ `4.0.0-rc.37`、2026年10月21日。
追跡は [アプリ Issue #780](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/780) です。
[公開Standard SB3](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/)と
[npm版rc.37](https://www.npmjs.com/package/@kubohiroya/turbowarp-kamishibai-app/v/4.0.0-rc.37)に動画機能が含まれます。

台本の版は `kamishibai: '4.0'` のままです。rc.37のStandard SB3は動画が標準ONで、有効化用のURL指定は不要です。
独自のランタイムを組み込む開発者は、後述の起動設定を確認してください。

## 動画領域と再生操作

動画は、ステージ上の矩形領域として表示します。領域を作る命令と、その領域を操作する命令は別です。

| 命令           | 役割                                                   |
| -------------- | ------------------------------------------------------ |
| `video`        | ID、動画の取得元、位置、大きさを指定して領域を表示する |
| `videoControl` | 領域のIDを指定し、再生・停止・シークなどを操作する     |

素材のIDと領域のIDも別です。例えば、動画素材 `OpeningMovie` を領域 `openingMovie` に表示できます。
同じ素材を異なるIDの領域へ表示すれば、それぞれの再生位置や音量を独立して操作できます。

## 素材を登録し、終了まで再生する

作品フォルダーに `assets/opening.mp4` を置き、次の台本を `main.k4.yml` に保存します。

```yaml
kamishibai: '4.0'
assets:
  OpeningMovie:
    kind: video
    file: assets/opening.mp4
controls:
  keymaps:
    production:
      Space: navigation.nextAction
scenes:
  opening:
    - video:
        id: openingMovie
        asset: OpeningMovie
        x: 0
        y: 0
        width: 320
        height: 180
        plane: front
        zIndex: 10
    - videoControl:
        id: openingMovie
        operation: playUntilDone
    - wait: 2
```

`video` は停止状態の領域を表示します。`playUntilDone` で先頭から1回再生し、動画が終わるまで次の命令を待ちます。
この例では、終了後の最後のフレームを2秒間表示してから台本を終了します。

### `video` の指定項目

| 項目                 | 必須         | 指定する値                                  |
| -------------------- | ------------ | ------------------------------------------- |
| `id`                 | 必須         | 動画領域のID                                |
| `asset` または `url` | どちらか一つ | 素材ID、または動画ファイルを返すHTTP(S) URL |
| `x`、`y`             | 必須         | 矩形の中心のステージ座標                    |
| `width`、`height`    | 必須         | 正の数で指定する幅・高さ                    |
| `plane`              | 任意         | `front`（既定）または `background`          |
| `zIndex`             | 任意         | 同じ面での重なり順。整数、既定は0           |
| `fit`                | 任意         | `contain`（既定）または `cover`             |
| `volume`             | 任意         | 初期音量。0〜100、既定は100                 |
| `muted`              | 任意         | 消音する場合は `true`。既定は `false`       |
| `playbackRate`       | 任意         | 再生速度。0.25〜4、既定は1                  |

座標はScratchと同じ中央原点で、右向き・上向きが正です。例えば `x: 0`、`y: 0` はステージの中央です。
大きさはステージ単位で指定し、ステージの拡大縮小に追従します。

`contain` は動画全体を縦横比を保って収め、余白を黒にします。
`cover` は矩形を埋めるように拡大し、はみ出した部分を切り取ります。

## 再生方法を選ぶ

| `operation`       | 動作                                   | 次の命令へ進む時点     |
| ----------------- | -------------------------------------- | ---------------------- |
| `playUntilDone`   | 先頭から1回再生                        | 動画が終了したとき     |
| `play`            | 先頭から1回、バックグラウンド再生      | 再生開始に成功したとき |
| `loop`            | 先頭から繰り返し再生                   | 再生開始に成功したとき |
| `pause`           | 現在位置で一時停止                     | 停止したとき           |
| `resume`          | 現在位置から再開。ループ設定を維持する | 再生開始に成功したとき |
| `stop`            | 停止して先頭へ戻す                     | 停止したとき           |
| `seek`            | `seconds` で指定した位置へ移動         | 再生位置を設定したとき |
| `setVolume`       | `volume` で音量を変更                  | 変更したとき           |
| `setMuted`        | `muted` で消音を切り替える             | 変更したとき           |
| `setPlaybackRate` | `rate` で再生速度を変更                | 変更したとき           |

`play` と `loop` は、動画を動かしたまま後続の台詞や待機へ進めます。
`playUntilDone` を同じ直列の台本で使うと、その後の命令は動画終了後に実行されます。

### 直接URLの動画をバックグラウンドで再生する

次は `scenes` 内の命令列の例です。`https://example.com/opening.mp4` は説明用なので、
実際の動画ファイルのURLに置き換えてください。

```yaml
- video:
    id: openingMovie
    url: 'https://example.com/opening.mp4'
    x: 0
    y: 0
    width: 320
    height: 180
    muted: true
- videoControl: {id: openingMovie, operation: play}
- wait: 5
- videoControl: {id: openingMovie, operation: stop}
```

動画を開始してから5秒待ち、停止します。5秒より短い動画は自然に終了し、最後のフレームを表示します。
停止後も領域は残ります。同じIDで `video` を実行すると、前の領域を置き換えます。

### ループ、一時停止、位置・音量・速度の変更

領域 `openingMovie` を作成した後に、次の命令を使用できます。

```yaml
- videoControl: {id: openingMovie, operation: loop}
- wait: 3
- videoControl: {id: openingMovie, operation: pause}
- videoControl: {id: openingMovie, operation: seek, seconds: 1.5}
- videoControl: {id: openingMovie, operation: setVolume, volume: 35}
- videoControl: {id: openingMovie, operation: setMuted, muted: false}
- videoControl: {id: openingMovie, operation: setPlaybackRate, rate: 1.5}
- videoControl: {id: openingMovie, operation: resume}
- wait: 5
- videoControl: {id: openingMovie, operation: stop}
```

シークの秒数は0以上で、動画の長さが判明している場合はその範囲内にします。
音量は0〜100、速度は0.25〜4です。`muted` は文字列ではなく `true` または `false` にします。
`play`、`playUntilDone`、`loop` は先頭から始めます。一時停止やシークの位置から続ける場合は `resume` を使います。

## 重なりと領域の寿命

`plane: front` はステージ前面の動画領域です。クリックやタッチ入力を横取りしません。
`plane: background` はステージ背景の上、スプライトの下へ描きます。
スプライトの間へ動画を自由に挿入する指定はありません。

`zIndex` は同じ `plane` の動画同士を並べる値で、大きいほど手前です。指定しない場合は0です。
同じ値の領域は後から表示したものを手前にします。同じIDを置き換えた場合も新しい表示として扱います。
負の整数も指定でき、範囲は -9007199254740991〜9007199254740991 です。
`zIndex` が大きくても背景側の動画がスプライトより手前になることはありません。
例えば `plane: background`、`zIndex: 10` は、背景側で `zIndex: 0` の動画より手前に表示します。

IDの有効範囲は現在のシーンです。シーン切替、台本の終了・中止、タイトルへ戻る操作で、動画を停止して領域を削除します。
バックグラウンド再生も同じ寿命です。`play` の直後にシーンを終えると、その時点で動画も終了します。
動画を続けながらほかの演出を見せる場合は、同じシーンに後続の命令を配置します。
同時に表示できる動画領域は32個までです。

## 動画素材と配布方法

動画素材は `kind: video` で宣言します。対応するファイル形式はMP4とWebMです。
実際に再生できるコーデックはブラウザによって異なるため、利用するブラウザと端末で確認してください。

ローカルファイルは作品に同梱します。Web上の素材を既存の素材管理経路へ載せる場合は、次のように宣言します。
これは `assets` 部分の例です。

```yaml
assets:
  OpeningMovie:
    kind: video
    delivery: remote
    source:
      url: 'https://example.com/opening.mp4'
```

素材の配布設定や内容の固定は[アセット変換ガイド](dsl-4.0-asset-conversion-guide.md)を参照してください。
直接の `url` 指定は動画をそのままブラウザで読むため、素材の内容検証・キャッシュ・同梱の対象に入りません。
ネットワーク禁止の配布設定では直接URLの指定を拒否します。オフライン配布には同梱した動画素材を使います。

背景側の描画では動画のフレームを読み出すため、別のサイトの動画には配信元のCORS許可が必要です。
動画共有サイトのページURLは動画ファイルのURLとしては使えません。

## TurboWarpのブロックで指定する

対応実装には、次の2ブロックがあります。次は入力欄の名前を示す表記です。

```text
show video [ID] from [SOURCE_TYPE] [SOURCE] x [X] y [Y] width [WIDTH] height [HEIGHT] plane [PLANE] z-index [ZINDEX]
video [ID] [OPERATION] value [VALUE]
```

`SOURCE_TYPE` は `asset` または `url`、`SOURCE` は素材IDまたはURLです。
`OPERATION` に上の表の操作名を指定します。`VALUE` は、シークなら秒数、音量なら0〜100、
速度なら0.25〜4、消音なら `true` / `false` を指定します。値を使わない再生・停止操作では空欄にします。

`PLANE` は `front` または `background`、`ZINDEX` は同じ面の動画の重なり順です。
`fit`、初期音量、消音、速度は、ブロック台本の既存の命令オプションから設定できます。
素材IDで表示する場合は、動画ファイルの内容を作品に同梱する準備も必要です。

## 独自ランタイムの起動設定と切り戻し

独自にランタイムまたはStandard app shellを作成し、動画を有効にするときは、起動設定 `featureFlags` に次の値を指定します。
ほかの起動設定は維持してください。

```json
{"dsl4Runtime": true, "dsl4Video": true}
```

この設定は台本のYAMLに書くものではありません。起動時に固定し、再生途中に変更しません。
rc.37のStandard SB3ではこの有効化操作は不要です。YAMLのfieldやCLIオプションとしては指定しません。
無効に戻す場合は `dsl4Video: false` にして起動し直します。
動画命令・動画素材を含む台本は `K4-VIDEO-DISABLED` で拒否し、動画を使わない台本の実行経路を維持します。

## 再生できないとき

| 状況・診断                         | 確認すること                                                 |
| ---------------------------------- | ------------------------------------------------------------ |
| `K4-VIDEO-DISABLED`                | 動画に対応した実装と、起動時の `dsl4Video` 設定を確認する    |
| `K4-VIDEO-ID`                      | 同じシーンで、そのIDの領域を先に作成したか確認する           |
| `K4-VIDEO-ASSET`                   | 素材ID、`kind: video`、ファイルの同梱・準備を確認する        |
| `K4-VIDEO-AUTOPLAY`                | 音声付き動画の自動再生がブラウザに拒否されていないか確認する |
| `K4-VIDEO-MEDIA` / `K4-VIDEO-PLAY` | URLの応答、ファイル形式、コーデック、ネットワークを確認する  |
| `K4-VIDEO-RENDER`                  | 背景側の描画で配信元のCORS許可と描画環境を確認する           |
| `K4-VIDEO-SEEK`                    | 動画の長さに対してシーク位置が範囲内か確認する               |

音が不要な動画は `muted: true` で表示できます。消音せず再生したい場合は、
利用するブラウザのメディア再生許可と、利用者の操作を起点とした再生条件を確認してください。
動画の音量・ミュートは、その動画だけに適用し、BGMや効果音には適用しません。

## 検証範囲

動画の操作、素材の読み込み・解放、台本とブロックの対応を自動検証します。
Chromiumでは実動画の再生と描画を検証します。各公開アプリ画面、端末別の音声付き自動再生条件、
アセットグループ・保存データ・分割台本との実接続は、それぞれの依存機能と合わせて確認する項目です。

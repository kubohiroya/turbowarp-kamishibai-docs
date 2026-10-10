# DSL 4.0 rc.5 実装ビジュアル記録

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

記録日: 2026年8月15日\
管理Issue: [#157](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/157)

## 記録の位置付け

この記録は、公開プレリリース`v4.0.0-rc.5`の固定commitから起動した実local previewと、同じ実装を
sourceからruntime・live reloadまで追跡して作成した図を固定します。安定版`v4.0.0`の公開を示す記録では
ありません。画面はdevelopment-only previewであり、配布作品の通常再生surfaceとは区別します。

この更新では`turbowarp-kamishibai-samples`を取得、build、変更していません。実装repositoryの既存smoke projectを
一時directoryへcopyし、文書repositoryには画像・SVG・説明だけを収録しました。
TurboWarpの集約パレット図版は、同じ固定SB3をTurboWarp Editorで開き、7 memberのセパレータ境界で切り出しました。

## 再現元

| 項目                    | 固定値                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| runtime repository      | `kubohiroya/turbowarp-kamishibai-app`                              |
| tag                     | `v4.0.0-rc.5`                                                      |
| runtime commit          | `f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6`                         |
| 公開base SB3            | `kamishibai-4.0.0-rc.5.sb3`                                        |
| base SB3 SHA-256        | `2494b43f43f7b7acbd1ce9d307fcff383d239931aa46de550f76c3eb3ec40f3c` |
| source manifest SHA-256 | `076bb9bf406b4163880264e5e1125b9f8ffc93fa7bdc4bc78a9ccb1aabbc7b65` |
| capture YAML SHA-256    | `3ccec425ad2003db79d7c4db132e3a192dac44b8275fd5350ec252d6839c8340` |
| source summary          | 2 scenes、4 actions、0 warnings                                    |
| samples repository      | 使用せず                                                           |

## 撮影条件

- command: rc.5の`preview-dsl4 --watch`
- URL: 一回限りの認証情報を持つ`127.0.0.1` loopback preview
- browser surface: Codex In-app Browser
- viewport: 1280×720 CSS px
- base: 公開`kamishibai-4.0.0-rc.5.sb3`
- control profile／channel: `production`／`bundled`
- camera: 許可せず、実映像を収録しない
- 個人情報: runtimeタイトルは連絡先を含まない上部480×220だけを収録
- path／token: 画面、画像、文書へ絶対pathや認証tokenを記録しない
- format: browser captureをdecodeし、pixel寸法を変えずPNGへ格納。タイトルだけ矩形crop

正常画面の取得後、copyしたYAMLの`kamishibai`だけを`'4.0'`から`'4.1'`へ変更し、同じsessionで
`K4-VERSION-001`を観測しました。その後`'4.0'`へ戻し、`VALID`、`Watching`、同じcurrent integrityへ
復旧したことを確認しています。一時sourceの変更はdocsにも実装repositoryにも残していません。

## 実動作スクリーンショット

| file                                          |    pixel | SHA-256                                                            | 観測した状態                                                      |
| --------------------------------------------- | -------: | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `docs/images/dsl4-rc5-preview-running.png`    | 1280×720 | `0dcdaa7868ab8ade918acf1f3cae1114edb563bffe47d68e050b5fe975805a91` | valid immutable source、2 scenes、4 actions、0 warnings、Watching |
| `docs/images/dsl4-rc5-runtime-title.png`      |  480×220 | `c5e7b05d9c74b1106c7caf7941aa01db4f219087806dc09f0663d4ba975ca661` | `Version 4.0.0-rc.5 (2026/08/15)`                                 |
| `docs/images/dsl4-rc5-preview-diagnostic.png` | 1280×720 | `0635c284d021995ce2a906758dbca389a581abcb9bd7c447bea90b95ddfc21bb` | `K4-VERSION-001`、invalid、Error、current integrity維持           |

![rc.5のimmutable sourceがvalidかつrunning、reload statusがWatchingのlocal preview](docs/images/dsl4-rc5-preview-running.png)

![参加型AI紙芝居とVersion 4.0.0-rc.5を表示したruntimeタイトル](docs/images/dsl4-rc5-runtime-title.png)

![invalid version candidateをcurrentへcommitせずK4-VERSION-001を表示したlocal preview](docs/images/dsl4-rc5-preview-diagnostic.png)

## TurboWarp集約パレットのスクリーンショット

- source: TMPose以外は上記の固定`kamishibai-4.0.0-rc.5.sb3`。TMPoseは公開`kamishibai-4.0.0-rc.7.sb3`
- browser surface: TurboWarp Editor。TMPoseのblock labelはextension原文の英語表示
- viewport: rc.5は3840×2160 px、TMPose rc.7は3840×2416 px
- capture: 集約パレットの`◆ member名 [member ID] ◆`から次のmemberセパレータ直前まで
- pointer: パレット外へ退避
- format: browser captureをpixel寸法を変えず格納。TMPose rc.7はPNG、既存rc.5証跡はJPEG
- 内容: 表示順を変更せず、右端の見切れとscroll barを実UIのまま保持

| file                                              |    pixel | blocks | SHA-256                                                            |
| ------------------------------------------------- | -------: | -----: | ------------------------------------------------------------------ |
| `docs/images/dsl4-palette-kamishibai-runtime.jpg` | 251×1251 |     23 | `8cda702470f38ecc2e1cc4ff5620aeddc6c4137a950e23957299bc0a4f64b067` |
| `docs/images/dsl4-palette-asset-manager.jpg`      | 251×1198 |     23 | `2e7368e25d39ff94eed8067a9d92caa67bf70f594d229a5a4889dfbfdda30888` |
| `docs/images/dsl4-palette-async-input.jpg`        |  251×533 |      9 | `7c15d03fd84357fd679c6b24290c73762d75f857b1c0508064f3ff02f5211a86` |
| `docs/images/dsl4-palette-bubble.jpg`             | 251×1497 |     28 | `11d28c9b09668f5e4be96d5f02ef85fd35384f44df120132246c0ec62bcdb8a1` |
| `docs/images/dsl4-palette-runtime-expression.jpg` |  251×214 |      3 | `8ac2b3a724b8ffc79bce9940bc83498f3be97224dcdf01b353adfa2108fd413f` |
| `docs/images/dsl4-palette-svg-text.jpg`           |  251×174 |      2 | `be690017012cb1a41b40e01e6d697b9d294fb5d7bc912a53b7eab0989a4d8d75` |
| `docs/images/dsl4-palette-tmpose.png`             | 251×1761 |     37 | `3c80c64adcd01e9af2d04e968caebfeb0081f84a7a349cbdb88c66a8422cec26` |

合計は125ブロックです。Async Inputのsourceにあるpose listener 3 blockは`poseInput`が既定OFFのため表示されず、
`listenForActorTouchAndBroadcast`が表示されることを実パレットとDOMの両方で確認しました。

## 実装解析図

図はすべて固定commit`f323a54`のsourceと対応testを直接確認して作成しました。HTMLやJavaScriptに依存しない
SVGとし、Web、狭幅表示、印刷版で同じ情報を保持します。

| file                                                | SHA-256                                                            | 主な実装根拠                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| `docs/images/dsl4-architecture.svg`                 | `f52760550de64e986fd5ec560895065c5bc5ffe38189b38bab259a1a4a9b89cb` | Source Graph、frontend、StoryDocument、runtime、port、platform |
| `docs/images/dsl4-source-build-sequence.svg`        | `f068ad123ac046ca81fbc70375e6d39b17ad8e5a43e4290b4751fad32189137e` | parse gate、validator、immutable IR、build再検証               |
| `docs/images/dsl4-runtime-state-transition.svg`     | `a3b8c8e6d721148abedf1efa5921f96d633d190a89d4d9341be247154d49cbc5` | 一つのgenerationの`RuntimeStatus`と再生状態                    |
| `docs/images/dsl4-runtime-sequence.svg`             | `ffca3dcaf77ea464fb6dfd935bd62cefd3ec436abfd2312091b26ae783490195` | startup、asset prepare、action dispatch／commit、release       |
| `docs/images/dsl4-live-reload-state-transition.svg` | `5791b077856e6fe882e3920d411e28d443c513da4e728e1ce2658bfabb142a8c` | currentとcandidateを調停する`LiveReloadSession`の7状態         |
| `docs/images/dsl4-live-reload-sequence.svg`         | `fa287d98d46880c43a18768aa02e22c8aa4f76c2dc554b09a8fff950cc544c99` | validate、quiesce token、plan、defer／commit                   |
| `docs/images/dsl4-asset-reload-sequence.svg`        | `65c1abdb6f637f761c7d3ba4ce49bdf16e4e3df84bca51693dcd93f7e08649e1` | prepare、activate、ack、rollback、旧世代release                |

主な確認点は次のとおりです。

1. `source-graph.js`と`source-graph-frontend.js`がentryとincludeを有限探索し、宣言元を保持する。
2. `source-frontend.js`がrestricted YAML、Schema、semantic、expression、resource limitを順に検査する。
3. `story-document.js`が成功結果だけを正規化し、deep-freezeしたruntime IRにする。
4. `runtime-controller.js`が6つの`RuntimeStatus`、generation guard、action event、quiesce境界を所有する。
5. `runtime-startup.js`と`navigation-session.js`がcomponent、environment、input、historyをsessionへ束ねる。
6. `platform/`がasset、media、Actor、SVG Text、input、poseをport契約へ変換する。
7. `live-reload-session.js`がinvalid candidateをcurrentから分離し、安全境界でnext sessionへ切り替える。
8. `asset-reload-transaction.js`がcommit acknowledgement後にだけ旧asset generationをreleaseする。

## 表示検証

- SVGは`xmllint`でwell-formedを確認し、InkscapeでPNGへrenderして文字切れ・要素重なりを目視確認する。
- 内部仕様書の全SVGに`title`、`desc`、意味のあるMarkdown altを持たせる。
- スクリーンショットはPNGまたはJPEG signature、pixel、SHA-256を自動testで固定する。
- 320 px狭幅では画像をcontent幅へ縮小し、ページ横overflowを発生させない。
- 公開HTMLとA4組版で図の欠落、分断、captionの孤立がないことを確認する。

## 再取得

1. runtimeを`v4.0.0-rc.5`へ固定し、HEADが完全commitと一致することを確認する。
2. 公開base SB3のSHA-256を照合する。
3. 文書repositoryとsamples repositoryの外へ追試用projectをcopyする。
4. `preview-dsl4 --watch`を1280×720で開き、`VALID`と`Watching`をcaptureする。
5. 舞台上部から連絡先を含まない480×220だけをcropする。
6. copy側のversionだけを`4.1`へ変え、`K4-VERSION-001`とcurrent integrity維持をcaptureする。
7. `4.0`へ戻して復旧を確認し、preview processを停止する。
8. PNG pixel、SHA-256、SVG render、公開HTML、A4を再検証する。
9. 固定SB3をTurboWarp Editorで開き、集約パレットをmemberセパレータ単位で撮影する。
10. 7 JPEGのpointer退避、block数、pixel、SHA-256、章頭配置を再検証する。

画像または図を更新するときはhashだけを書き換えず、実装commit、入力、撮影条件、図の根拠sourceとtestの
どれが変わったかを同じcommitで記録します。

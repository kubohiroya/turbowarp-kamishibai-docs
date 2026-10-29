# 一般・DSL作成者・開発者向け文書のライセンス

Copyright © 2026 Hiroya Kubo.

個別に異なる表示がある場合を除き、`docs/user-guides/`、`docs/tutorials/`、
`docs/dsl-author-guides/`、`docs/developer-guides/`以下の文書と`docs/images/`の共有図版は
[Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/)
（CC BY-SA 4.0）で提供します。

再利用時は、著作者名「Hiroya Kubo」、文書名、一次配布元
<https://github.com/kubohiroya/turbowarp-kamishibai-docs>、ライセンス名とそのURLを表示し、
変更した場合は変更内容を示してください。改変物を配布する場合は、CC BY-SA 4.0が
定める同一ライセンス条件を適用してください。

文書内で参照するソフトウェアのソースコード、第三者の著作物、個別にライセンスを
表示した素材には、それぞれのライセンスまたは利用条件が適用されます。

## TurboWarp Extension Galleryのバナー

次の図版は
[TurboWarp/extensionsの固定commit `9c0ae4f`](https://github.com/TurboWarp/extensions/tree/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a)
から内容を変更せず、ファイル名だけを変更して収録した第三者素材です。

- `images/extension-gallery-consoles.svg`
- `images/extension-gallery-temporary-variables.svg`
- `images/extension-gallery-text.svg`
- `images/extension-gallery-local-storage.svg`
- `images/extension-gallery-more-timers.svg`
- `images/extension-gallery-files.svg`
- `images/extension-gallery-animated-text.svg`

これら7図版にはCC BY-SA 4.0ではなく、引用元の
[Mozilla Public License 2.0](../LICENSES/MPL-2.0.txt)（MPL-2.0）が適用されます。
図版を含む生成PDFやHTMLでも、該当図版部分のライセンスは変わりません。

## TurboWarp Bubbleの説明図

次の図版は
[kubohiroya/turbowarp-bubbleの固定commit `ad5b008`](https://github.com/kubohiroya/turbowarp-bubble/tree/ad5b008e89f95c0182977f3e2e77d58fc2041b16/docs/assets)
から内容を変更せず、ファイル名へ`turbowarp-bubble-`を付けて収録した第三者素材です。

- `images/turbowarp-bubble-bubble-style-gallery.svg`
- `images/turbowarp-bubble-placement-guide.svg`
- `images/turbowarp-bubble-actor-transform-guide.svg`
- `images/turbowarp-bubble-animation-mode-guide.svg`

これら4図版にはCC BY-SA 4.0ではなく、引用元の
[Mozilla Public License 2.0](../LICENSES/MPL-2.0.txt)（MPL-2.0）が適用されます。
図版を含む生成PDFやHTMLでも、該当図版部分のライセンスは変わりません。

## 機能拡張ガイドの実画面キャプチャ

`images/extension-editor-svg-text.png`を除く`images/extension-editor-*.png`の15図版は、2026年8月4日に
[TurboWarp Editor](https://turbowarp.org/editor)で
[TurboWarp紙芝居 Version 3.1.9のSB3](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v3.1.9)
を開き、2560×1440の表示領域で撮影し、説明対象の前後だけを切り出した
画面キャプチャです。対応するproject sourceは
[固定commit `b8de78a`](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json)
で確認できます。

`images/extension-editor-svg-text.png`は、2026年8月4日に
[SVG Text日本語図解ガイド](https://kubohiroya.github.io/turbowarp-svg-text/ja/)の、say、think、
SVG text actorの使用例を同一範囲で撮影した画面キャプチャです。対応する機能拡張は
[`@kubohiroya/turbowarp-svg-text@0.1.0`](https://www.npmjs.com/package/@kubohiroya/turbowarp-svg-text/v/0.1.0)です。

図版中のTurboWarp Editor UI、Scratch block由来の視覚要素、機能拡張およびアプリの
block実装には、それぞれの権利者によるライセンスまたは利用条件が適用されます。
この文書のCC BY-SA 4.0表示は、それら第三者要素を別途再許諾するものではありません。

## 共通セキュリティダイアログの実画面

`images/security-dialog/rc41-modes.png`と`images/security-dialog/rc41-mode-detail.png`は、
2026年10月24日に[TurboWarp-Plus-Editorの旧配信サイト](https://kubohiroya.github.io/turbowarp-extension-data-editor/editor.html?lang=ja)で
公開済みの無改変rc.41 SB3を開いて撮影した画面です。操作対象部分だけをブラウザーで直接撮影し、文字やアイコンを合成していません。
Editor build、公開SB3の取得元・hash、撮影条件、画像hashは`sources/dsl4/security-dialog-20261024.json`に記録しています。
`images/security-dialog/rc53-multiple-ja.png`、`rc53-multiple-en.png`、`rc53-runtime-ja.png`、`rc53-startup-ja.png`は、2026年10月25日に同じTurboWarp-Plus-Editorの旧配信サイトで撮影した実画面です。公開npmのCamera Source 0.19.3・Asset Cache 0.3.1・Bubble 0.13.4と、公開rc.53 SB3を使用しています。日英ダイアログ、無効化理由と必須表示、許可後の起動を確認し、撮影条件と画像hashを`sources/dsl4/security-dialog-20261025.json`へ記録しています。画像の合成や表示内容の差し替えは行っていません。

`images/security-dialog/rc55-runtime-ja.png`と`rc55-startup-ja.png`は、2026年10月25日に公開rc.55 SB3を同じTurboWarp-Plus-Editorの旧配信サイトで開いて撮影した無改変の実画面です。取得元・SB3 hash・Editor build・画像hash・日英の起動と停止/再起動の確認条件は`sources/dsl4/security-dialog-rc55-20261025.json`へ記録しています。

`images/security-dialog/localized-descriptions-ja-20261025.png`と`localized-descriptions-en-20261025.png`は、2026年10月25日に更新後のTurboWarp-Plus-Editorの旧配信サイトで撮影した未加工の実画面です。単体公開版Camera Source 0.19.4・Asset Cache 0.3.2・Bubble 0.13.5の説明を日英で表示しています。取得元・各版・Editor revision・画像hashを`sources/dsl4/security-dialog-descriptions-20261025.json`に記録しています。以前のrc.53/rc.55の同梱版を示す画像・台帳とは別の証跡です。

画面内のUI・アイコン・ロゴ等には、それぞれの権利者のライセンスまたは利用条件が適用されます。
図版としての選択とcaptionには本書のCC BY-SA 4.0を適用しますが、画面内の要素を別途再許諾するものではありません。

## DSL 4.0 rc.5実装スナップショットと図

次の3図版は、2026年8月15日に`tmpose-kamishibai@v4.0.0-rc.5`のlocal previewを実行して取得した
画面キャプチャです。

- `images/dsl4-rc5-preview-running.png`
- `images/dsl4-rc5-runtime-title.png`
- `images/dsl4-rc5-preview-diagnostic.png`

次の7図版は、同じ固定commitの実装解析から本repository向けに作成したSVGです。

- `images/dsl4-architecture.svg`
- `images/dsl4-source-build-sequence.svg`
- `images/dsl4-runtime-state-transition.svg`
- `images/dsl4-runtime-sequence.svg`
- `images/dsl4-live-reload-state-transition.svg`
- `images/dsl4-live-reload-sequence.svg`
- `images/dsl4-asset-reload-sequence.svg`

runtime commit、公開SB3 hash、入力hash、撮影条件、各画像とSVGのhashは
[`DSL4-IMPLEMENTATION-VISUALS.md`](../DSL4-IMPLEMENTATION-VISUALS.md)に記録しています。samples
repositoryはこの撮影に使用していません。

キャプチャ内のTurboWarp紙芝居ランタイム、UI、base runtimeとsmoke projectの素材は、引用元の
Mozilla Public License 2.0（MPL-2.0）の適用範囲を保持します。図版としての選択、切り出し、captionと
実装解析SVGには本書のCC BY-SA 4.0を適用しますが、キャプチャ内のMPL-2.0対象要素を別途再許諾する
ものではありません。

## Noto Sans JP

`fonts/NotoSansJP-VF.ttf`は、
[Google Fontsの固定commit `2796410`](https://github.com/google/fonts/tree/2796410152d4f9524b68ed46e69c1b60f8e0f7c3/ofl/notosansjp)
から内容を変更せず収録した第三者フォントです。日本語字形をPDFへ確実に埋め込み、
build環境や閲覧環境によって文字が四角形へ置換されることを防ぐために使用します。

このフォントにはCC BY-SA 4.0ではなく、
[SIL Open Font License 1.1](fonts/NotoSansJP-OFL.txt)（OFL-1.1）が適用されます。
フォントを含む生成PDFやHTMLでも、フォント部分のライセンスは変わりません。

`images/security-dialog/rc56-runtime-ja.png`と`rc56-startup-ja.png`は、2026年10月25日に公開rc.56 SB3をTurboWarp-Plus-Editorの旧配信サイトで開いて撮影した無改変の実画面です。取得元・SB3 hash・Editor build・画像hash・日英の起動と停止/再起動の確認条件は`sources/dsl4/security-dialog-rc56-20261025.json`へ記録しています。旧版の画像と証跡は保持しています。

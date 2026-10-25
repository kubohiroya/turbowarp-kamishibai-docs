# TurboWarp Teachable Machine Extension ID 移行ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

4.0の現行実装基準は`4.0.0-rc.25`（`a68f8dc4`）です。版別の配布状況は[4.0リリース履歴](../dsl-author-guides/dsl-4.0-history.md)を参照してください。以下の履歴・他系列の記録は、それぞれに明記した版を対象にします。

対象: TurboWarp-Kamishibai 4.0 系列と、TurboWarp Teachable Machine を使う SB3 / DSL 4.0 配布物\
関連Issue: [TurboWarp Teachable Machine #79](https://github.com/kubohiroya/turbowarp-teachable-machine/issues/79)、[TurboWarp-Kamishibai #661](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/661)、[sb3-toolchain #50](https://github.com/kubohiroya/sb3-toolchain/issues/50)

## 日本語

TurboWarp Teachable Machine の現行 Extension ID は `kubohiroyatm` です。TurboWarp-Kamishibai と TurboWarp紙芝居文書では、製品名を
TurboWarp-Kamishibai / TurboWarp紙芝居、認識拡張名を TurboWarp Teachable Machine、repository slug を `turbowarp-kamishibai-app` として扱います。
DSL 4.0の固定公開基準は `v4.0.0-rc.8` で、current migrationはこの固定snapshotへ注記を重ねる形で扱います。

| 区分               | 現行表記                       | 用途                                     |
| ------------------ | ------------------------------ | ---------------------------------------- |
| Product name       | TurboWarp-Kamishibai           | 英語本文、公開サイト、repository説明     |
| 日本語一般名称     | TurboWarp紙芝居                | 日本語本文、ワークショップ以外の通常文書 |
| Recognition        | TurboWarp Teachable Machine    | ポーズ認識拡張の人間向け名称             |
| Extension ID       | `kubohiroyatm`                 | SB3内のextension identifier              |
| Opcode prefix      | `kubohiroyatm_...`             | SB3内のblock opcode                      |
| Current repository | `turbowarp-kamishibai-app`     | GitHub repository、Pages、文書内リンク   |
| Docs repository    | `turbowarp-kamishibai-docs`    | この文書repository                       |
| Samples repository | `turbowarp-kamishibai-samples` | サンプル台本と実行可能作品               |

### 変更対象

移行対象は SB3 内の extension identifier と opcode prefix です。JavaScript artifactを差し替えるだけでは、
既存SB3のblock opcode、extension entry、monitor、変数参照が古い識別子を参照したまま残るため不十分です。
`sb3-toolchain` の移行planで SB3を解析し、変換対象を一覧化してから更新します。

### version boundary

`kubohiroyatm` は TurboWarp Teachable Machine #79 で確定した現行IDです。TurboWarp-Kamishibai #661 はこのIDへ追随するruntime /
artifact migrationを扱います。固定済みの3.2 / 4.0 prerelease snapshotやrelease historyは履歴として維持し、
current guideでは新しいIDだけを案内します。

TurboWarp-Kamishibaiが同梱するExtension IDは `v4.0.0-rc.10` で切り替わりました。手元の配布物がどの系列かで移行の要否が変わります。

| 系列                        | Extension ID   | 移行の要否                    |
| --------------------------- | -------------- | ----------------------------- |
| 3.2系（3.2.3の固定release） | `tmpose`       | 対象外。凍結releaseとして維持 |
| 4.0系 `v4.0.0-rc.9` 以前    | `tmpose`       | 移行が必要                    |
| 4.0系 `v4.0.0-rc.10` 以降   | `kubohiroyatm` | 移行済み                      |

`v4.0.0-rc.10` は TurboWarp Teachable Machine の依存を `@kubohiroya/turbowarp-tm@2.0.0` へ更新し、SB3内のExtension IDを `kubohiroyatm` へ切り替えた版です。`v4.0.0-rc.9` 以前は `tmpose` のままです。

DSL 4.0の固定公開基準 `v4.0.0-rc.8` はこの境界より前のため、Extension IDは `tmpose` のままです。現行実装基準 `4.0.0-rc.25` は `kubohiroyatm` なので、固定公開基準を参照した配布物と現行実装では識別子が異なります。固定公開基準のSB3を新しいIDの拡張と組み合わせる場合も移行が必要です。恒久aliasは導入しないため、識別子が一致しないSB3はmissing blockになります。

手元のSB3がどちらの識別子を使っているかは、`sb3-toolchain` の移行planで extension entry を一覧化すると判定できます（「手順」の2）。planは変更対象を列挙するだけで、SB3を書き換えません。

3.2系は移行対象ではありません。凍結releaseとして `tmpose` のまま維持し、変換しないでください。

### 手順

1. 対象SB3と対応するTurboWarp-Kamishibai versionを固定する
2. `sb3-toolchain` のmigration planで extension entry、opcode、monitor、変数参照を列挙する
3. 変換結果で Extension ID が `kubohiroyatm`、opcode prefix が `kubohiroyatm_` へ揃ったことを確認する
4. 変換後SB3を TurboWarp Editor と Web Preview の両方で開く
5. カメラ許可、モデル読み込み、認識結果、scene transition、rollback用の旧release再生を確認する

### 確認方法

- SB3内の extension list に `kubohiroyatm` が一度だけ現れる
- TurboWarp Editor の拡張パレットに TurboWarp Teachable Machine のblockが表示される
- 認識結果が Async Input と runtime transitionへ届く
- `turbowarp-kamishibai-app` Pages、`turbowarp-kamishibai-docs` Pages、`turbowarp-kamishibai-samples` Pagesのリンクが現在URLを指す

### rollback

問題があれば、移行前SB3と対応するTurboWarp-Kamishibai releaseへ戻します。文書側はこのguideとcurrent annotationを
revertすればよく、固定済みのsource snapshot、release history、workshop配布物は変更しません。

## English

The current Extension ID for TurboWarp Teachable Machine is `kubohiroyatm`. TurboWarp-Kamishibai documentation uses TurboWarp-Kamishibai as the
English product name, TurboWarp紙芝居 as the Japanese product name, TurboWarp Teachable Machine as the recognition extension name, and
`turbowarp-kamishibai-app` as the current repository slug.

The migration target is the SB3 extension identifier and opcode prefix. Replacing the JavaScript artifact alone is not
enough because existing SB3 files still contain extension entries, block opcodes, monitors, and variable references.
Use the `sb3-toolchain` migration plan to inspect each SB3 first, then rewrite the identifiers.

The new boundary is defined by TurboWarp Teachable Machine #79 and followed by the TurboWarp-Kamishibai runtime / artifact migration in
TurboWarp-Kamishibai #661. Versioned 3.2 and 4.0 prerelease snapshots remain historical records; current guides should point
to `kubohiroyatm` only.

The bundled Extension ID changed in TurboWarp-Kamishibai `v4.0.0-rc.10`. Whether a distribution needs migration depends on which line it came from.

| Line                                  | Extension ID   | Migration                       |
| ------------------------------------- | -------------- | ------------------------------- |
| 3.2 series (the frozen 3.2.3 release) | `tmpose`       | Out of scope; kept frozen as is |
| 4.0 series `v4.0.0-rc.9` and earlier  | `tmpose`       | Required                        |
| 4.0 series `v4.0.0-rc.10` and later   | `kubohiroyatm` | Already migrated                |

`v4.0.0-rc.10` is the release that moved the TurboWarp Teachable Machine dependency to `@kubohiroya/turbowarp-tm@2.0.0` and switched the SB3 Extension ID to `kubohiroyatm`.

The fixed publication baseline for DSL 4.0, `v4.0.0-rc.8`, predates that boundary, so it still carries `tmpose`. The current implementation baseline `4.0.0-rc.25` carries `kubohiroyatm`, so the two baselines do not share an identifier. An SB3 built against the fixed baseline still needs migration before it runs with a current extension build, because no permanent alias keeps the old identifier loadable; a mismatched identifier shows up as missing blocks.

To tell which identifier an SB3 uses, list its extension entries with the `sb3-toolchain` migration plan. The plan only reports the pending changes and never rewrites the SB3.

The 3.2 series is not a migration target. Keep it on `tmpose` as a frozen release and do not convert it.

Verification requires the converted SB3 to contain one `kubohiroyatm` extension entry, use the `kubohiroyatm_` opcode
prefix, show TurboWarp Teachable Machine blocks in the TurboWarp Editor, pass camera/model recognition, and deliver recognition events
to Async Input and scene transitions.

Rollback uses the pre-migration SB3 and its matching TurboWarp-Kamishibai release. Documentation rollback should revert this
current guide and annotations only; historical source snapshots, release history, and workshop distributions remain
unchanged.

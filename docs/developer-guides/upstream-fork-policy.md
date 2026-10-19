# upstream fork管理方針

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

4.0の現行実装基準は`4.0.0-rc.23`（`2f2889fe`）です。版別の配布状況は[4.0リリース履歴](../dsl-author-guides/dsl-4.0-history.md)を参照してください。以下の履歴・他系列の記録は、それぞれに明記した版を対象にします。

この文書は、TurboWarp-Kamishibai ecosystemが保持する上流forkの目的、差分、利用条件、戻し方を記録します。独自extension、toolchain、applicationとは別枠で扱い、上流projectの恒久的な再実装や別製品として紹介しません。

2026年8月25日時点では、この方針は公開プレリリース`v4.0.0-rc.8`のruntime behaviorと独立しています。renderer runtimeを変更せず、上流forkの分類、pin、license、issue routingだけを文書化します。

## 正本data

上流forkの機械可読な正本は[`sources/upstream-forks.json`](https://github.com/kubohiroya/turbowarp-kamishibai-docs/blob/main/sources/upstream-forks.json)です。公開記事、ecosystem index、各repositoryの短い導線は、このdataと矛盾しない範囲で作成します。

`scratch-render` entryは次の例外profileを持ちます。

| 項目                 | 値                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| profile              | `upstream-fork`                                                                                       |
| fork repository      | [`kubohiroya/scratch-render`](https://github.com/kubohiroya/scratch-render)                           |
| immediate upstream   | [`TurboWarp/scratch-render`](https://github.com/TurboWarp/scratch-render)                             |
| original source      | [`scratchfoundation/scratch-render`](https://github.com/scratchfoundation/scratch-render)             |
| default branch       | `develop`                                                                                             |
| upstream sync branch | `TurboWarp/scratch-render` の `develop`                                                               |
| npm publish          | しない                                                                                                |
| downstream pin       | fork差分を使う場合はexact commitで固定する                                                            |
| tracking issue       | [`turbowarp-kamishibai-docs#175`](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/175) |

`kubohiroya/scratch-render` は renderer の性能測定、互換性確認、限定patchの検証に使う開発forkです。TurboWarp-Kamishibaiが renderer commitを参照する場合でも、恒久的な独自renderer distributionとして扱いません。検証が終わったpatchは、可能なら上流へ戻すか、不要であれば撤回します。

## READMEに置くべきfork status

`scratch-render` 側 README の冒頭には、少なくとも次の趣旨を置きます。このdocs repositoryだけでは `scratch-render` のREADMEを変更できないため、本文はfork repository側のPRで反映します。

```md
## Fork status

This repository is a development fork of `TurboWarp/scratch-render` used for
narrowly scoped experiments and patches required by downstream projects.
It is not a separate renderer product.
```

READMEでは、immediate upstream、original source、default branchと上流branchの対応、下流利用時のexact commit pin、一般的なTurboWarp bugの報告先、fork固有patchだけを本forkで追跡する方針を同じ節にまとめます。

## 差分管理

fork差分は、目的、関連Issue、採用理由、検証fixture、rollback commitを一組で記録します。目的のない実験branchをdefault branchへ積み上げません。

上流との差分確認は、fork側で `upstream` remoteを `TurboWarp/scratch-render` に向けてから実行します。

```sh
git remote add upstream https://github.com/TurboWarp/scratch-render.git
git fetch upstream
git log --oneline upstream/develop..HEAD
git diff --stat upstream/develop...HEAD
```

downstreamがfork commitを採用する場合は、version rangeやbranch名ではなくexact commitで固定します。採用中のpatchが不要になった場合は、TurboWarp-Kamishibai側の参照を上流commitへ戻し、rollback commitと検証結果を追跡Issueへ残します。

## Issue routing

一般的なrendererの不具合、TurboWarp本体で再現する描画問題、上流でも必要な改善は、原則として[`TurboWarp/scratch-render`](https://github.com/TurboWarp/scratch-render)へ報告します。

TurboWarp-Kamishibaiの検証中だけ必要なpatch、下流fixtureに依存する一時的な計測、上流へ持ち込む前の確認は、fork固有patchとして[`turbowarp-kamishibai-docs#175`](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/175)または関連するTurboWarp-Kamishibai側Issueへ紐付けます。

## License

`scratch-render` forkではMPL-2.0全文と上流由来のlicense noticeを維持します。Scratch Foundation由来部分のnoticeを削除せず、fork固有変更にも上流license条件を適用します。

独自extension repository向けの共通`LICENSE`テンプレートで、上流由来のnoticeを上書きしません。docs側のこの文書と`upstream-forks.json`は、TurboWarp-Kamishibai docsの既存区分に従います。

## Ecosystem indexでの表示

ecosystem indexでは、`scratch-render`を独自productやextension一覧へ混ぜません。「upstream fork / 実験基盤」として別枠に置き、次を明記します。

- TurboWarp renderer自体を独自に再実装するprojectではない
- 必要な上流調査、性能測定、patch検証のために保持するforkである
- 下流で使う場合はexact commitで固定し、採用理由とrollbackを記録する
- 可能な場合は公式TurboWarp upstreamへ戻すことを優先する

## 適用外

`upstream-fork` profileには、通常のextension repository policyをそのまま適用しません。次は対象外です。

- Extension ID
- block reference
- npm package metadataの統一
- Pages user guide

runtime behaviorを変更するpatch、npm publish、tag作成、release作成は、この文書更新の範囲に含めません。

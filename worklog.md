# Void 移行の作業記録

計画: [docs/void-migration-plan.md](docs/void-migration-plan.md)

## 2026-10-25

### 計画と初期状態の確認

- 実施: Web と API を Void に統合し、TanStack・tRPC・Hono の直接利用を外す計画を `docs/void-migration-plan.md` に保存した。
- 実施: 既存の構成・記事保存先・画像アップロード・認証・閲覧数・OGP・CI を調査した。
- 結果: 既存記事は D1 の記事情報と R2 の Markdown 本文に分かれている。ブラウザ編集・画像ペースト・即時反映を維持するため、保存先を継続利用する。
- 結果: 記事内の旧 API ドメインの画像 URL、OG 画像の HEAD、数値 ID の記事 URL の引き継ぎが必要。
- 検証: 実装開始前の `git status --short` は変更なし。`vp install` は成功し、868 パッケージの確認を完了した。
- 検証: npm の公開情報で `void` と `@void/react` の現行版がともに `1.2.1`、React アダプターの対応が Vite 8・React 19 であることを確認した。
- 状態: 実装に着手。実データの変更・本番デプロイはまだ行っていない。

### 依存導入と `void init`

- 実施: `void@1.2.1` と `@void/react@1.2.1` の導入を試した。
- 結果: `bunfig.toml` の公開後7日間のインストール制限により拒否された。公開時刻を確認し、両方を公開後7日以上経過した `1.1.11` にそろえて導入した。既存の制限は変更していない。
- 検証: `apps/web` で `vp install void@1.1.11 @void/react@1.1.11` が成功した。`void --version` は `1.1.11`。実際の型定義に Pages・loader・Actions・Form・useForm があることを確認した。
- 実施: ユーザーの提案を受け、一時フォルダ `/private/tmp/burio-void-init.AKToPw` で `void init --no-git` を実行し、Vite+・React・D1・デプロイ設定なしを選択した。
- 結果: Vite／Void／TypeScript の設定と、Pages・loader・action・Form・API・DB のサンプルを生成できた。この生成物を本体への移植の参考にする。
- 未解決: 一時フォルダ側の依存インストールは、最初にネットワークエラー、その後 pnpm 12.15.0 の起動エラーで失敗した。スターター自体の起動確認はできていない。本体の Bun による依存導入は成功している。
- 検証: `vp env doctor` は現在のグローバル Vite+ に存在せず、`Command 'env' not found` となった。
- 検証: `git worktree list` は現在の `/Users/1126buri/dev/burio.com`（staging）だけを表示。追加の Git worktree は作成していない。

### サーバー処理の移植（作業中）

- 実施: 記事の D1／R2 読み書き、数値 ID と旧 slug キーの読取、認証、閲覧数、OG 生成の共通処理を `apps/web` に移植している。
- 結果: 旧 SQL マイグレーションを Void の自動認識対象外へ移し、既存 DB に再適用する事故を防ぐ構成にした。
- 状態: Pages・API・フォーム・設定の接続と、型検査・回帰テストはこれから行う。移植完了・動作確認済みとは扱わない。

### 移行前の公開サイト応答

- 検証: `HEAD https://burio16.com/blog` は HTTP 200、`GET https://api.burio16.com/` は `OK` を返した。
- 状態: 移行前の応答の確認のみ。新しい実装の動作を示すものではない。

### Void への接続と初回ビルド

- 実施: `void init` の生成物を参考に、React アダプター、Pages、loader／action、API、管理フォームへ移植した。
- 検証: `void prepare`、`void env types`、型検査、初回の client／SSR ビルドが成功した。
- 結果: Void が旧形式の `.dev.vars`／`.env.production` と Wrangler 設定を拒否した。旧環境ファイルは内容を表示せず、ignore 対象の `apps/web/.void-legacy-env/` に退避し、既存 `.env` は保持した。
- 結果: 空の旧 schema ディレクトリも Void の自動認識対象になるため、削除して不要な DB マイグレーション推論を止めた。
- 検証: 実際の開発サーバー起動では `app.head is not a function` が発生した。Void 1.1.11 の明示 HEAD ルート生成を避け、GET の暗黙 HEAD 応答を実 HTTP で確認する方針に修正した。
- 未解決: 再起動では Vite+ 0.1.24 と 1.3.0 の混在による native binding エラーが発生した。依存関係を統一し、型検査・テスト・ビルドを改めて揃える作業を進めている。

### 外部環境の検証状況

- 検証: Chrome MCP は既存 Chrome プロファイルの読み取り権限エラーで接続できなかった。ローカル検証には独立した一時プロファイルを使う予定。
- 検証: `wrangler whoami` は sandbox 内でログ書込・ネットワークエラー、制限外での再実行でもアカウント一覧の自動取得に失敗した。
- 検証: 設定上のアカウント ID と Worker 名を指定した `wrangler deployments list --name burio-com --json` も `No access to the specified resource` で失敗した。
- 状態: 現在の認証では既存 Worker の配信状態を確認できない。本番デプロイ、DB／R2 のリモート変更、ドメイン切替は行っていない。ローカル実装・検証を先に完成させる。

### ブランチとコミットの分割

- 実施: ユーザーの指示に従い、現在の変更を保持したまま `feat/void-migration` ブランチを作成した。Git worktree は追加していない。
- 方針: 計画・ログ、Void／Vite+ の基盤、サーバー／API、画面／フォーム、検証・仕上げのまとまりごとにコミットする。
- 結果: `void init` が Vite+ を標準提供することを再確認し、その構成に統一した。Vite+ 1.3.0 同梱の Vitest 5.0.5 に合わせて `vp install --force` を行い、古い Bun の解決を修復した。
- 検証: 実装担当による標準 `vp test run` は8ファイル・74テスト成功。`vp check` と型検査も成功した。別プロセスでの最終確認と、実ブラウザ検証を続ける。
- 検証: 開発サーバーは `http://127.0.0.1:3045/` で起動した。Void の DB コマンドはまだローカル DB を検出できないため、実際の D1 binding に対するローカル初期化方法を確認中。

### 実ブラウザで見つかった問題と修正

- コミット: `dcce2c5` に計画と作業ログ、`a09ef46` に Void／Vite+ の基盤設定を保存した。
- 実施: ローカルの Miniflare Local Explorer に接続し、DB が空であることを確認したうえで、検証用のスキーマだけを作成した。本番 DB／R2 は変更していない。
- 検証: 未認証の画像アップロードは HTTP 403。ホームと管理画面は Chrome で描画できた。
- 結果: ホームのタイトルが空になる移植漏れを実ブラウザで発見した。旧サイトの head 設定・各ページの canonical／OGP・GTM／noscript を復元し、ブラウザ上でホームと新規記事ページのタイトルを確認した。
- 結果: 安定した開発サーバーでも、画像ペースト後の本文から画像 Markdown が消える問題を再現した。アップロード自体のエラーや JavaScript 例外はなく、古いフォーム本文を参照していたことが原因だった。
- 修正: 画像アップロード完了時の置換が最新の本文に作用するよう、本文の参照と入力更新を統一した。アップロード中の追記が成功時・失敗時の両方で残る DOM テストを追加した。
- 修正: 別の Sol のレビューで指摘された削除順序を D1 → R2 に変え、D1 削除の失敗時に本文が消えないことをテストした。D1 成功後に R2 削除だけが失敗すると孤立オブジェクトが残る制約はある。
- 検証: 修正後の `vp test run` は9ファイル・77テスト成功。`vp check` と型検査も成功。実ブラウザで操作を通した最終確認を続ける。

### 画面とエディターの実動作確認

- コミット: `ab5ecbb` に D1／R2・管理認証・API・旧サーバーの移植を保存した。旧マイグレーションとスキーマの内容は保持している。
- 検証: Chrome で画像のペーストとドロップが R2 アップロードを発火し、返った URL が Markdown 本文へ入ることを確認した。
- 検証: ブラウザでの下書き作成、公開前の HTTP 404、公開後の HTTP 200、編集内容の反映が成功した。閲覧数 API は同じ IP の初回が `tracked: true`、直後の再訪が `false` になった。
- 結果: 新規画像の返却 URL が本番 API ドメインに固定されている問題を発見し、同一 origin の `/r2/images/...` に修正した。既存本文の絶対 URL は変更していない。
- 検証: 修正後の画像はローカルで `image/png` として取得でき、記事のタイトル／OG メタデータも更新された。
- 結果: 最初の OG 検証は、ローカル R2 に背景画像がないため HTTP 500 だった。既存の公開画像をローカル R2 にだけ投入すると、`HEAD /api/og/blog/2` は HTTP 200・`image/png` になった。
- 状態: 両方の OG URL と削除操作までを通した最終ブラウザ検証、最終チェック、残りのコミットを行う。

### 最終検証と実装の完了

- コミット: `9a3a5e0` に画面／エディター、`d444d69` に CI／README／旧スクリプト整理を保存した。
- 検証: 親プロセスでも `vp check` が成功した。132ファイルの整形、112ファイルの lint／型検査で警告・エラーはなかった。
- 検証: 親プロセスで `vp test run` が9ファイル・77テスト成功し、`vp run check-types` と `vp run build` も成功した。ビルドはクライアントと SSR の両方を生成した。既存の3D背景に関するチャンクサイズ警告は残る。
- 検証: 独立した Chrome プロファイルで、画像ペースト／ドロップ、記事の作成・公開・編集・削除、下書きの非公開、画像の PNG 配信、メタデータ更新、閲覧数の重複排除を一通り確認した。JavaScript の未処理例外はなかった。
- 検証: `/api/og/blog/:id` と `/og/blog/:id` の両方で、HEAD は HTTP 200・`image/png`・空本文、GET は HTTP 200・PNG 署名のある77,988バイトの画像を返した。
- 検証: 最後に作成した検証用記事の削除後は HTTP 404 となった。検証にはローカル D1／R2 だけを使った。
- 検証: 別の空のローカル永続化ディレクトリでも、Drizzle のスキーマ書き出しから Wrangler の `--local --file` で初期化でき、posts／users／view_logs の作成を確認した。動作した手順を README に記載した。
- 修正: CI では lint より先に `void prepare` を含む型検査を行い、生成型がない初回環境でも標準 `vp check`／`vp test run` を実行できる順序にした。
- 結果: ローカルの実装・検証は完了した。検証用の開発サーバーは停止した。

### 本番切替の残作業

- 確認: 環境に設定された Cloudflare アカウント ID が、アクセス拒否となった読み取り先と一致することを確認した。トークンは存在の有無だけを確認し、値は表示していない。
- 未実施: Cloudflare API が既存 Worker の読み取りを拒否するため、本番デプロイ、実データのバックアップ、ドメインの付け替え、本番での編集・画像配信・集計の確認は行っていない。
- 未実施: push／PR 作成は依頼されていないため行っていない。変更は `feat/void-migration` のローカルコミットに保存する。
- 残る制約: Void 1.1.11 のローカル DB 検出には前述の回避手順が必要。D1 削除成功後に R2 削除だけが失敗した場合、本文オブジェクトが孤立して残る。

### CI の4件を修正し、GitHub 上で成功を確認（PR #258）

- 確認: [CI #425](https://github.com/Koutaro-Hanabusa/burio.com/actions/runs/40159985316) は最新の `43ee24b` でも失敗していた。`vp check` が effect 内の setState を3件、描画中の `new Date()` を1件報告していた。
- 修正: 1つの挙動ごとにコミットを分け、ルールの無効化は行わなかった。

| コミット  | 修正内容                                                                                  |
| --------- | ----------------------------------------------------------------------------------------- |
| `bfada90` | 日付欠損時の描画中の時刻生成をやめ、既存の N/A 表示を使う                                 |
| `167e777` | 初期値 false と重複する3D背景の mount 時リセットを削除                                    |
| `723b2f7` | OS の動き軽減設定を useSyncExternalStore で購読し、設定変更への追従を維持                 |
| `1e99664` | SSR と hydration 初回の空 HTML を維持し、ブラウザ側の Markdown を state effect なしで導出 |

- 検証: SSR／hydration・サニタイズ・本文変更／null の回帰テストを追加し、ローカルは79テスト、型検査、`vp check`、ビルドが成功。実装者と別の Sol のレビューも完了した。
- 検証: 修正を既存 PR に push し、[CI #426](https://github.com/Koutaro-Hanabusa/burio.com/actions/runs/40160413842) で型検査、`vp check`、10ファイル・79テスト、クライアント／SSR ビルドの成功を実ログで確認した。対象は `1e996645f25c060472851434ed8a335c05abeb46`。
- 検証: 修正後も実ブラウザで画像ペースト／ドロップ、記事 CRUD、下書き非公開、閲覧数、OG の GET／HEAD が一通り成功した。
- 確認: ローカルの lint は同じ指摘を再現できていなかった。明示指定したグローバル Vite+ は0.1.18、プロジェクトの CLI は1.3.0であり、ローカル結果だけで CI 成功とは判断しない。
- 状態: 本番デプロイ・ドメイン切替は今回も行っていない。
- 追記: CI #427 は追記した作業ログの表の整形で失敗したため、`vp fmt worklog.md` で修正した。更新後の最新結果は [PR #258 のチェック](https://github.com/Koutaro-Hanabusa/burio.com/pull/258/checks)で確認する。

### Cloudflare Builds と cf CLI の設定方法を確認

- 確認: 提示された Web のログではビルドは成功し、`npx wrangler versions upload` が生成済みの `dist/ssr/wrangler.json` を参照できず失敗していた。デプロイコマンドへの `--config dist/ssr/wrangler.json` の指定が必要。旧バックエンドのビルドは、削除済みの `apps/server` をルートにしているため開始前に失敗している。
- 調査: [cf の設定仕様](https://developers.cloudflare.com/cf/projects/cloudflare-config/)と [Builds API](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/)を確認した。現行の `cloudflare.config.ts` には Builds のルート・実行コマンドを定義する項目はない。Builds の設定は API で更新でき、Terraform への移行は不要。
- 検証: cf `1.0.0-beta.21` を一時領域で実行し、`cf cli search`、`cf schema builds triggers update`、コマンドのヘルプを確認した。JSON ファイルの `root_directory`・`build_command`・`deploy_command` を `cf builds triggers update <trigger-uuid> --body @<file.json> --dry-run` で読み込めた。検証用 ID だけを使い、期待する PATCH リクエストの生成と終了コード0を確認した。
- 結果: 設定 JSON を Git 管理して cf CLI から適用できる。CLI による API 更新であり、`cloudflare.config.ts` による Builds 設定の自動同期ではない。今回の復旧はダッシュボードの設定変更でも対応できる。
- 未実施: 本番 API への設定変更、旧バックエンドのビルド接続解除、再デプロイ、シークレット設定の確認は行っていない。調査のためにアプリの依存関係やデプロイ方式は変更していない。

### Chrome DevTools によるダッシュボード操作の接続確認

- 依頼: Cloudflare ダッシュボードで Web の Builds 設定、旧バックエンドのビルド接続などを変更する。
- 確認: Chrome DevTools の `list_pages` は `DevToolsActivePort` の読み取りで EPERM となった。昇格した読み取りでも同じエラーで、Chrome のポート9222は待ち受けているが HTTP の接続情報は404だった。
- 調査: [Chrome DevTools の公式トラブルシューティング](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/troubleshooting.md)に同じ macOS のアクセス制限と対処手順が記載されている。システム設定の「プライバシーとセキュリティ → ファイルとフォルダ」で、起動元アプリの「Google Chrome」を許可する必要がある。
- 状態: ユーザーにアクセス許可を依頼した。接続が復旧するまでは Cloudflare の設定は変更していない。

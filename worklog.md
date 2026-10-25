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

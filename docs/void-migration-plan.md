# burio.com を Void ネイティブへ移行

## 方針

画面と API を1つの Void アプリに統合する。ブラウザ編集・画像ペースト・保存後の即時反映・閲覧数を維持する。

本文は引き続き R2 の Markdown、記事情報と閲覧数は D1 に保存する。画面・取得・更新には [Void Pages／loaders／Actions](https://void.cloud/guide/pages-routing/overview) を使う。

## 構成と PR の取り込み順

移行後は `burio-com` の1 Worker が画面、API、管理認証、画像アップロードを担当する。`apps/server` と別 Worker の `burio-com-server` は移行後のアプリでは使わない。旧 Worker 本体は本番切替の確認まで保持する。

画面と、その画面に必要な loader・API・テストを同じ PR に含める。後続 PR は直前のブランチに依存し、各段階で動く画面を増やす。

1. [#259 ホームと共通レイアウト](https://github.com/Koutaro-Hanabusa/burio.com/pull/259)
2. [#260 ブログ一覧](https://github.com/Koutaro-Hanabusa/burio.com/pull/260)
3. [#261 記事詳細・OG 画像・閲覧数](https://github.com/Koutaro-Hanabusa/burio.com/pull/261)
4. [#262 管理画面・一覧・認証](https://github.com/Koutaro-Hanabusa/burio.com/pull/262)
5. [#263 新規作成・編集・画像ペースト](https://github.com/Koutaro-Hanabusa/burio.com/pull/263)
6. [#264 旧 Worker・保留コード・自動生成型の撤去](https://github.com/Koutaro-Hanabusa/burio.com/pull/264)

前段を `staging` に取り込んだら、次の PR の base も `staging` に進める。全画面と撤去を `staging` に揃えた後、`staging` → `main` で本番へ反映する。途中の段階は未移行の画面をまだ提供しない。

## 実装内容

- `apps/web` を移行先とし、既存 React コンポーネントとデザインを再利用する。ホーム、ブログ一覧・詳細、管理画面を Void Pages に移す。
- TanStack Start／Router／Query、tRPC、Hono の直接依存を取り除く。記事編集では TanStack Form の `Field`／`Subscribe` を維持し、保存は Void Action に接続する。Hono は [Void の内部依存](https://void.cloud/integrations/hono)として残る。
- サーバー処理と回帰テストを統合し、移植後に `apps/server` を廃止する。記事処理は共通化し、loader・action・API から再利用する。
- `/blog`、数値 ID の記事 URL、既存の管理画面 URL を維持する。タイトル、canonical、OGP は Void の head 管理へ移す。
- 記事作成・編集・公開切替・削除・プレビューを維持する。Markdown のサニタイズとリンクプレビューを引き継ぐ。保存失敗時は入力を保持し、D1／R2 の失敗を成功扱いしない。
- 画像ペースト・ドロップを既存フックから移植する。アップロードは管理者認証付きにし、形式・10MB 制限を維持する。
- 閲覧数は `POST /api/blog/:id/views` に移す。過去の値、同一 IP の1時間重複排除、管理者 IP の除外を引き継ぐ。
- IP 制限と署名 Cookie による管理認証を再利用する。各管理 loader・action・アップロードで認可し、公開側は公開済み記事だけを返す。

## データ・配信の切替

- Cloudflare Workers Builds から Void の生成済み `dist/ssr/wrangler.json` を指定して配信する。D1／R2 は既存リソースを明示的に接続し、スキーマ、記事 ID、オブジェクトキーを保持する。既存マイグレーションの再適用を防ぐ。
- `void.config.ts` に `burio16.com`、`api.burio16.com/*`、`blog.burio16.com` を宣言し、旧 API ドメインの画像 URL、OG 画像、リンクプレビュー用 URL を新 Worker でも提供する。
- OG 画像は既存の GET／HEAD、画像形式、キャッシュ設定を引き継ぐ。
- Vite+ の開発・型検査・ビルド、記事作成スクリプト、CI を単一アプリに合わせる。型検査前に `void prepare` を実行する。
- 別 Worker と検証用データで確認し、バックアップ後に本番を切り替える。旧 Worker は切替確認まで保持する。

Workers Builds のルートは `apps/web`、ビルドは `bun install --frozen-lockfile && bun run build`、本番デプロイは `npx wrangler deploy --config dist/ssr/wrangler.json`、非本番のバージョンアップロードは `npx wrangler versions upload --config dist/ssr/wrangler.json` を使う。旧 server 用の Git 接続は解除済み。

`ADMIN_TOKEN_SECRET` はランタイムとビルドの両方へ Secret として設定する。`ADMIN_ALLOWED_IPS` はランタイムに明示した値だけを許可し、未設定なら管理操作を拒否する。ローカル用の IP も開発環境で明示する。秘密値はリポジトリへ保存しない。

## 検証・完了条件

- `vp check`、`vp test`、型検査、本番ビルドが通る。
- ブラウザで記事の作成・編集、画像ペースト／ドロップ、プレビュー、公開切替、削除を確認する。
- 未認証操作の拒否、下書きの非公開、保存・アップロード失敗時の入力保持を確認する。
- 閲覧数の継続と重複排除、既存記事・画像 URL、OG 画像の GET／HEAD を確認する。
- 本番切替後も記事表示、編集、画像配信、集計が動作し、旧版へ戻せることを確認する。

## 作業記録

実施内容・検証結果・未解決事項は、リポジトリ直下の [worklog.md](../worklog.md) に記録する。

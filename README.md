# burio.com

ぶりお（[@Koutaro-Hanabusa](https://github.com/Koutaro-Hanabusa)）の個人サイト。自己紹介と、登壇資料・ブログを置いている。

- 登壇資料: <https://slide.burio16.com>

## 技術スタック

### モノレポ

- [Bun](https://bun.sh) workspaces
- [Vite+](https://viteplus.dev)（`vp` CLI で Vite / Rolldown / Vitest / tsdown / Oxlint / Oxfmt / Vite Task をまとめて扱う）

### `apps/web`（Void アプリ）

- [Void Pages](https://void.cloud/guide/pages-routing/overview) + [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com)
- [Framer Motion](https://www.framer.com/motion/) / [React Three Fiber](https://r3f.docs.pmnd.rs)
- [Drizzle ORM](https://orm.drizzle.team) + [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)（ブログ本文の Markdown ストレージ）
- [@cf-wasm/og](https://github.com/cf-wasm/og)（OG 画像生成）

開発は `vp run dev`、検証は `vp check`、`vp test run`、`vp run check-types`、`vp run build`。Void の型は型検査前に `void prepare` で生成する。記事は `/admin/blog` から管理する。

既存 D1/R2 のリソース ID とスキーマは `apps/web/void.config.ts`、`apps/web/drizzle/migrations` に保持する。認証用 migration は `apps/web/src/db/migrations` で管理し、既存テーブル用の旧 migration は自動適用しない。切替手順と確認事項は `docs/void-migration-plan.md` を参照。

## 管理者ログイン

[Void 標準認証](https://void.cloud/guide/auth)で、サーバー側の `ADMIN_GITHUB_ID` に設定した GitHub アカウントだけログインできる。`/admin/login` からログインし、管理画面からログアウトする。許可する ID は公開ソースへ記録せず、本番では Worker の Secret として管理する。メール・パスワード登録、旧 IP・Cookie によるログインは受け付けない。

GitHub OAuth App を作成し、callback URL を `https://burio16.com/api/auth/callback/github` に設定する。ローカル開発用は別の OAuth App を用意し、`http://localhost:3001/api/auth/callback/github` を設定する。`ADMIN_GITHUB_ID`、`AUTH_GITHUB_CLIENT_ID`、`AUTH_GITHUB_CLIENT_SECRET` はローカルでは `apps/web/.env`、本番では Worker の Secret に設定する。既存の配信手順で本番を更新する前に、セッション署名用の `BETTER_AUTH_SECRET` も32文字以上のランダム値で設定する。秘密値をリポジトリへ保存しない。

本番の認証テーブルは、`apps/web` で `./node_modules/.bin/void db migrate --remote` を実行してから配信する。対象は新しい認証用 migration だけで、既存の記事・作者テーブルは変更しない。

## ローカルの初期化

Node.js 24.21 以降と Bun 1.3.14 を使用する。`vp install` 後、上記の GitHub OAuth 設定を `apps/web/.env` に用意する。開発サーバーのセッション署名用 Secret は Void が補う。初回の空のローカル DB は、現在のブログスキーマから初期化する。以下はローカル D1/R2 だけを操作する。

```sh
vp run build
cd apps/web
./node_modules/.bin/drizzle-kit export --config drizzle.config.ts > /tmp/burio-local-schema.sql
./node_modules/.bin/wrangler d1 execute DB --local --config dist/ssr/wrangler.json --persist-to .void --file /tmp/burio-local-schema.sql
./node_modules/.bin/wrangler r2 object put burio-com-blog/burio.com_ogp.png --local --file public/burio.com_ogp.png --persist-to .void --content-type image/png
```

既存データベースへ旧 SQL migration を再適用しない。上記の初期化後、または認証移行前の既存ローカル DB には、`apps/web` で次を一度だけ実行する。認証テーブルの追加と履歴記録を1つの transaction で行い、Void が既存ブログテーブルを移行履歴のない DB として拒否するのを防ぐ。

```sh
{
  printf '%s\n' 'BEGIN IMMEDIATE;'
  cat src/db/migrations/20261025060620_same_ultimates.sql
  printf '\n%s\n' \
    'CREATE TABLE IF NOT EXISTS _void_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL);' \
    "INSERT INTO _void_migrations (name, applied_at) VALUES ('20261025060620_same_ultimates.sql', CURRENT_TIMESTAMP);" \
    'COMMIT;'
} > /tmp/burio-local-auth.sql
./node_modules/.bin/void db execute --file /tmp/burio-local-auth.sql
vp run dev
```

本番切替には、既存 Worker・D1・R2 を操作できる Cloudflare 認証と、両ドメインの接続確認が必要。実施状況は [worklog.md](worklog.md) に記録する。

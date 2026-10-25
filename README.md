# burio.com

ぶりお（[@Koutaro-Hanabusa](https://github.com/Koutaro-Hanabusa)）の個人サイト。自己紹介と、登壇資料・ブログを置いている。

- 登壇資料: <https://slide.burio16.com>

## 技術スタック

### モノレポ

- [Bun](https://bun.sh) workspaces
- [Vite+](https://viteplus.dev)（`vp` CLI で Vite / Rolldown / Vitest / tsdown / Oxlint / Oxfmt / Vite Task をまとめて扱う）

### `apps/web`（Void アプリ）

- [Void Pages](https://void.cloud/guide/pages-routing/overview) + [React 19](https://react.dev)
- [TanStack Form](https://tanstack.com/form)（記事編集のField・Subscribe。保存先はVoid Action）
- [Tailwind CSS v4](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com)
- [Framer Motion](https://www.framer.com/motion/) / [React Three Fiber](https://r3f.docs.pmnd.rs)
- [Drizzle ORM](https://orm.drizzle.team) + [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)（ブログ本文の Markdown ストレージ）
- [@cf-wasm/og](https://github.com/cf-wasm/og)（OG 画像生成）

開発は `vp run dev`、検証は `vp check`、`vp test run`、`vp run check-types`、`vp run build`。Void の型は型検査前に `void prepare` で生成する。記事は `/admin/blog` から管理する。

既存 D1/R2 のリソース ID とスキーマは `apps/web/void.config.ts`、`apps/web/drizzle/migrations` に保持する。旧 migration は Void の自動 migration 対象から外している。切替手順と確認事項は `docs/void-migration-plan.md` を参照。

## ローカルの初期化

Node.js 24.21 以降と Bun 1.3.14 を使用する。`vp install` 後、`apps/web/.env` にローカル用の `ADMIN_TOKEN_SECRET` と `ADMIN_ALLOWED_IPS=127.0.0.1,::1` を設定する。`ADMIN_ALLOWED_IPS` が未設定なら管理操作は許可されない。本番でも管理者の IP を明示して設定する。初回の空のローカル DB は、現在のスキーマから初期化する。以下はローカル D1/R2 だけを操作する。

```sh
vp run build
cd apps/web
./node_modules/.bin/drizzle-kit export --config drizzle.config.ts > /tmp/burio-local-schema.sql
./node_modules/.bin/wrangler d1 execute DB --local --config dist/ssr/wrangler.json --persist-to .void --file /tmp/burio-local-schema.sql
./node_modules/.bin/wrangler r2 object put burio-com-blog/burio.com_ogp.png --local --file public/burio.com_ogp.png --persist-to .void --content-type image/png
vp run dev
```

Void 1.1.11 の `void db execute` は、この既存 DB の binding 設定ではローカル DB を検出できないため、ビルドで生成した設定を Wrangler に渡す。既存データベースへ旧 SQL migration を再適用しない。

本番切替には、既存 Worker・D1・R2 を操作できる Cloudflare 認証と、両ドメインの接続確認が必要。実施状況は [worklog.md](worklog.md) に記録する。

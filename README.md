# burio.com

ぶりお（[@Koutaro-Hanabusa](https://github.com/Koutaro-Hanabusa)）の個人サイト。自己紹介と、登壇資料・ブログを置いている。

- 登壇資料: <https://slide.burio16.com>

## 技術スタック

### モノレポ

- [Bun](https://bun.sh) workspaces
- [Vite+](https://viteplus.dev)（`vp` CLI で Vite / Rolldown / Vitest / tsdown / Oxlint / Oxfmt / Vite Task をまとめて扱う）

### `apps/web`（フロントエンド）

- [React 19](https://react.dev) + [TanStack Router / Start](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query) / [TanStack Form](https://tanstack.com/form)
- [tRPC](https://trpc.io)
- [Tailwind CSS v4](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com)
- [Framer Motion](https://www.framer.com/motion/) / [React Three Fiber](https://r3f.docs.pmnd.rs)

### `apps/server`（バックエンド）

- [Hono](https://hono.dev) on [Cloudflare Workers](https://workers.cloudflare.com)
- [Drizzle ORM](https://orm.drizzle.team) + [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)（ブログ本文の Markdown ストレージ）
- [Better Auth](https://www.better-auth.com)
- [@cf-wasm/og](https://github.com/cf-wasm/og)（OG 画像生成）

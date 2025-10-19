# Wrangler Security Setup Guide

## 概要

このガイドでは、Cloudflare Workers用のセキュアな環境設定方法を説明します。機密情報をGitリポジトリに露出させないためのベストプラクティスに従っています。

## 🔒 セキュリティ対策の内容

### 実施済みの改善項目

1. **wrangler.toml への移行**
   - `wrangler.jsonc` から標準的な `wrangler.toml` 形式に移行
   - データベースIDとR2バケット情報の取り扱いを改善

2. **.dev.vars によるローカル開発環境の保護**
   - 開発環境用のシークレットを `.dev.vars` で管理
   - `.dev.vars.example` をテンプレートとして提供

3. **wrangler.local.toml によるローカルオーバーライド**
   - 環境固有の設定（データベースIDなど）をローカルファイルで管理
   - `wrangler.local.toml.example` をテンプレートとして提供

4. **.gitignore の更新**
   - `.dev.vars` (既存)
   - `wrangler.local.toml` (新規追加)

## 📋 セットアップ手順

### 1. ローカル開発環境のセットアップ

#### .dev.vars ファイルの作成

```bash
cd /Users/1126buri/dev/burio.com/apps/server
cp .dev.vars.example .dev.vars
```

`.dev.vars` を編集して、実際の値を設定:

```env
BETTER_AUTH_SECRET=your-actual-secret-here-generate-random-string
```

#### wrangler.local.toml ファイルの作成（オプション）

データベースIDをローカルで管理する場合:

```bash
cp wrangler.local.toml.example wrangler.local.toml
```

`wrangler.local.toml` を編集して、実際のデータベースIDを設定:

```toml
[[d1_databases]]
binding = "DB"
database_name = "burio-com-db"
database_id = "7390edad-195a-4da4-80a8-90209083afcc"
preview_database_id = "02de547d-2aa5-4183-933a-25503971e540"
migrations_dir = "./src/db/migrations"

[env.dev]
[[env.dev.d1_databases]]
binding = "DB"
database_name = "burio-com-dev"
database_id = "02de547d-2aa5-4183-933a-25503971e540"
preview_database_id = "02de547d-2aa5-4183-933a-25503971e540"
migrations_dir = "./src/db/migrations"
```

### 2. 本番環境のシークレット設定

本番環境で使用するシークレットは、Wrangler CLIを使って設定します:

```bash
# Cloudflareにログイン
wrangler login

# シークレットの設定
wrangler secret put BETTER_AUTH_SECRET

# プロンプトが表示されたら、シークレット値を入力
```

### 3. データベースIDの管理方法

#### オプション A: Cloudflare Dashboard で管理（推奨）

1. Cloudflare Dashboard にログイン
2. Workers & Pages > D1 で既存のデータベースを確認
3. wrangler.toml の `database_name` が正しく設定されていれば、Wrangler が自動的にマッピング

#### オプション B: 環境変数で管理

```bash
# 環境変数として設定
export CLOUDFLARE_DATABASE_ID="7390edad-195a-4da4-80a8-90209083afcc"

# または .env ファイルに追加（.gitignore 済み）
echo "CLOUDFLARE_DATABASE_ID=7390edad-195a-4da4-80a8-90209083afcc" >> .env
```

#### オプション C: wrangler.local.toml で管理（上記参照）

### 4. R2 バケットの設定

R2バケットは `wrangler.toml` の `bucket_name` が正しければ、Cloudflare側で自動的にマッピングされます。

追加の設定が必要な場合:

```bash
# R2バケットの一覧確認
wrangler r2 bucket list

# 必要に応じてバケット作成
wrangler r2 bucket create burio-com-blog-dev
```

## 🚀 デプロイ時の注意事項

### ローカル開発

```bash
# 開発サーバーの起動（.dev.vars が自動的に読み込まれます）
bun dev
# または
wrangler dev
```

### 本番環境へのデプロイ

```bash
# 本番環境へのデプロイ
wrangler deploy

# 特定の環境へのデプロイ
wrangler deploy --env dev
```

## 📝 移行前の設定（wrangler.jsonc）

参考までに、以前の `wrangler.jsonc` から移行した情報:

### 削除・移動した機密情報

- ✅ **D1 Database IDs**: `wrangler.local.toml` または Dashboard で管理
- ✅ **Preview Database IDs**: `wrangler.local.toml` または Dashboard で管理
- ✅ **Secrets**: `wrangler secret put` コマンドで管理

### 保持した情報（公開しても安全）

- ✅ **Database Name**: スキーマ名（機密ではない）
- ✅ **Bucket Name**: バケット名（機密ではない）
- ✅ **CORS_ORIGIN**: 公開URL
- ✅ **NODE_ENV**: 環境識別子

## 🔐 セキュリティチェックリスト

- [ ] `.dev.vars` ファイルを作成し、シークレットを設定
- [ ] `wrangler.local.toml` を作成（必要に応じて）
- [ ] `.gitignore` に `.dev.vars` と `wrangler.local.toml` が含まれていることを確認
- [ ] 本番環境のシークレットを `wrangler secret put` で設定
- [ ] `.env*` ファイルがGitにコミットされていないことを確認
- [ ] `wrangler.jsonc` を削除（または参照用にのみ保持）

## 🆘 トラブルシューティング

### データベースに接続できない

```bash
# データベースの一覧確認
wrangler d1 list

# データベース情報の確認
wrangler d1 info burio-com-db
```

### シークレットが読み込まれない

```bash
# 設定済みのシークレット一覧確認
wrangler secret list

# シークレットの再設定
wrangler secret put BETTER_AUTH_SECRET
```

### ローカル開発で環境変数が読み込まれない

1. `.dev.vars` ファイルが存在することを確認
2. `wrangler dev` コマンドで起動していることを確認
3. ファイルの形式が正しいことを確認（`KEY=value` 形式）

## 📚 参考リンク

- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Secrets Management](https://developers.cloudflare.com/workers/configuration/secrets/)
- [D1 Databases](https://developers.cloudflare.com/d1/)
- [R2 Storage](https://developers.cloudflare.com/r2/)

## ⚠️ 重要な注意事項

1. **絶対にコミットしてはいけないファイル:**
   - `.dev.vars`
   - `wrangler.local.toml`
   - `.env` (シークレットを含む場合)

2. **安全に公開できる情報:**
   - データベース名
   - バケット名
   - 公開URL

3. **Cloudflare Dashboard で管理すべき情報:**
   - データベースID
   - Account ID
   - API Token

4. **wrangler secret で管理すべき情報:**
   - BETTER_AUTH_SECRET
   - サードパーティAPIキー
   - 暗号化キー

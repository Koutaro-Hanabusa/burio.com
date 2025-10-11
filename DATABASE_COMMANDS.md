# 🗄️ Database Commands Guide

## 📋 便利なコマンド一覧

### 🔍 データベース確認コマンド

#### 開発環境（リモート）
```bash
# テーブル一覧表示
bun run db:dev:tables

# ユーザー一覧表示（最新10件）
bun run db:dev:users

# 投稿一覧表示（最新10件）
bun run db:dev:posts
```

#### 開発環境（ローカル）
```bash
# テーブル一覧表示
bun run db:dev:local:tables

# ユーザー一覧表示（最新10件）
bun run db:dev:local:users

# 投稿一覧表示（最新10件）
bun run db:dev:local:posts
```

#### 本番環境
```bash
# テーブル一覧表示
bun run db:prod:tables

# ユーザー一覧表示（最新10件）
bun run db:prod:users

# 投稿一覧表示（最新10件）
bun run db:prod:posts
```

### 🛠️ セットアップコマンド

```bash
# 開発環境にテーブル作成
bun run db:dev:setup

# 本番環境にテーブル作成
bun run db:prod:setup
```

### 🚀 デプロイコマンド

```bash
# 開発環境にデプロイ
bun run deploy:dev

# 本番環境にデプロイ
bun run deploy:prod
```

## 🎯 カスタムSQLクエリの実行

### 開発環境
```bash
# カスタムクエリ実行
cd apps/server && bunx wrangler d1 execute burio-com-dev --remote --command="YOUR_SQL_QUERY"

# ローカル環境
cd apps/server && bunx wrangler d1 execute burio-com-dev --local --env dev --command="YOUR_SQL_QUERY"
```

### 本番環境
```bash
# カスタムクエリ実行（注意！）
cd apps/server && bunx wrangler d1 execute burio-com-db --remote --command="YOUR_SQL_QUERY"
```

## 📊 よく使うSQLクエリ例

### ユーザー管理
```sql
-- 新規ユーザー作成
INSERT INTO users (id, email, name) VALUES ('test-id-123', 'test@example.com', 'Test User');

-- ユーザー検索
SELECT * FROM users WHERE email = 'test@example.com';

-- ユーザー数カウント
SELECT COUNT(*) as user_count FROM users;
```

### 投稿管理
```sql
-- 新規投稿作成
INSERT INTO posts (id, title, content, author_id, published) 
VALUES ('post-id-123', 'Test Post', 'This is a test post', 'test-id-123', true);

-- 公開済み投稿一覧
SELECT * FROM posts WHERE published = true ORDER BY created_at DESC;

-- ユーザー別投稿数
SELECT u.name, COUNT(p.id) as post_count 
FROM users u 
LEFT JOIN posts p ON u.id = p.author_id 
GROUP BY u.id, u.name;
```

### データベース情報
```sql
-- テーブル構造確認
PRAGMA table_info(users);
PRAGMA table_info(posts);

-- インデックス確認
SELECT * FROM sqlite_master WHERE type='index';

-- データベースサイズ確認
PRAGMA page_size;
PRAGMA page_count;
```

## 🚨 注意事項

### 本番環境での操作
- **本番データベースの操作は慎重に！**
- **バックアップを取ってから実行**
- **テスト環境で十分確認してから本番適用**

### 安全な操作手順
1. 開発環境でテスト
2. ローカル環境で確認
3. 開発リモート環境で検証
4. 本番環境に適用

## 🔧 トラブルシューティング

### 接続エラーの場合
```bash
# API Token確認
echo $CLOUDFLARE_D1_TOKEN

# 設定確認
cd apps/server && cat .env | grep CLOUDFLARE
```

### マイグレーション失敗の場合
```bash
# マイグレーション状況確認
cd apps/server && bunx wrangler d1 migrations list burio-com-dev
cd apps/server && bunx wrangler d1 migrations list burio-com-db
```
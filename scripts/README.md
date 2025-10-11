# ブログ記事管理スクリプト

このディレクトリには、ブログ記事の作成・管理を効率化するスクリプトが含まれています。

## 🚀 クイックスタート

### 環境変数の設定

R2への直接アップロードを使用する場合、以下の環境変数を設定してください：

```bash
export CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
export CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
```

### 新しい記事の作成

```bash
# インタラクティブな記事作成
bun run blog:create
```

## 📄 スクリプト一覧

### 1. create-post.js - 記事作成ヘルパー

新しいブログ記事を作成するためのインタラクティブなスクリプトです。

**機能:**
- Markdownテンプレート生成
- DBへのメタデータ挿入
- R2への自動アップロード
- スラッグの自動生成

**使用方法:**
```bash
bun run blog:create
```

**フロー:**
1. タイトル、概要、タグなどを入力
2. Markdownテンプレートが生成される
3. エディタで内容を編集
4. R2にアップロード & DBに挿入

### 2. r2-uploader.js - R2ファイル管理

S3 APIを使用してCloudflare R2ストレージを直接操作するスクリプトです。

**使用方法:**
```bash
# ファイルをアップロード
bun run r2:upload <filePath> <slug> [env]

# ファイル一覧を表示
bun run r2:list [env]

# ファイルを削除
bun run r2:delete <slug> [env]
```

**例:**
```bash
# 開発環境にアップロード
bun run r2:upload ./my-post.md my-post-slug dev

# 本番環境のファイル一覧
bun run r2:list prod

# ファイル削除
bun run r2:delete my-post-slug dev
```

### 3. upload-to-r2.js - シンプルアップローダー

wranglerコマンドを使用したシンプルなアップロードスクリプトです。

**使用方法:**
```bash
bun run scripts/upload-to-r2.js <filePath> <slug> [env]
```

## 🗂️ ディレクトリ構造

```
scripts/
├── README.md           # このファイル
├── create-post.js      # 記事作成ヘルパー
├── r2-uploader.js      # R2ファイル管理（S3 API）
└── upload-to-r2.js     # シンプルアップローダー（Wrangler）

temp/                   # 一時ファイル用ディレクトリ
├── *.md               # 作成中のMarkdownファイル
```

## 🔧 技術詳細

### R2ストレージ構造

```
burio-com-blog-dev/     # 開発環境バケット
├── blog/
│   ├── first-test-post.md
│   ├── markdown-test-post.md
│   └── react-custom-hooks.md

burio-com-blog/         # 本番環境バケット
├── blog/
│   └── ...
```

### データベース構造

記事のメタデータはD1データベースに保存されます：

```sql
posts テーブル:
- id: 記事ID (CUID2)
- title: タイトル
- slug: URL用スラッグ
- excerpt: 概要
- author_id: 著者ID
- published: 公開フラグ
- views: 閲覧数
- created_at/updated_at: 日時
```

### ワークフロー

1. **記事作成**: `create-post.js` でテンプレート生成
2. **内容編集**: 生成されたMarkdownファイルを編集
3. **自動処理**: R2アップロード & DB挿入
4. **確認**: アプリケーションで表示確認

## 🛠️ トラブルシューティング

### よくある問題

**Q: R2アップロードでエラーが発生する**
A: 環境変数（ACCESS_KEY, SECRET_KEY）が正しく設定されているか確認してください。

**Q: DBへの挿入でエラーが発生する**
A: スラッグの重複や文字エンコーディングの問題の可能性があります。

**Q: ファイルが見つからない**
A: 相対パスではなく絶対パスを使用してください。

### ログの確認

```bash
# Wranglerのログを確認
tail -f ~/.wrangler/logs/wrangler-*.log

# R2バケットの内容確認
bun run r2:list dev
```

## 📝 今後の改善予定

- [ ] バッチ処理機能
- [ ] 画像アップロード対応
- [ ] メタデータのバリデーション強化
- [ ] テンプレートのカスタマイズ機能
- [ ] 記事の更新・編集機能
# CI/CD セットアップガイド

このプロジェクトでは、GitHub Actionsを使用してCloudflare WorkersとCloudflare Pagesへの自動デプロイを行います。

## ワークフロー

### 本番環境デプロイ (`deploy-production.yml`)
- **トリガー**: `main`ブランチへのpush
- **デプロイ先**:
  - Server: `burio-com-server` (Production)
  - Web: `burio-com` (Production)

### 開発環境デプロイ (`deploy-development.yml`)
- **トリガー**:
  - Pull Requestの作成・更新
  - `develop`ブランチへのpush
- **デプロイ先**:
  - Server: `burio-com-server-dev` (Development)
  - Web: `burio-com` (Preview)

## セットアップ手順

### 1. Cloudflare APIトークンの取得

1. Cloudflareダッシュボードにログイン: https://dash.cloudflare.com/
2. 右上のユーザーアイコン → **My Profile** → **API Tokens**
3. **Create Token**をクリック
4. **Edit Cloudflare Workers**テンプレートを選択
5. 以下の権限を設定：
   - **Account Resources**:
     - `Account Settings: Read`
     - `Cloudflare Workers: Edit`
   - **Zone Resources**:
     - `Cloudflare Pages: Edit`
   - **Account**: 対象のアカウントを選択
6. **Continue to summary** → **Create Token**
7. 表示されたトークンをコピー（一度しか表示されません）

### 2. Cloudflare Account IDの取得

1. Cloudflareダッシュボードにログイン
2. 右側のサイドバーに **Account ID** が表示されています
3. コピーボタンでコピー

### 3. GitHub Secretsの設定

1. GitHubリポジトリページを開く
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**をクリック
4. 以下の2つのシークレットを追加：

#### CLOUDFLARE_API_TOKEN
- Name: `CLOUDFLARE_API_TOKEN`
- Secret: 手順1で取得したAPIトークン

#### CLOUDFLARE_ACCOUNT_ID
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Secret: 手順2で取得したAccount ID

### 4. デプロイのテスト

#### 本番環境
```bash
git checkout main
git pull origin main
# 変更をコミット
git push origin main
# GitHub Actionsが自動的に実行されます
```

#### 開発環境
```bash
git checkout develop
git pull origin develop
# 変更をコミット
git push origin develop
# または Pull Requestを作成
```

## ワークフローの確認

1. GitHubリポジトリの **Actions** タブを開く
2. 実行中または完了したワークフローを確認
3. 各ステップのログを確認可能

## トラブルシューティング

### デプロイが失敗する場合

1. **APIトークンの権限を確認**
   - Workers編集権限があるか
   - Pages編集権限があるか

2. **Account IDが正しいか確認**
   - Cloudflareダッシュボードで再確認

3. **ワークフローログを確認**
   - GitHub Actions → 失敗したワークフロー → 詳細ログ

### よくあるエラー

#### `Authentication error`
- APIトークンが無効または期限切れ
- APIトークンを再生成して、GitHub Secretsを更新

#### `Project not found`
- プロジェクト名が間違っている
- wrangler.tomlの設定を確認

#### `Insufficient permissions`
- APIトークンの権限が不足
- 必要な権限を付与して再生成

## 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Workers Deploy](https://developers.cloudflare.com/workers/wrangler/ci-cd/)
- [Cloudflare Pages Deploy](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)

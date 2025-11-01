# OG画像生成APIのテスト方法

## ローカル環境でのテスト

### 1. サーバーを起動
```bash
cd /Users/1126buri/dev/burio.com/apps/server
npm run dev
```

### 2. エンドポイントをテスト

#### デフォルトOG画像を取得
```bash
curl -v http://localhost:3000/api/og-image
# または
curl http://localhost:3000/api/og-image --output test-default.png
```

#### 特定の記事のOG画像を取得
```bash
curl http://localhost:3000/api/og-image?id=1 --output test-article-1.png
```

### 3. ブラウザでテスト
以下のURLをブラウザで開く：
- デフォルト: http://localhost:3000/api/og-image
- 記事ID指定: http://localhost:3000/api/og-image?id=1

## 本番環境でのテスト

### デプロイ
```bash
cd /Users/1126buri/dev/burio.com/apps/server
npm run deploy
```

### テスト
```bash
# デフォルト画像
curl https://api.burio16.com/api/og-image --output prod-default.png

# 記事指定
curl https://api.burio16.com/api/og-image?id=1 --output prod-article-1.png
```

## HTMLでの利用例

### ブログ記事ページ
```html
<!DOCTYPE html>
<html>
<head>
  <meta property="og:image" content="https://api.burio16.com/api/og-image?id=1" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:image" content="https://api.burio16.com/api/og-image?id=1" />
  <meta name="twitter:card" content="summary_large_image" />
</head>
<body>
  <!-- コンテンツ -->
</body>
</html>
```

## 期待される結果

### 成功時
- ステータスコード: 200
- Content-Type: image/png
- 画像サイズ: 1200x630ピクセル
- タイトルが中央に大きく表示される
- 紫のグラデーション背景

### エラー時
- ステータスコード: 200（エラー時もデフォルト画像を返す）
- Content-Type: image/png
- シンプルな"burio.com"のみの画像

## デバッグ

### ログ確認
```bash
# ローカル
npm run dev
# コンソールにログが表示される

# 本番
wrangler tail
# リアルタイムログを確認
```

### よくある問題

1. **画像が生成されない**
   - コンソールログでエラーを確認
   - フォントの読み込みに失敗している可能性

2. **日本語が表示されない**
   - Noto Sans JPフォントの読み込みを確認
   - Google Fontsへのアクセスを確認

3. **記事タイトルが取得できない**
   - データベース接続を確認
   - 記事IDが正しいか確認

## パフォーマンステスト

### 速度測定
```bash
time curl -o /dev/null -s -w 'Total: %{time_total}s\n' http://localhost:3000/api/og-image?id=1
```

### 負荷テスト（オプション）
```bash
# ApacheBench
ab -n 100 -c 10 http://localhost:3000/api/og-image

# wrk
wrk -t4 -c100 -d30s http://localhost:3000/api/og-image
```

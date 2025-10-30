# Cloudflare Pages Functions

このディレクトリにはCloudflare Pages Functionsのエンドポイントが含まれています。

## エンドポイント

### `/test-og`
最小限のテストエンドポイント。ImageResponseの基本動作を確認するためのシンプルな実装。

- **URL**: `https://feature-dynamic-ogp.burio-com.pages.dev/test-og`
- **説明**: 固定のテキスト「Test OG Image」を含むOGP画像を生成
- **用途**: デバッグとImageResponse APIの動作確認

### `/blog/[id]/og-image`
動的OGP画像生成エンドポイント。ブログ記事のタイトルと概要を含むOGP画像を動的に生成します。

- **URL**: `https://feature-dynamic-ogp.burio-com.pages.dev/blog/[id]/og-image`
- **例**: `https://feature-dynamic-ogp.burio-com.pages.dev/blog/1/og-image`
- **説明**:
  - ブログ記事IDを受け取り、APIから記事データを取得
  - タイトルと概要を含む美しいOGP画像を生成
  - Noto Sans JPフォントを使用（日本語対応）
  - タイトルの長さに応じて自動的にフォントサイズを調整
- **機能**:
  - Google Fontsからカスタムフォントを動的に読み込み
  - グラデーション背景とモダンなデザイン
  - エラー時の適切なフォールバック処理
  - 詳細なログ出力でデバッグをサポート

## 実装の詳細

### JSX設定
Cloudflare Pages Functionsで正しくJSXを処理するために、以下のpragmaコメントを使用しています：

```tsx
/** @jsxRuntime automatic */
/** @jsxImportSource react */
```

これにより、esbuildが自動的にReactのJSXランタイムを使用します。

### 依存関係
- `@cloudflare/pages-plugin-vercel-og`: OGP画像生成ライブラリ
- ImageResponse APIを使用してJSXからPNG画像を生成

### エラーハンドリング
3段階のフォールバック処理を実装：
1. 主処理でのエラーキャッチ
2. エラー時のシンプルな画像生成
3. 画像生成失敗時のJSONレスポンス

### フォント最適化
- Google Fonts APIのサブセット機能を使用
- 記事のタイトルと概要に含まれる文字のみをロード
- フォントロード失敗時はsans-serifにフォールバック

## テスト方法

### 開発環境でのテスト
```bash
# ローカルでPages Functionsを実行
cd apps/web
bun run wrangler:dev
```

### デプロイ後のテスト
```bash
# テストエンドポイント
curl -I https://feature-dynamic-ogp.burio-com.pages.dev/test-og

# ブログ記事のOGP画像
curl -I https://feature-dynamic-ogp.burio-com.pages.dev/blog/1/og-image
```

### ログの確認
Cloudflare Dashboardの「Workers & Pages」→「burio-com」→「Logs」でリアルタイムログを確認できます。

## トラブルシューティング

### 500エラーが発生する場合
1. Cloudflare Dashboardでログを確認
2. JSX pragmaコメントが正しく設定されているか確認
3. `@cloudflare/pages-plugin-vercel-og` が正しくインストールされているか確認
4. `/test-og` エンドポイントで基本動作を確認

### フォントが正しく表示されない場合
- Google Fonts APIへのアクセスが正常か確認
- フォント取得失敗時はsans-serifにフォールバックするため、画像自体は生成される
- ログでフォント取得の詳細を確認

## 参考リンク
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [@cloudflare/pages-plugin-vercel-og](https://github.com/cloudflare/pages-plugins/tree/main/packages/vercel-og)
- [Zennの参考記事](https://zenn.dev/)

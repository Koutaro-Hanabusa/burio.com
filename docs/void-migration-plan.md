# burio.com を Void ネイティブへ移行

## 方針

画面と API を1つの Void アプリに統合する。ブラウザ編集・画像ペースト・保存後の即時反映・閲覧数を維持する。

本文は引き続き R2 の Markdown、記事情報と閲覧数は D1 に保存する。画面・取得・更新には [Void Pages／loaders／Actions](https://void.cloud/guide/pages-routing/overview) を使う。

## 実装内容

- `apps/web` を移行先とし、既存 React コンポーネントとデザインを再利用する。ホーム、ブログ一覧・詳細、管理画面を Void Pages に移す。
- TanStack Start／Router／Query／Form、tRPC、Hono の直接依存を取り除く。フォームは Void の `Form`／`useForm`、操作は Actions に置き換える。Hono は [Void の内部依存](https://void.cloud/integrations/hono)として残る。
- サーバー処理と回帰テストを統合し、移植後に `apps/server` を廃止する。記事処理は共通化し、loader・action・API から再利用する。
- `/blog`、数値 ID の記事 URL、既存の管理画面 URL を維持する。タイトル、canonical、OGP は Void の head 管理へ移す。
- 記事作成・編集・公開切替・削除・プレビューを維持する。Markdown のサニタイズとリンクプレビューを引き継ぐ。保存失敗時は入力を保持し、D1／R2 の失敗を成功扱いしない。
- 画像ペースト・ドロップを既存フックから移植する。アップロードは管理者認証付きにし、形式・10MB 制限を維持する。
- 閲覧数は `POST /api/blog/:id/views` に移す。過去の値、同一 IP の1時間重複排除、管理者 IP の除外を引き継ぐ。
- IP 制限と署名 Cookie による管理認証を再利用する。各管理 loader・action・アップロードで認可し、公開側は公開済み記事だけを返す。

## データ・配信の切替

- 既存 Cloudflare アカウントへ Void CLI で配信する。D1／R2 は既存リソースを明示的に接続し、スキーマ、記事 ID、オブジェクトキーを保持する。既存マイグレーションの再適用を防ぐ。
- 設定上の `burio16.com` と `api.burio16.com` を維持する。旧 API ドメインの画像 URL、OG 画像、リンクプレビュー用 URL を新 Worker でも提供する。
- OG 画像は既存の GET／HEAD、画像形式、キャッシュ設定を引き継ぐ。
- Vite+ の開発・型検査・ビルド、記事作成スクリプト、CI を単一アプリに合わせる。型検査前に `void prepare` を実行する。
- 別 Worker と検証用データで確認し、バックアップ後に本番を切り替える。旧 Worker は切替確認まで保持する。

## 検証・完了条件

- `vp check`、`vp test`、型検査、本番ビルドが通る。
- ブラウザで記事の作成・編集、画像ペースト／ドロップ、プレビュー、公開切替、削除を確認する。
- 未認証操作の拒否、下書きの非公開、保存・アップロード失敗時の入力保持を確認する。
- 閲覧数の継続と重複排除、既存記事・画像 URL、OG 画像の GET／HEAD を確認する。
- 本番切替後も記事表示、編集、画像配信、集計が動作し、旧版へ戻せることを確認する。

## 作業記録

実施内容・検証結果・未解決事項は、リポジトリ直下の [worklog.md](../worklog.md) に記録する。

# 運用スクリプト

記事の作成・編集・公開・削除は `/admin/blog` で行う。本文は R2 の `blog/{数値ID}.md`、記事情報は D1 に保存される。

`r2-uploader.js` は既存 R2 オブジェクトの手動管理用。`upload` / `list` / `delete` の各操作は `vp run r2:upload` などの root script から実行できる。キー引数には数値 ID または旧 slug を指定し、実際のキーは `blog/{引数}.md` になる。通常の記事作成には使わない。

`backfill-char-count.js` は既存記事の文字数を再計算する保守用スクリプト。R2 を読み、D1 を更新するため、対象環境とバックアップを確認してから手動実行する。

旧 `create-post.js` は数値 ID の現行スキーマに対して文字列 ID を挿入し、DB と R2 の保存失敗時に不整合を作るため廃止した。

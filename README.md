# Ikumyon Tools Docs

Ikumyon Tools のドキュメントおよびポータルサイトです。

日本語・英語に対応しています。翻訳は画面コードから独立したファイルで管理し、詳細説明は固定IDのブロックごとに訳文をかぶせます。

翻訳ファイルの場所と更新手順は [翻訳ガイド](docs/translations.md) を参照してください。

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プレビュー
npm run preview
```

`npm run build` は翻訳チェックと型チェックを実行し、画像・ツール設定・日英の詳細説明を含めたサイトを `dist/` に出力します。

```bash
# 翻訳の不足・原文の未確認変更・変数・参照先を検査
npm run check:translations

# 言語判定・詳細説明の対応付け・翻訳チェックのテスト
npm test
```

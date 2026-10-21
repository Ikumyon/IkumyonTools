<!-- i18n:overview -->
## ツールの概要

**LiveVoiceBridge** は、YouTube Liveなどの配信コメントをリアルタイムに取得して読み上げるデスクトップアプリです。コメントに応じた音声の変更や効果音、辞書登録を組み合わせて配信に使えます。

<!-- i18n:features -->
## 主な機能

- VOICEVOX・COEIROINK・棒読みちゃん・Supertonic・Supertonic Lightweightに対応。
- コメント内のコマンドによる速度・音量・音程・話者の変更。
- 効果音、エコー、やまびこ、左右の定位変更。
- ユーザー辞書の編集と、JSON・CSV・タブ区切りTXTからの辞書取り込み。
- コメント一覧を独立した最前面・半透明ウィンドウにするPiP表示。
- 使用頻度に応じた音声キャッシュで、繰り返しの合成処理を削減。
- 配信に接続せず動作を試せるローカルテストモード。

<!-- i18n:requirements -->
## 動作環境・初期設定

Windows向けの実行ファイルは `LiveVoiceBridge.exe` です。Windows版は試用版 `v0.99.0` です。

YouTubeへの接続にはYouTube Data API v3のAPIキーを設定します。VOICEVOX・COEIROINK・棒読みちゃんを使う場合はエンジン側の起動と接続先の設定が必要です。Supertonic系では使用するモデルを準備します。モデル・音声素材の利用条件はアプリ内の案内を確認してください。

<!-- i18n:usage -->
## 使い方

1. 設定画面でYouTubeのAPIキーとTTSエンジン、接続先やモデルを設定します。
2. 配信URLまたは動画IDを入力して「開始」を押すと、コメントの取得と読み上げが始まります。
3. 動作確認だけを行う場合は、入力欄に `debug` と入れて開始し、「テスト送信」で文章を送ります。
4. PiPボタンでコメント一覧を独立表示できます。読み上げを終えるときは「停止」を押します。

<!-- i18n:commands -->
## コメントからの操作

- `教育(単語=よみがな)` と `忘却(単語)` でコメント用辞書を更新します。
- `再生(warning.wav)` や `sound(cheer.wav)` で `sounds/` 内の効果音を再生します。
- `速度(120)` は1.2倍速、`音量(80)` は80%の音量に変更します。
- `声(数値)` で話者を変更し、`エコー(50)` や `やまびこ(50)` で音声効果を指定できます。
- `左)`・`右)`・`両)` で音声の定位を切り替えます。

<!-- i18n:guide -->
## 操作ガイド・ソースコード

詳しい設定や操作は[使用方法・マニュアル](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/usage.md)を参照してください。ソース版はPython 3.11以上とRust拡張を使います。環境構築は[開発ガイド](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/development.md)、機能の詳細は[プロジェクトのREADME](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/README.md)に掲載されています。

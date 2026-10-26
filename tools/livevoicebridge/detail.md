<!-- i18n:overview -->
## ツールの概要

**LiveVoiceBridge** は、YouTube Liveのチャットをリアルタイムに取得して読み上げる、Windows・Linux向けのデスクトップアプリです。コメントに応じた音声の変更や効果音、読み替え辞書を組み合わせ、コメント表示やシステム監視も同じアプリで行えます。

<!-- i18n:features -->
## 主な機能

- VOICEVOX・COEIROINK・Qwen3-TTSに対応。Windowsでは棒読みちゃんも利用できます。
- TTSプラグインの追加と、設定画面での有効・無効の切り替え。
- コメント内のコマンドによる速度・音量・音程・話者の変更。対応する制御はエンジンごとに異なります。
- 効果音、エコー、やまびこ、左右の定位変更。
- 読み替え辞書のグループ管理と、JSON・CSV・タブ区切りTXTからの辞書取り込み。
- 投稿者名・本文・固定テキストを組み合わせた読み上げ文章の編集と並べ替え。
- 履歴コメントやSuper Chat・メンバー通知などの読み上げ設定。
- コメント一覧を独立した最前面・半透明ウィンドウにするPiP表示。
- CPU・RAM・ネットワーク・検出したGPUなどの監視と、PiPへのメトリクス表示。
- 配信に接続せず読み上げを試せるテスト送信。

<!-- i18n:requirements -->
## 動作環境・初期設定

Windows・Linuxのx64向けです。OS用の配布物をフォルダ単位で展開し、Windowsでは `LiveVoiceBridge.exe`、Linuxでは `LiveVoiceBridge` を起動します。`_internal/` は実行ファイルと一緒に配置してください。配置先には書き込み権限が必要です。

YouTubeへの接続にはYouTube Data API v3のAPIキーを設定します。VOICEVOX・COEIROINK・棒読みちゃんには外部エンジンが必要です。起動済みのエンジンへ接続するか、実行ファイルのパスを指定してアプリから起動できます。

設定・辞書・効果音・Qwen専用環境は配置先内の `data/` に保存します。アプリ終了後は配置フォルダをまとめてバックアップできます。

<!-- i18n:qwen -->
## Qwen3-TTSの準備

設定の「音声合成」でQwen3を選び、「モデルの準備」からモデルをダウンロードするか、手元のモデルフォルダーを指定します。対応モデルは `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice` です。GPUまたはCPUを選んで準備します。初回の環境・モデル取得にはネット接続が必要で、準備後の音声生成はオフラインで行えます。

Qwen3は話者・音量と共通の音声エフェクトに対応します。速度・音程の変更には対応しません。詳しくは[Qwen3-TTSの準備ガイド](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/users/qwen3.md)を参照してください。

<!-- i18n:usage -->
## 使い方

1. 設定画面でYouTubeのAPIキーと、音声合成に使うエンジン・接続先・話者を設定し、OKで保存します。Qwen3はモデルの準備も行います。
2. 配信URLまたは動画IDを入力して「接続開始」を押すと、コメントの取得と読み上げが始まります。
3. 動作確認だけを行う場合は、配信に接続せず「テスト送信」で文章を入力します。YouTubeへの投稿は行いません。
4. PiPボタンでコメント一覧を独立表示できます。読み上げを終えるときは「停止」を押します。

<!-- i18n:commands -->
## コメントからの操作

- `教育(単語=よみがな)` と `忘却(単語)` でコメント用辞書を更新します。
- `再生(warning.wav)` や `sound(cheer.wav)` で `data/sounds/` 内の効果音を再生します。
- `速度(120)` は1.2倍速、`音量(80)` は80%の音量に変更します。
- `声(数値)` で話者を変更し、`エコー(50)` や `やまびこ(50)` で音声効果を指定できます。
- `左)`・`右)`・`両)` で音声の定位を切り替えます。

音声制御はコマンド以降の同一コメント内に適用され、次のコメントへは持ち越しません。利用できる制御はエンジンによって異なります。

<!-- i18n:plugins -->
## TTSプラグイン

外部プラグインはアプリ直下の `plugins/` にフォルダー単位で配置します。設定の「プラグイン」で有効にして保存し、アプリを再起動すると「音声合成」で選べます。配置・削除・有効無効の変更は再起動で反映します。

導入方法は[TTSプラグインの案内](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/plugins/README.md)を参照してください。

<!-- i18n:guide -->
## 操作ガイド・ソースコード

詳しい設定や操作は[導入と使い方](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/users/README.md)、辞書の管理は[読み替え辞書ガイド](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/users/dictionary.md)を参照してください。ソース版は通常版CPython 3.14以上とRust拡張を使います。環境構築は[開発ガイド](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/source/development.md)、文書全体の入口は[ドキュメント一覧](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/README.md)に掲載されています。

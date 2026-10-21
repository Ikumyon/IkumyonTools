<!-- i18n:overview -->
## ツールの概要

**OGG File Renamer（Paradox Interactive Music MOD Support Tool）** は、HoI4・EU4・CK3などの音楽MOD向けにOGGファイルを整えるGUIツールです。日本語のファイル名をゲームで使うローマ字の名前へ変換し、元の日本語タイトルを表示するためのローカライズファイルを作成します。

<!-- i18n:features -->
## 主な機能

- ファイルやフォルダのドラッグ＆ドロップによるOGG読み込み。
- 漢字・ひらがな・カタカナのローマ字変換。
- 接頭辞の追加、正規表現による一括置換、重複名の連番による解消。
- ファイル名の文字数チェック。初期設定では63文字を超えると警告します。
- 元の音声のプレビュー再生と、変換後の名前の直接編集。
- 日本語タイトルと変換名を結び付ける `_l_japanese.yml` の生成。
- 元ファイルを変更せず、出力先へ名前を変えたコピーを保存。
- 出力先や文字数制限などの設定を次回起動時に復元。

<!-- i18n:downloads -->
## 起動方法

Windowsでは `OGG-File-Renamer.exe` を起動して使用します。Pythonを別途インストールする必要はありません。

<!-- i18n:usage -->
## 使い方

1. ボタンまたはドラッグ＆ドロップでOGGファイルやフォルダを読み込みます。
2. 変換後の名前を確認し、赤い警告のある行を直接編集や一括置換で調整します。再生ボタンで元の音声も確認できます。
3. 出力先を指定して「リネーム実行」を押すと、名前を変えたOGGと日本語ローカライズ用のYAMLが出力されます。
4. 出力したファイルをMODに配置し、音楽の定義ファイルを用意します。[Music Mod Creation Tool](https://runite-drill.github.io/music-mod-creation-tool/)と組み合わせて作業できます。

<!-- i18n:settings -->
## 設定・ソースコード

設定は実行ファイルまたはスクリプトと同じ場所の `settings/` に保存されます。`config.json` でアプリ設定、`forbidden_chars.json` で置換する禁止文字を管理します。

ソースから実行する場合はPython 3.10以上が推奨され、PySide6・pykakasi・PyYAMLを使います。詳しくは[プロジェクトのREADME](https://github.com/Ikumyon/Paradox-Interactive_music_MOD_support/blob/main/README.md)を参照してください。

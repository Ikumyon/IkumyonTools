<!-- i18n:overview -->
## ツールの概要

**SteamCMD Workshop Downloader** は、SteamCMDをGUIから操作するツールです。ゲームやWorkshopアイテムのURLを入力するとIDを読み取り、コマンドを覚えずに取得作業を進められます。

<!-- i18n:features -->
## 主な機能

- ゲーム・WorkshopのURLやIDを入力して操作。
- SteamCMDの場所と保存先を画面から指定。
- 匿名ログインと、ユーザー名・パスワードによるログインの選択。
- 処理の開始・停止、ログの確認、保存先フォルダの表示。
- SteamCMDへの入力欄から認証コードなどを送信。
- 日本語・英語の表示切り替えと、実行ファイルと同じ場所への設定保存。

<!-- i18n:requirements -->
## 動作環境・起動方法

Windows向けのアプリです。別途SteamCMDを用意してください。ZIPをフォルダごと展開し、`steamCMDGUI.exe` を起動します。翻訳用の `localization` フォルダも同じ場所に置いて使用します。

<!-- i18n:usage -->
## 使い方

1. SteamCMDの実行ファイル `steamcmd.exe` の場所を指定します。
2. 対象ゲームのAppIDまたはURLと、WorkshopアイテムのIDまたはURLを入力します。
3. 保存先とログイン方法を指定して「ダウンロード開始」を押します。
4. 認証コードなどの入力を求められた場合は、画面下部のSteamCMD入力欄から送信します。
5. ログで結果を確認し、「保存先を開く」からファイルを確認します。

<!-- i18n:project -->
## ソースコード・ライセンス

ソースからの実行にはPythonとPySide6を使い、`python steamCMDGUI.py` で起動します。詳しくは[プロジェクトのREADME](https://github.com/Ikumyon/steamCMDGUI/blob/main/README.md)を参照してください。ライセンスはMIT Licenseです。

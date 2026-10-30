<!-- i18n:overview -->
## ツールの概要

**NRClipBuilder** は、鉄道路線などのGISデータを地図でプレビューし、必要な部分を抽出・出力するデスクトップアプリです。NIMBY Railsへ持ち込む `.nrclip`、背景の鉄道地図用のPMTiles、Turnout向けのOverpass風JSONを作成できます。

<!-- i18n:features -->
## 主な機能

- 国土数値情報のN05などのZIP、Shapefile、GeoJSONを読み込み。
- 地図で指定した範囲の鉄道データをOverpass APIから取得。
- 複数レイヤーの重ね順、表示・非表示、削除を管理。
- キーワード・除外語・属性によるOR／AND抽出と、鉄道・地下鉄・路面電車・モノレールなどの種別フィルター。
- 地理院地図・航空写真・OpenStreetMapを背景にした地図プレビュー。
- 矩形範囲によるクリップと、使用した範囲の履歴保存。
- GeoJSON、Turnout向けJSON、NIMBY Railsの `.nrclip`、背景地図用のPMTilesを出力。
- 画面の言語を切り替え可能。現在のソースには85言語・地域の翻訳ファイルがあります。

<!-- i18n:requirements -->
## 動作環境・起動方法

Windows x64／Ubuntu 24.04以降のLinux x64に対応しています。配布版はPythonのインストール不要です。

- Windows: ZIPを展開し、展開先の `NRClipBuilder.exe` を起動します。
- Linux: tar.gzを展開し、展開先のフォルダで `./NRClipBuilder` を実行します。

展開したフォルダ全体を保持してください。ソースからの起動手順は[プロジェクトのREADME](https://github.com/Ikumyon/NRClipBuilder/blob/main/README.md)を参照してください。データファイルのパスを起動引数に指定することもできます。

<!-- i18n:usage -->
## 使い方

1. GISファイルを開くか、地図で範囲を選びOSMの鉄道データを取得します。
2. レイヤーの順序と表示を調整し、地図や属性表で内容を確認します。
3. キーワード・属性・路線種別を指定してフィルターを適用します。
4. 必要に応じて矩形範囲を選択し、出力対象をクリップします。
5. 「ファイル → 出力…」を開き、NRC1（`.nrclip`）、PMTiles、GeoJSON、Turnout JSONのタブから形式を選んで書き出します。

<!-- i18n:pmtiles -->
## NIMBY RailsでPMTilesを使う

PMTilesは背景の鉄道地図を表示するための形式です。建設・運行する線路の出力にはNRC1（`.nrclip`）を使用します。

NIMBY Rails 1.19以降の「Map options → Sources → New source」から、出力したローカルの `.pmtiles` を追加し、OpenMapTilesの鉄道表示に対応するスタイルを使用してください。色や線種はゲーム側のスタイルに従い、専用スタイルModは生成しません。

PMTilesは外部ツールなしで生成できます。出力ズームの初期値は0〜14、指定可能範囲は0〜22です。

<!-- i18n:project -->
## 関連プロジェクト・ライセンス

[Turnout](https://github.com/SuperManifolds/Turnout)のデータ構造やチェックサム、シリアライズを参考にPythonで実装・拡張したツールです。ライセンスはMIT Licenseです。詳しくは[プロジェクトのREADME](https://github.com/Ikumyon/NRClipBuilder/blob/main/README.md)を参照してください。

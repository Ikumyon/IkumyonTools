<!-- i18n:overview -->
## ツールの概要

**NRClipBuilder** は、鉄道路線などのGISデータを地図でプレビューし、必要な部分を抽出・出力するデスクトップアプリです。NIMBY Railsへ持ち込む `.nrclip` や、Turnout向けのOverpass風JSONを作成できます。

<!-- i18n:features -->
## 主な機能

- 国土数値情報のN05などのZIP、Shapefile、GeoJSONを読み込み。
- 地図で指定した範囲の鉄道データをOverpass APIから取得。
- 複数レイヤーの重ね順、表示・非表示、削除を管理。
- キーワード・除外語・属性によるOR／AND抽出と、鉄道・地下鉄・路面電車・モノレールなどの種別フィルター。
- 地理院地図・航空写真・OpenStreetMapを背景にした地図プレビュー。
- 矩形範囲によるクリップと、使用した範囲の履歴保存。
- GeoJSON、Turnout向けJSON、NIMBY Railsの `.nrclip` を出力。
- 画面の言語を切り替え可能。現在のソースには85言語・地域の翻訳ファイルがあります。

<!-- i18n:requirements -->
## 動作環境・起動方法

Windows向けのZIPは、フォルダ全体を展開して `nrclip_builder.exe` を起動します。`localisation` フォルダは実行ファイルと同じ場所に置きます。

ソースから使う場合は、Python環境で `install_requirements.bat` を実行し、`run.bat` または `python nrclip_builder.py` で起動します。データファイルのパスを起動引数に指定することもできます。

<!-- i18n:usage -->
## 使い方

1. GISファイルを開くか、地図で範囲を選びOSMの鉄道データを取得します。
2. レイヤーの順序と表示を調整し、地図や属性表で内容を確認します。
3. キーワード・属性・路線種別を指定してフィルターを適用します。
4. 必要に応じて矩形範囲を選択し、出力対象をクリップします。
5. GeoJSON、Turnout向けJSON、または `.nrclip` の形式を選んで書き出します。

<!-- i18n:project -->
## 関連プロジェクト・ライセンス

[Turnout](https://github.com/SuperManifolds/Turnout)のデータ構造やチェックサム、シリアライズを参考にPythonで実装・拡張したツールです。ライセンスはMIT Licenseです。詳しくは[プロジェクトのREADME](https://github.com/Ikumyon/NRClipBuilder/blob/main/README.md)を参照してください。

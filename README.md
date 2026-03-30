# DQ10 TOOL WEB（職人向け）

DQ10（ドラゴンクエスト10）の職人向けに、
**装備の原価・利益計算**をスマホでも見やすく使えるようにしたローカルWebアプリです。

## できること（最小構成）

- `data/recipe.csv` を読み込み、装備一覧を自動生成
- `craftsman`（職人種別）と `category`（装備ジャンル）のプルダウンをCSVから自動生成
- 装備名の部分一致検索で、装備ドロップダウン候補を絞り込み
- 職人種別・装備ジャンル・文字検索を併用して装備候補を絞り込み
- 同じ `equipmentName` をまとめて装備ドロップダウンに表示
- 装備を選ぶと、その装備に必要な素材（`materialName`）と必要個数（`quantity`）を表示
- 素材価格を手入力で登録・更新
- 装備販売価格を手入力で登録・更新
- 手数料率を考慮した利益額・利益率を表示
- データを `localStorage` に保存（ブラウザローカル）

## recipe.csv の前提

`data/recipe.csv` の列は以下を想定しています。

- `craftsman`
- `category`
- `equipmentLevel`
- `craftLevel`
- `equipmentName`
- `materialName`
- `quantity`

このうち、アプリの表示/計算で直接使うのは主に `craftsman` / `category` / `equipmentName` / `materialName` / `quantity` です。

## 画面構成

1. **利益計算画面**
   - 装備選択
   - 必要素材一覧
   - 原価合計 / 利益額 / 利益率の確認
2. **素材価格管理画面**
   - 素材単価更新
3. **装備/レシピ管理画面**
   - 既存レシピ確認

## データ構造

- 装備マスタ（`equipments`）
- 素材マスタ（`materials`）
- レシピテーブル（`recipes`）

全データは以下キーで保存されます。

- `dq10_toolweb_data_v1`

## ローカル実行方法

### 方法1: 簡易HTTPサーバーで開く（推奨）

```bash
python3 -m http.server 8000
```

その後、ブラウザで以下にアクセス：

- <http://localhost:8000>

> `recipe.csv` は `fetch` で読み込むため、`index.html` を直接 `file://` で開く方法では正しく動かない場合があります。

## ファイル構成

- `index.html` : 画面定義（3タブ）
- `styles.css` : スマホ向けを意識したレスポンシブスタイル
- `app.js` : ロジック本体（CSV読込・状態管理・計算・localStorage保存）
- `data/recipe.csv` : レシピ元データ

## 今後の拡張案

- CSVの列追加（例: 参考販売価格）
- 装備/素材の絞り込み検索
- 利益の目標値シミュレーション

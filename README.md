# DQ10 TOOL WEB（職人向け）

DQ10（ドラゴンクエスト10）の職人向けに、
装備ごとの必要素材と原価・利益を確認できるローカルWebツールです。

## この版の方針（シンプル）

- レシピ元データは `recipe.csv` を使います（`data/recipe.csv` を優先し、なければリポジトリ直下 `recipe.csv` を読みます）。
- `app.js` で `recipe.csv` を読み込み、装備と素材を自動構築します。
- 同じ `equipmentName` は1つの装備としてまとめて表示します。
- 画面デザインは既存の3タブ構成を維持します。

## recipe.csv 仕様

列は以下です（ヘッダー必須）。

- `equipmentLevel`
- `craftLevel`
- `equipmentName`
- `materialName`
- `quantity`

## できること

1. `recipe.csv` を読み込む
2. 同じ `equipmentName` をまとめて装備ドロップダウンに表示
3. 装備選択で必要素材と必要数を一覧表示
4. 素材単価・販売価格・手数料率を入力して利益計算

## 保存について

- 素材単価・販売価格・手数料率は `localStorage` に保存されます。
- 保存キー: `dq10_toolweb_csv_prices_v1`

## ローカル実行

```bash
python3 -m http.server 8000
```

ブラウザで以下を開きます。

- <http://localhost:8000>

## ファイル

- `index.html` : 画面
- `styles.css` : スタイル（スマホ対応）
- `app.js` : CSV読込・描画・利益計算ロジック
- `recipe.csv` : レシピ元データ

# DQ10 TOOL WEB（職人向け）

DQ10（ドラゴンクエスト10）の職人向けに、
**装備の原価・利益計算**をスマホでも見やすく使えるようにしたローカルWebアプリです。

## 今回の仕様（CSV読込）

リポジトリ直下の `recipe.csv` を読み込んで、装備・素材・レシピを自動生成します。

### recipe.csv の列

- `equipmentLevel`
- `craftLevel`
- `equipmentName`
- `materialName`
- `quantity`

## できること

- `recipe.csv` を読み込む
- 同じ `equipmentName` を1つにまとめて装備ドロップダウンに表示
- 装備を選ぶと、必要素材（`materialName`）と必要数（`quantity`）を表示
- 素材単価、装備販売価格、手数料率を手入力で管理
- 手数料考慮後の利益額・利益率を計算表示
- デザインは既存の3タブ構成を維持

## 画面

1. 利益計算画面
2. 素材価格管理画面
3. 装備/レシピ管理画面

## データ保存

- 元データ: `recipe.csv`
- 価格編集などのユーザー操作: `localStorage`（キー: `dq10_toolweb_data_v3`）

> `recipe.csv` を更新した場合でも、同一IDの価格情報（単価/販売価格/手数料率）は localStorage の内容が優先されます。

## ローカル実行

```bash
python3 -m http.server 8000
```

- ブラウザで <http://localhost:8000> を開く

## ファイル構成

- `index.html` : 画面
- `styles.css` : スタイル（スマホ表示対応）
- `app.js` : CSV読込・描画・計算ロジック
- `recipe.csv` : レシピ元データ

# DQ10 TOOL WEB（職人向け）

DQ10（ドラゴンクエスト10）の職人向けに、
**装備の原価・利益計算**をスマホでも見やすく使えるようにしたローカルWebアプリです。

## できること（最小構成）

- 装備をドロップダウンで選択
- 選択した装備の必要素材/必要数を自動表示
- 素材単価を手入力で登録・更新
- 装備販売価格・手数料率を手入力で更新
- 手数料を考慮した利益額・利益率を表示
- 装備/素材/レシピを管理画面から追加
- データを `localStorage` に保存（ブラウザローカル）

## データ分離方針（今回の変更ポイント）

`app.js` に装備や素材を直書きせず、初期データを JSON から読み込みます。

- `data/equipments.json`（装備マスタ）
- `data/materials.json`（素材マスタ）
- `data/recipes.json`（レシピデータ）

### データ項目

#### 装備マスタ（equipments）

- `equipmentId` : 装備ID
- `name` : 装備名
- `category` : カテゴリ
- `craftType` : 職人種別
- `salePrice` : 販売価格
- `feeRate` : 手数料率

#### 素材マスタ（materials）

- `materialId` : 素材ID
- `name` : 素材名
- `unitPrice` : 単価

#### レシピデータ（recipes）

- `equipmentId` : 装備ID
- `materialId` : 素材ID
- `requiredQty` : 必要数

## 画面構成

1. **利益計算画面**
   - 装備選択
   - 必要素材一覧
   - 原価合計 / 利益額 / 利益率の確認
2. **素材価格管理画面**
   - 素材追加
   - 素材単価更新
3. **装備/レシピ管理画面**
   - 装備追加（ID / カテゴリ / 職人種別 / 販売価格 / 手数料率）
   - レシピ（装備×素材×必要数）追加

## ローカル実行方法

### 方法1: ファイルを直接開く

`index.html` をブラウザで直接開くだけでも動作します。

### 方法2: 簡易HTTPサーバーで開く（推奨）

```bash
python3 -m http.server 8000
```

その後、ブラウザで以下にアクセス：

- <http://localhost:8000>

## 補足

- `data/*.json` を更新しても、すでに `localStorage` に保存済みデータがある場合はそちらが優先されます。
- JSONの初期値を再読み込みしたい場合は、ブラウザの開発者ツールから `localStorage` の `dq10_toolweb_data_v2` を削除してください。

## ファイル構成

- `index.html` : 画面定義（3タブ）
- `styles.css` : スマホ向けを意識したレスポンシブスタイル
- `app.js` : ロジック本体（JSON読込・状態管理・計算・保存）
- `data/equipments.json` : 装備マスタ
- `data/materials.json` : 素材マスタ
- `data/recipes.json` : レシピデータ

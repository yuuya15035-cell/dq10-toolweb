# DQ10 TOOL WEB（職人向け）

DQ10（ドラゴンクエスト10）の職人向けに、
**装備の原価・利益計算**をスマホでも見やすく使えるようにしたローカルWebアプリです。

## できること（最小構成）

- `data/recipe.csv` を読み込み、装備一覧を自動生成
- `craftsman`（職人種別）と `category`（装備ジャンル）のプルダウンをCSVから自動生成
- 装備名の部分一致検索で、装備ドロップダウン候補を絞り込み
- 職人種別・装備ジャンル・文字検索を併用して装備候補を絞り込み
- `data/tools.csv` から職人道具マスタを読み込み
- 装備に紐づく職人（craftsman）に一致する道具だけを候補表示
- 道具購入単価と耐久から、1回あたり道具コストを自動計算
- 同じ `equipmentName` をまとめて装備ドロップダウンに表示
- 装備を選ぶと、その装備に必要な素材（`materialName`）と必要個数（`quantity`）を表示
- 素材価格を手入力で登録・更新
- 装備販売価格を手入力で登録・更新
- 売値 - 素材合計 - 道具コスト で利益を表示
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

## tools.csv の前提

`data/tools.csv` の列は以下を想定しています。

- `profession`
- `tool_name`
- `durability`
- `sort_order`

## データ参照先一覧

実装（`app.js`）で実際に参照しているデータソースを、画面/機能単位で整理しています。

### レシピ検索（装備・素材・利益計算）

- 参照先: `data/recipe.csv`（相対パス: `./data/recipe.csv`）
- 用途:
  - 装備一覧・必要素材一覧の生成
  - 職人種別（`craftsman`）/装備ジャンル（`category`）の絞り込み
- 主な使用項目:
  - `craftsman`
  - `category`
  - `equipmentName`
  - `materialName`
  - `quantity`
- 更新方法:
  - **CSV更新（手動差し替え）**
  - `data/recipe.csv` を更新すると、次回読込時に反映

### レシピ検索（職人道具）

- 参照先: `data/tools.csv`（相対パス: `./data/tools.csv`）
- 用途:
  - 職人道具候補（職人別）と耐久の表示
  - 道具コスト計算（購入単価 ÷ 耐久）
- 主な使用項目:
  - `profession`
  - `tool_name`
  - `durability`
  - `sort_order`
- 更新方法:
  - **CSV更新（手動差し替え）**
  - `data/tools.csv` を更新すると、次回読込時に反映

### バザー価格一覧

- 参照先: `data/bazaar_prices.csv`（相対パス: `./data/bazaar_prices.csv`）
- 用途: バザー価格一覧表示用
- 主な使用項目:
  - `materialName`
  - `item_category`
  - `sort_order`
  - `today_price`
  - `shop_price`
  - `previous_day_price`
  - `updated_at`
  - `update_info`
  - `comment`
- 補足:
  - `today_price` がある場合はそちらを優先表示
  - `today_price` が空欄の場合は `shop_price` を表示
  - 表示時は価格末尾に `G` を付与
  - カテゴリ切り替えUIはプルダウン（`select`）を使用
  - 「すべて」表示時のカテゴリ順は以下で固定
    1. 石系
    2. 植物系
    3. モンスター系
    4. その他
    5. 消費アイテム
  - 同カテゴリ内の並びは **既存順維持**（`sort_order` 昇順、同値時は素材名順）
- 更新方法:
  - **CSV更新（手動差し替え）**
  - `data/bazaar_prices.csv` を更新すると、次回読込時に反映

### 素材単価の保存/引き継ぎ（ブラウザローカル）

- 参照先: `localStorage` キー `dq10_toolweb_data_v1`
- 用途:
  - 素材単価、装備販売価格、道具購入単価などのユーザー入力値を保持
  - CSV再読込時に、同名データへ既存入力値をマージして再利用
- 更新方法:
  - **画面操作で自動更新**
  - エクスポート/インポート機能による更新も可能（JSON/CSV）

### 素材単価インポート（任意）

- 参照先: ユーザーが画面から選択した `.json` / `.csv` ファイル
- 用途:
  - 素材単価の一括反映（`name` と `price` を参照）
- 更新方法:
  - **手動ファイル選択**
  - 画面の「単価を読込」から任意ファイルを読み込み

### 固定値・フォールバックデータ（コード内定義）

- 参照先: `app.js` 内 `defaultData` / `feeRate: 5`
- 用途:
  - CSV読込失敗時の初期表示データ
  - 手数料率（5%）の基準値
- 更新方法:
  - **コード更新（固定値参照）**

### 未参照（現行実装）

- キラキラ拾い系データ:
  - 現在のコード上で専用の JSON/CSV は参照していません。
- `data/bazaar_prices_history.csv`:
  - リポジトリ上にはありますが、現行実装からは読込していません。

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


## 更新履歴

- 2026-04-02: バザー価格一覧のカテゴリ切り替えUIをプルダウン（select）に変更。
- 2026-04-02: 「すべて」表示時のカテゴリ順を `石系 → 植物系 → モンスター系 → その他 → 消費アイテム` に固定。
- 2026-04-02: 「すべて」表示時の同カテゴリ内は既存順（`sort_order`）維持に統一。
- 2026-04-02: バザー価格CSVの参照先を `data/bazaar_prices.csv` に統一。
- 2026-04-02: README に実装ベースの「データ参照先一覧」を追記。

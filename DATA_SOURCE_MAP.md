# DATA_SOURCE_MAP

dq10toolweb で「どの画面のどの表示が、どのデータファイル・列・キーを参照しているか」を、`app.js` の実装ベースで整理したメモです。  
2026-05-04 時点の確認結果です。

## 前提
- 本資料は **実コード確認ベース** です
- 可能なものは **実ファイル名 / 実列名 / 実キー名** を記載しています
- 不明なもの、現状コード上で未使用に見えるものは **要確認** としています
- CSV/JSON の読み込み元パス定義は主に [app.js](./app.js) 冒頭の定数を参照しています

## 共通

### データファイル読込の主な定義
- `./data/recipe.csv`
- `./data/tools.csv`
- `./data/craft_ideal_values.csv`
- `./data/bazaar_prices.csv`
- `./data/bazaar_prices_history.csv`
- `./data/datapresent_codes.csv`
- `./data/field_farming_monsters.csv`
- `./data/routine_tasks.csv`
- `./data/orb_data.csv`
- `./data/monster_data.csv`
- `./data/orb_monsters.csv`  
  要確認: `app.js` では任意ファイルとして読みに行くが、現時点の `data/` には見当たらない
- `./data/white_box.csv`
- `./data/equipment_data.csv`
- `./data/monster_detail_data.csv`
- `./data/map_master.csv`
- `./data/updates.json`
- `./data/ui-settings.json`
- `./data/content.json`

### localStorage 主なキー
- `dq10_toolweb_data_v1`
  - 職人アシストの主状態
  - 素材単価
  - 装備ごとの販売価格
  - 工具購入価格
  - その他職人アシスト用 state 全体
- `dq10_toolweb_bazaar_favorites_v1`
  - バザーお気に入り素材
  - `showFavoritesOnly`
- `dq10_toolweb_recipe_favorites_v1`
  - 職人アシストのお気に入り装備
- `dq10_toolweb_home_features_v1`
  - ホームに固定表示する便利ツールカード
- `dq10_toolweb_memos_v1`
  - メモ機能
- `dq10_toolweb_admin_checklist_v1`
  - `/admin-bazaar/` の運用チェックリスト
- `dq10_toolweb_routine_tasks_v1`
  - 日課・週課・月課チェックの完了状態
- `dq10_toolweb_admin_mode_v1`
  - 管理UI関連の状態保存

---

## バザー価格一覧

### 一覧カード / 詳細モーダルの基本情報
- 素材名 → `data/bazaar_prices.csv` の `materialName`
- ジャンル → `data/bazaar_prices.csv` の `item_category`
- 標準順ソート順 → `data/bazaar_prices.csv` の `sort_order`
- 現在価格 → `data/bazaar_prices.csv` の `today_price`
- 店売り/固定価格の代替表示 → `data/bazaar_prices.csv` の `shop_price`
- 前日価格 → `data/bazaar_prices.csv` の `previous_day_price`
- 更新日時 → `data/bazaar_prices.csv` の `updated_at`
- 補足コメント / 固定価格判定 / 停止中判定 → `data/bazaar_prices.csv` の `comment`
- 公式相場URL → `data/bazaar_prices.csv` の `official_url`
- 出品件数 → `data/bazaar_prices.csv` の `number`  
  要確認: 現在の CSV に列が無い場合は `null` 補完

### 価格の見せ方
- 最新表示価格は `today_price` 優先
- `today_price` が空の場合は `shop_price` を表示用価格として利用
- 価格差 / 前日比は `today_price` と `previous_day_price` から JS 計算

### 月別グラフ / 履歴
- 履歴日付 → `data/bazaar_prices_history.csv` の `date`
- 履歴素材名 → `data/bazaar_prices_history.csv` の `material_name`
- 履歴価格 → `data/bazaar_prices_history.csv` の `price`
- 履歴出品数 → `data/bazaar_prices_history.csv` の `listing_count`
- 履歴ソース → `data/bazaar_prices_history.csv` の `source`

### 詳細モーダルの関連情報
- この素材を使うレシピ → `data/recipe.csv`
  - 装備名 → `equipmentName`
  - 素材名 → `materialName`
  - 必要数 → `quantity`
- この素材を落とすモンスター → `data/monster_detail_data.csv`
  - 通常ドロップ → `normal_drop`
  - レアドロップ → `rare_drop`

### お気に入り・絞り込み
- お気に入り状態 → localStorage `dq10_toolweb_bazaar_favorites_v1`
- 「お気に入りのみ表示」状態 → 同じく `dq10_toolweb_bazaar_favorites_v1`

---

## 職人アシスト

### 装備候補 / レシピ本体
- 職人種別 → `data/recipe.csv` の `craftsman`
- 装備ジャンル → `data/recipe.csv` の `category`
- 装備レベル → `data/recipe.csv` の `equipmentLevel`
- 装備名 → `data/recipe.csv` の `equipmentName`
- レシピ素材 → `data/recipe.csv` の `materialName`
- 必要数 → `data/recipe.csv` の `quantity`

### 素材単価
- 初期読込元 → `data/bazaar_prices.csv`
  - `materialName`
  - `today_price`
  - `shop_price`
- ユーザー変更後の単価 → localStorage `dq10_toolweb_data_v1`

### 装備ごとの販売価格
- CSV由来ではなく localStorage `dq10_toolweb_data_v1` に保存
- ★0〜★3 の販売価格もここに保存

### 工具
- 工具名 → `data/tools.csv` の `tool_name`
- 対応職人 → `data/tools.csv` の `profession`
- 耐久値 → `data/tools.csv` の `durability`
- 並び順 → `data/tools.csv` の `sort_order`
- 工具購入価格 → localStorage `dq10_toolweb_data_v1`

### 理論値 / 基準値
- 職人種別 → `data/craft_ideal_values.csv` の `job_type`
- 装備名 → `data/craft_ideal_values.csv` の `item_name`
- 部位 → `data/craft_ideal_values.csv` の `part`
- グリッド型 → `data/craft_ideal_values.csv` の `grid_type`
- ★3許容差 → `data/craft_ideal_values.csv` の `star3_tolerance`
- 各マス → `cell_1` 〜 `cell_9`

### 装備性能表示
職人アシストの性能表示は、基本的に選択装備名を `data/equipment_data.csv` と完全一致照合して取得。

- 装備名一致 → `equipment_name`
- 装備種 / グループ判定 → `equipment_group`, `equipment_type`
- 武器攻撃力 → `attack`
- 盾守備力 → `defense`
- 盾ガード率 → `shield_guard_rate`
- 特性 → `traits`
- 防具セット効果 → `traits`
  - 防具は `equipment_group=armor` でまとめたセット側データを参照

### 防具セット部位補完
- 防具セット内の部位候補は `data/recipe.csv` から逆引き
  - 装備名と `category`（頭 / からだ上 / からだ下 / 腕 / 足）を利用

### お気に入り
- 職人アシストのお気に入り装備 → localStorage `dq10_toolweb_recipe_favorites_v1`

---

## 装備情報

### 基本情報
- 装備ID → `data/equipment_data.csv` の `equipment_id`
- 装備グループ → `equipment_group`
  - `weapon` / `armor` など
- 装備レベル → `equipment_level`
- 装備種別 → `equipment_type`
  - 片手剣 / 小盾 / 大盾 / 頭 / からだ上 など
- 装備名 → `equipment_name`

### ステータス
- 攻撃力 → `attack`
- 攻撃魔力 → `attack_magic`
- 回復魔力 → `heal_magic`
- 守備力 → `defense`
- 盾ガード率 → `shield_guard_rate`
- HP → `hp`
- MP → `mp`
- すばやさ → `speed`
- きようさ → `dex`
- おしゃれさ → `fashionable`
- 重さ → `weight`
- 特性 / セット効果 → `traits`

### 防具セット表示
- 防具セットとしてのまとまり → `data/equipment_data.csv` の `equipment_group=armor`
- セット内の各部位候補 → `data/recipe.csv`
  - `equipmentName`
  - `category`
- セット効果表示 → `data/equipment_data.csv` の `traits`

### 白宝箱ドロップモンスター
- 逆引き元 → `data/white_box.csv`
  - `monster_name`
  - `item_name`
  - `item_slot`
  - `equipment_level`
  - `drop_status`
- 武器・盾は装備名一致で逆引き
- 防具セットは、各部位装備名ごとに `white_box.csv` を逆引きしてまとめて表示

### 推定原価
- レシピ素材 → `data/recipe.csv`
- 素材単価 → `data/bazaar_prices.csv` + localStorage `dq10_toolweb_data_v1`

---

## モンスター情報

### 基本表示
- モンスターID → `data/monster_detail_data.csv` の `monster_id`
- モンスター名 → `monster_name`
- 系統 → `monster_type`
- 経験値 → `exp`
- ゴールド → `gold`
- 通常ドロップ → `normal_drop`
- レアドロップ → `rare_drop`
- 白宝箱 → `white_box`
- 宝珠 / オーブ → `orbs`
- 生息地 → `habitats`

### 生息地補足
- マップ / エリアのバージョン補足 → `data/map_master.csv`
  - マップ名 → `map_name`
  - 開放バージョン → `unlock_version`
  - エリアグループ → `area_group`
  - `monster_detail_data.csv` の `habitats` を map 名として照合

### ドロップ価格
- 通常ドロップ価格 → `data/bazaar_prices.csv` と `normal_drop` を照合
- レアドロップ価格 → `data/bazaar_prices.csv` と `rare_drop` を照合
- 監視対象判定 / 固定価格除外 → `data/bazaar_prices.csv` の `comment`

### 白宝箱リンク
- 白宝箱装備一覧 → `data/monster_detail_data.csv` の `white_box`
- 装備詳細への遷移先判定 → `data/equipment_data.csv` / `data/white_box.csv` を利用

### 系統アイコン
- モンスター系統アイコン画像 → `icons/`
  - `icons/slime.png`
  - `icons/beast.png`
  - `icons/demon.png`
  - `icons/plant.png`
  - `icons/material.png`
  - `icons/machine.png`
  - `icons/bird.png`
  - `icons/humanoid.png`
  - `icons/dragon.png`
  - `icons/element.png`
  - `icons/undead.png`
  - `icons/water.png`
  - `icons/beetle.png`

---

## 宝珠情報

### 基本表示
- 宝珠ID → `data/orb_data.csv` の `orb_id`
- 宝珠名 → `orb_name`
- 属性 → `orb_category`
- 効果 → `effect`

### ドロップモンスター
- 宝珠CSV直持ちのモンスター名 → `data/orb_data.csv` の `monster_name`
  - カンマ区切りを分割して利用
- 追加の関連ファイル（任意） → `data/orb_monsters.csv`
  - `orb_id`
  - `monster_id` または `monster_name`
  - 現在ファイル実体は見当たらないため **要確認**
- モンスターID→名前の解決用 → `data/monster_data.csv`
  - `monster_id`
  - `monster_name`

### モンスター情報へのリンク
- 宝珠カード内のドロップモンスター表示は、上記モンスター名を `/monster/?monsterSearch=...` へつなぐ

---

## フィールド狩り

### 基本データ
- モンスター名 → `data/field_farming_monsters.csv` の `monster_name`
- 地域名 → `area`
- 地域付き表示名 → `monster_area`  
  - 列が無ければ `monster_name / area` でJS補完
- HP → `hp`
- 通常ドロップ → `normal_drop`  
  - 旧列名 `normal_dr` にも対応
- レアドロップ → `rare_drop`
- メモ → `note`
- マップ画像URL → `map_url`

### 価格
- 通常ドロップ価格 → `data/bazaar_prices.csv` と `normal_drop` を照合
- レアドロップ価格 → `data/bazaar_prices.csv` と `rare_drop` を照合

### マップ画像
- 画像本体 → `public/maps/`
- CSV の `map_url` から表示先を決定

---

## 日課・週課・月課

### 一覧データ
- ID → `data/routine_tasks.csv` の `routine_id`
- ツール対応 → `tool_available`
- リセットルール → `reset_rule`
- 開始バージョン → `start_varsion`  
  - 列名は実ファイル上この綴り
- 種別（日課 / 週課 / 月課） → `type`
  - `daily`
  - `weekly`
  - `monthly`
- タイトル → `title`
- やり方 → `hou_to`  
  - 列名は実ファイル上この綴り
- 報酬 → `reward`
- 所要時間 → `estimated_time`
- コメント → `comment`
- 並び順 → `sort_order`

### チェック状態
- localStorage → `dq10_toolweb_routine_tasks_v1`

### 自動リセット判定
- `reset_rule` を JS ロジックで解釈
  - `daily_0600`
  - `weekly_sun_0600`
  - `monthly_1_0600`
  - `monthly_1_15_0600`
  - `monthly_10_25_0600`
  など

---

## お気に入り・メモ

### お気に入り
- バザーお気に入り → localStorage `dq10_toolweb_bazaar_favorites_v1`
- 職人アシストお気に入り → localStorage `dq10_toolweb_recipe_favorites_v1`
- ホームに固定するツールカード → localStorage `dq10_toolweb_home_features_v1`

### メモ
- メモ内容全体 → localStorage `dq10_toolweb_memos_v1`
- 対象:
  - モンスター
  - 宝珠
  - 装備
  - 防具セット
  - バザー
  - 職人アシスト

---

## ホーム・更新情報

### ホーム上部文言
- サイトタイトル → `data/content.json` の `site_title`
- 説明文1 → `site_intro`
- 説明文2 → `site_summary`
- 注意書き → `site_notice`
- 更新情報見出し → `updates_heading`
- 便利ツール見出し → `tools_heading`
- 便利ツール補足 → `tools_intro`
- メニュー補足 → `menu_hint`
- UI設定見出し類 → `ui_settings_heading`, `ui_settings_note`
- 本文編集見出し類 → `content_editor_heading`, `content_editor_note`
- 更新情報編集見出し類 → `updates_editor_heading`, `updates_editor_note`
- メニュータイトル → `menu_title`

### 更新情報
- `data/updates.json`
  - `date`
  - `text`
  - `url`
  - `link_label`

### ホームカード
- 定義本体 → `app.js` の `HOME_FEATURE_DEFINITIONS`
  - `id`
  - `tabId`
  - `title`
  - `icon`
- ホーム表示ON/OFF → localStorage `dq10_toolweb_home_features_v1`

### UI設定
- `data/ui-settings.json`
  - `sectionVerticalSpace`
  - `cardPadding`
  - `cardRadius`
  - `titleFontSize`
  - `bodyFontSize`
  - `buttonHeight`
  - `buttonRadius`
  - `iconSize`
  - `mobileCardColumns`
  - `desktopMaxWidth`

### 免責文
- フッター免責文は `index.html` 側の静的文言
- `content.json` ではなく HTML 直書き部分あり

---

## プレゼントのじゅもん

### 基本データ
- じゅもん/受け取りコード → `data/datapresent_codes.csv` の `code`
- 報酬 → `reward`
- 期限 → `expires_at`
- リンク種別 → `link_type`
  - `url` の時は受取ページリンク
  - それ以外は じゅもんコード扱い
- URL → `url`
- 条件/補足 → `note`

### 外部リンク
- `link_type=url` の時 → `url` をそのまま使用
- 通常コードの時 → 公式URL `https://hiroba.dqx.jp/sc/campaignCode/itemcode/?code=...` をJS生成

---

## 白宝箱ページ

### 基本データ
- 元データ → `data/white_box.csv`
- 利用列
  - `monster_id`
  - `monster_name`
  - `item_name`
  - `item_slot`
  - `equipment_level`
  - `drop_status`

### 画面での役割
- 白宝箱単独ページの一覧表示
- 装備情報への逆引き
- 装備情報ページでの「白宝箱ドロップモンスター」表示

---

## assets / icons / public

### 装備アイコン
- `assets/icons/equipment/`
  - `one_hand_sword.png`
  - `two_hand_sword.png`
  - `dagger.png`
  - `axe.png`
  - `hammer.png`
  - `spear.png`
  - `bow.png`
  - `boomerang.png`
  - `claw.png`
  - `fan.png`
  - `whip.png`
  - `staff.png`
  - `rod.png`
  - `stick.png`
  - `small_shield.png`
  - `large_shield.png`
  - `helmet.png`
  - `armor_upper.png`
  - `armor_lower.png`
  - `gloves.png`
  - `boots.png`
  - `set_equipment.png`

### アイテムアイコン
- `assets/icons/item/`
  - `stone.png`
  - `plant.png`
  - `bone.png`
  - `herb.png`
  - `miscellaneous goods.png`

### 宝珠アイコン
- `assets/icons/orb/`
  - `fire_orb.png`
  - `water_orb.png`
  - `wind_orb.png`
  - `light_orb.png`
  - `dark_orb.png`

### モンスター系統アイコン
- `icons/`
  - `slime.png`
  - `beast.png`
  - `demon.png`
  - `plant.png`
  - `material.png`
  - `machine.png`
  - `bird.png`
  - `humanoid.png`
  - `dragon.png`
  - `element.png`
  - `undead.png`
  - `water.png`
  - `beetle.png`

### PWA/アプリアイコン
- `icons/app-icon-192.png`
- `icons/app-icon-512.png`
- `icons/apple-touch-icon-180.png`

### フィールド狩りマップ
- `public/maps/`

### 入口URL中継
- `public/entry-loader.js`

---

## 要確認・補足

### `data/monster_data.csv`
- 現状コード上、**モンスター情報ページ本体** ではなく、
  **宝珠→モンスター名解決の補助** に使われています
- 利用列:
  - `monster_id`
  - `monster_name`
- `monster_type` 列は現状の宝珠読込では未使用

### `data/orb_monsters.csv`
- `app.js` では任意ファイル扱いで読み込みを試行
- 現在の `data/` には実体が見当たらない
- 将来、宝珠とモンスターの関係を別CSV化する前提の痕跡の可能性あり

### `data/last-updated.json`
- `data/` 配下に存在するが、今回確認した `app.js` 上では主要表示への参照を確認できず
- 現在未使用、または別用途の可能性あり

### `public/data/bazaar_prices.csv`
- `public/data/` にも同名CSVが存在
- フロント側の主読込は `./data/bazaar_prices.csv`
- `public/data/bazaar_prices.csv` の用途は要確認

### `data/bazaar_prices_history_backup_broken.csv`
- バックアップ用途ファイルに見える
- 現行読込対象ではない

---

## 参照の優先目安
- **バザー系表示を直す** → まず `data/bazaar_prices.csv` と `data/bazaar_prices_history.csv`
- **職人アシストを直す** → まず `data/recipe.csv`、次に `data/bazaar_prices.csv`、必要に応じて `data/equipment_data.csv`
- **装備情報を直す** → まず `data/equipment_data.csv`、防具セット部位は `data/recipe.csv`、白宝箱は `data/white_box.csv`
- **モンスター情報を直す** → まず `data/monster_detail_data.csv`、価格は `data/bazaar_prices.csv`、生息地補足は `data/map_master.csv`
- **宝珠情報を直す** → まず `data/orb_data.csv`
- **フィールド狩りを直す** → まず `data/field_farming_monsters.csv`、価格は `data/bazaar_prices.csv`、画像は `public/maps/`
- **日課・週課・月課を直す** → `data/routine_tasks.csv` と localStorage
- **ホーム文言を直す** → `data/content.json`
- **更新情報を直す** → `data/updates.json`

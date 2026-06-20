(function () {
  "use strict";

  const SUMMARY_TEXT = "このページの使い方・注意点を見る";
  const GUIDE_STYLE_HREF = "/assets/page-guide.css";

  const RELATED_LINKS = {
    home: { href: "/", label: "トップページ" },
    bazaar: { href: "/bazaar/", label: "バザー価格一覧" },
    craft: { href: "/craft/", label: "職人アシスト" },
    crystal: { href: "/crystal-simulator/", label: "結晶シミュレーター" },
    craftRecords: { href: "/craft-records/", label: "職人記録" },
    equipment: { href: "/equipment/", label: "装備データベース" },
    monster: { href: "/monster/", label: "モンスター情報" },
    orb: { href: "/orb/", label: "宝珠データベース" },
    routine: { href: "/routine/", label: "日課・週課チェック" },
    favorites: { href: "/favorites/", label: "お気に入り" },
    presentCodes: { href: "/present-codes/", label: "プレゼントのじゅもん" },
    steal: { href: "/steal-farming/", label: "盗み金策ランキング" },
    cell: { href: "/cell-farming/", label: "魔因細胞金策ランキング" },
    whitebox: { href: "/whitebox/", label: "白宝箱データベース" },
    about: { href: "/about/", label: "このサイトについて" }
  };

  const GUIDE_MAP = {
    home: {
      can: "このサイトでは、DQ10のバザー価格、職人原価、結晶化、金策候補、日課チェックなどをまとめて確認できます。トップページでは主要ツールへの入口と、更新情報、価格変動の目安を下へ進むほど自然に見られるようにしています。",
      use: "目的に近いカードやメニューから各ツールを開いてください。相場を見たいときはバザー価格一覧、装備や素材から原価を見たいときは職人アシスト、装備の結晶化を比べたいときは結晶シミュレーターが入口になります。",
      view: "表示される価格、更新日時、ランキングは、CSVに保存された更新時点のデータをもとにしています。前回価格や出品件数があるページでは、相場が上がっているか、在庫が薄いかを見るための参考にできます。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。バザー価格、ランキング、シミュレーション結果は目安であり、イベントやアップデート、時間帯で変動します。高額取引や大量購入の前には、ゲーム内で最終確認してください。",
      links: ["bazaar", "craft", "crystal", "steal", "routine"]
    },
    profit: {
      can: "職人アシストでは、装備や料理などのレシピ素材、素材価格、販売価格をもとに、おおよその原価と利益を確認できます。作成個数や星ごとの売上を入力すると、複数個作った場合の見込みも整理できます。",
      use: "職人種別や装備ジャンルを選び、商材を選択してください。必要に応じて素材価格、職人道具代、星ごとの販売価格、作成個数を調整すると、実際の作業に近い形で利益を見られます。",
      view: "原価は素材価格と必要個数から計算されます。販売利益はバザー手数料を引いた手取りを基準にしているため、星のばらつきや販売単価を変えながら、黒字ラインを探す用途に向いています。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。素材価格や売却価格は更新時点の目安で、実際の相場や売れ行きとはずれる場合があります。作成前や出品前にはゲーム内バザーで最終確認してください。",
      links: ["bazaar", "equipment", "craftRecords", "favorites"]
    },
    "craft-records": {
      can: "職人記録では、作った商材、作成数、星ごとの個数、原価、売上、メモをこの端末に保存できます。日ごとの作業結果や、最近よく作っている商材の利益を振り返るための記録ページです。",
      use: "作業日、商材名、作成数、星ごとの個数、原価と売上を入力して記録してください。作業中カウントを使うと、星が出るたびに数を増やせます。CSV出力と読込でバックアップもできます。",
      view: "総集計では期間や商材で絞り込み、合計利益や平均売上を確認できます。時給や利益は入力値に依存するため、バザー手数料、売れ残り、値下げの有無も含めて実際の結果と照らしてください。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。記録は主にブラウザ内に保存されるため、端末変更やブラウザデータ削除で消える場合があります。大事な記録はCSVで控えておくことをおすすめします。",
      links: ["craft", "bazaar", "favorites"]
    },
    bazaar: {
      can: "バザー価格一覧では、素材や一部アイテムの現在価格、前回価格、出品件数などを確認できます。職人原価、金策候補、買い置き判断の材料として、相場をざっくり見るためのページです。",
      use: "検索やフィルターで素材名やカテゴリを絞り込み、気になる項目を開いて詳細を確認してください。個別ページがある素材は、関連レシピや使い道もあわせて見られます。",
      view: "現在価格は更新時点の目安です。前回価格との差を見ると、急に高くなった素材や下がった素材を把握しやすくなります。出品件数が少ない素材は、価格が大きく動きやすい点にも注意してください。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。バザー価格は時間帯、出品数、イベント、アップデートで変動します。高額素材の購入や大量売買の前には、必ずゲーム内バザーで最終確認してください。",
      links: ["craft", "crystal", "steal", "cell"]
    },
    "present-codes": {
      can: "プレゼントのじゅもん一覧では、現在確認できるDQ10のプレゼントのじゅもん、報酬、期限の目安をまとめています。入力忘れを減らすために、確認用のメモとして使えるページです。",
      use: "一覧から未入力のじゅもんを確認し、ゲーム内や公式の入力画面で利用してください。期限が近いものから優先して確認すると、受け取り忘れを防ぎやすくなります。",
      view: "表示内容は確認できた情報をもとに整理しています。期限、報酬、入力条件は変更される場合があるため、気になるものは公式のお知らせやゲーム内の表示と合わせて見てください。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。掲載情報は目安であり、期限切れ、入力済み、対象外アカウントなどで利用できない場合があります。最終的な可否はゲーム内や公式情報で確認してください。",
      links: ["home", "routine", "about"]
    },
    "crystal-simulator": {
      can: "結晶シミュレーターでは、装備を買って結晶化する場合、買って錬金する場合、作って錬金する場合の原価と利益を比較できます。結晶単価、装備価格、取り出し数、出品価格を変えて試算できます。",
      use: "装備レベル、武器・防具、シリーズや部位、できのよさを選び、購入単価や素材原価、結晶単価などを入力してください。装備名検索は補助機能として使えます。結晶数は目安が入りますが直接修正できます。",
      view: "結晶売却手取りは、結晶単価と結晶数にバザー手数料を反映して計算しています。錬金済み装備は実際の成功・失敗内容で結晶数が変わるため、表示された目安を実物に合わせて調整すると精度が上がります。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。結晶数、素材原価、バザー出品利益は目安で、相場や錬金内容で変わります。購入前、錬金前、出品前にはゲーム内で最終確認してください。",
      links: ["bazaar", "equipment", "craft"]
    },
    "steal-farming": {
      can: "盗み金策ランキングでは、通常ドロップとレアドロップの価格をもとに、盗み金策で候補になりやすいモンスターを確認できます。どの素材が高いかを素早く見るためのランキングです。",
      use: "上位のモンスターを見て、ドロップ品、価格、関連情報を確認してください。実際に狩る前には、出現場所、狩りやすさ、混雑、盗みやすさ、必要耐性も別途確認すると判断しやすくなります。",
      view: "ランキングは主にドロップ品価格をもとにした目安です。出品件数が少ない素材や、イベントで一時的に高くなった素材は、順位が実際の稼ぎやすさと一致しないことがあります。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。価格、ランキング、効率は目安であり、ドロップ率や狩場状況を保証するものではありません。実際に行く前にゲーム内バザーと現地の状況を確認してください。",
      links: ["bazaar", "monster", "cell"]
    },
    "cell-farming": {
      can: "魔因細胞金策ランキングでは、魔因細胞やかけら狙いと通常ドロップ価格を参考に、フィールド狩り向けの候補を確認できます。素材相場から狩場を選ぶための補助ページです。",
      use: "並び替えを切り替えながら、通常ドロップやレアドロップが高いモンスターを探してください。狩場へ行く前に、対象モンスターの出現場所、討伐しやすさ、混雑具合も確認すると使いやすくなります。",
      view: "表示される価格や順位は、更新時点のバザー価格をもとにした目安です。細胞の出方、討伐速度、構成、料理や元気玉の有無などは計算に含まれないため、実際の効率とは差が出ます。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。ランキングや価格は参考用で、ゲーム内の最新相場や狩場状況とは異なる場合があります。出発前にはゲーム内で最終確認してください。",
      links: ["bazaar", "monster", "steal"]
    },
    routine: {
      can: "日課・週課・月課チェックでは、DQ10で定期的に消化したい項目をチェックリストとして管理できます。日課、週課、月課を切り替えながら、やることの抜け漏れを減らすためのページです。",
      use: "終わった項目にチェックを入れてください。まとめてチェック、チェック解除もできます。チェック状態はこの端末のブラウザに保存されるため、同じ端末で続きから確認できます。",
      view: "進捗表示は、登録されている項目のうちチェック済みがどれだけあるかを示します。リセット時刻や更新タイミングは、ゲーム内の仕様変更やイベントで変わる可能性があります。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。チェック状態は端末内保存のため、ブラウザデータ削除や別端末では引き継がれない場合があります。重要な期限はゲーム内でも確認してください。",
      links: ["presentCodes", "home", "favorites"]
    },
    "boss-card": {
      can: "ボスカード管理では、手持ちのボスカードやメダルの期限を登録し、残り時間を確認できます。期限が近いものを忘れにくくするための、簡易的な管理メモです。",
      use: "ゲーム内で表示されている残り時間、カード名、枚数、必要ならメモを入力して登録してください。登録後は一覧で期限の近いカードを確認できます。",
      view: "期限日時は入力された残り時間から計算しています。ゲーム内表示との差や入力ミスがあると、実際の期限とずれる場合があります。残り時間が短いカードは早めにゲーム内で再確認してください。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。登録データはこの端末のブラウザに保存されます。期限や枚数を保証するものではないため、消化前にはゲーム内で最終確認してください。",
      links: ["routine", "home"]
    },
    orbs: {
      can: "宝珠データベースでは、宝珠の効果、カテゴリ、落とすモンスターを確認できます。欲しい宝珠を探すときや、どのモンスターを狙うか決めるときの下調べに使えます。",
      use: "宝珠名、効果、モンスター名で検索し、カテゴリで絞り込んでください。気になる宝珠から、落とすモンスターや関連情報を確認できます。",
      view: "表示される効果やドロップ情報は、登録データをもとにした検索用の情報です。アップデートで効果や入手先が変わる場合があるため、実際に集める前にゲーム内情報も確認してください。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。宝珠情報やモンスター情報は目安で、最新の公式データと差が出る場合があります。最終確認はゲーム内または公式情報で行ってください。",
      links: ["monster", "equipment", "home"]
    },
    "white-boxes": {
      can: "白宝箱データベースでは、白宝箱から入手できる装備と、それを落とすモンスターを確認できます。装備レベルや部位から、狙いたい装備を探すためのページです。",
      use: "武器・防具を切り替え、部位や並び順で絞り込んでください。装備名やモンスター名が分かっている場合は、関連する装備ページやモンスターページも確認すると探しやすくなります。",
      view: "白宝箱の情報は登録データをもとに表示しています。ドロップ率、狩りやすさ、出現数、混雑状況は含まれないため、実際の集めやすさは狩場によって変わります。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。装備や白宝箱情報は目安で、アップデートにより変更される場合があります。狙う前にはゲーム内や公式情報で最終確認してください。",
      links: ["equipment", "monster", "orb"]
    },
    "equipment-db": {
      can: "装備データベースでは、武器や防具のレベル、種別、性能、セット効果、必要素材、白宝箱情報などを確認できます。装備選びや職人原価の下調べに使えるページです。",
      use: "武器・防具を切り替え、レベル順や装備ジャンルで絞り込んでください。装備名検索や白宝箱ドロップモンスター検索を開くと、探したい装備へ直接近づけます。",
      view: "素材価格から出る原価は更新時点の目安です。装備性能やセット効果は、用途や職業、錬金内容によって価値が変わります。バザー価格と素材原価を比べて判断してください。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。装備情報、素材価格、白宝箱情報は目安で、アップデートや相場変動で変わる場合があります。最終確認はゲーム内で行ってください。",
      links: ["craft", "crystal", "bazaar", "monster"]
    },
    "monster-info": {
      can: "モンスター情報では、ドロップ品、白宝箱、宝珠、生息地などをまとめて確認できます。素材集め、宝珠集め、白宝箱狙いの候補探しに使えるデータベースです。",
      use: "モンスター名、ドロップ品、生息地で検索し、種別や並び順で絞り込んでください。ドロップ品の価格も合わせて見ると、金策候補としての目安をつかみやすくなります。",
      view: "表示されるドロップ価格は更新時点の目安です。経験値、ドロップ品、宝珠、白宝箱は登録データをもとに表示しており、狩場の混雑や実際の入手確率は含まれていません。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。モンスター情報や価格は目安で、アップデートやゲーム内状況で変わる場合があります。狩りに行く前にゲーム内で最終確認してください。",
      links: ["bazaar", "orb", "equipment", "steal"]
    },
    favorites: {
      can: "お気に入りでは、よく見る素材、装備、レシピをまとめて確認できます。職人作業や相場確認で何度も開くページを、すぐ戻れるようにするための補助機能です。",
      use: "個別ページや一部のツールからお気に入りに追加すると、このページに一覧表示されます。レシピと素材のタブを切り替え、必要なページへ移動してください。",
      view: "お気に入りは、この端末のブラウザに保存されます。項目の価格や内容は各ページを開いた時点の表示に従うため、古いメモのまま判断せず、必要に応じて最新表示を確認してください。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。お気に入りデータは端末内保存のため、ブラウザデータ削除や別端末では消える場合があります。価格や結果はゲーム内で最終確認してください。",
      links: ["bazaar", "equipment", "craft", "crystal"]
    },
    material: {
      can: "この素材ページでは、対象アイテムのバザー価格、前回価格、出品件数、使い道や関連レシピを確認できます。職人作業や素材売買の前に、相場の雰囲気をつかむための個別ページです。",
      use: "価格と更新日時を確認し、関連レシピや使い道がある場合はリンク先も見てください。素材を買う予定がある場合は、必要個数と合計額を職人アシスト側でも確認すると判断しやすくなります。",
      view: "現在価格は更新時点の目安で、前回価格や出品件数は相場の動きを見るための参考値です。出品数が少ない素材は、表示価格と実際に買える価格がずれることがあります。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。素材価格は時間帯、出品数、イベント、アップデートで変動します。大量購入や高額取引の前には、ゲーム内バザーで最終確認してください。",
      links: ["bazaar", "craft", "favorites"]
    },
    equipment: {
      can: "この装備ページでは、対象装備のレベル、種別、性能、セット効果、必要素材、白宝箱や関連レシピを確認できます。装備選び、職人作成、結晶化の下調べに使える個別ページです。",
      use: "性能や必要素材を確認し、関連する職人アシスト、装備一覧、結晶シミュレーターへ移動してください。作成や購入を検討する場合は、素材価格とバザー価格の両方を見ると判断しやすくなります。",
      view: "素材原価や価格は更新時点の目安です。錬金内容、できのよさ、セット効果の需要、白宝箱の入手しやすさによって、実際の価値や利益は変わります。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。装備情報、相場、シミュレーション結果は参考用です。購入、作成、出品、結晶化の前にはゲーム内で最終確認してください。",
      links: ["equipment", "craft", "crystal", "bazaar"]
    },
    recipe: {
      can: "このレシピページでは、対象レシピの必要素材、必要個数、関連する素材や装備を確認できます。職人作業を始める前に、素材の抜け漏れや原価の目安を見るためのページです。",
      use: "素材名と必要個数を確認し、素材価格ページや職人アシストへ移動してください。実際に作る数が決まっている場合は、職人アシストで作成個数や販売価格も入力すると利益を見やすくなります。",
      view: "素材価格は更新時点の目安です。レシピによっては素材価格が大きく動くものや、出品数が少ない素材を含むものがあります。原価はあくまで判断材料として見てください。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。レシピ、素材価格、原価は目安で、ゲーム内や公式情報と差が出る場合があります。作成前にはゲーム内で最終確認してください。",
      links: ["craft", "bazaar", "equipment", "favorites"]
    },
    orb: {
      can: "この宝珠ページでは、対象宝珠の効果、分類、落とすモンスターを確認できます。欲しい宝珠を集める前に、どのモンスターを狙うか調べるための個別ページです。",
      use: "効果を確認し、落とすモンスターのリンクから生息地や関連ドロップを見てください。複数候補がある場合は、狩りやすさや他に欲しいドロップも含めて選ぶと効率的です。",
      view: "宝珠効果や入手先は登録データをもとに表示しています。ドロップ率、出現数、混雑状況、狩りやすさは含まれないため、実際の集めやすさはプレイ環境で変わります。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。宝珠情報は目安で、アップデートにより変更される場合があります。実際に集める前にはゲーム内で最終確認してください。",
      links: ["orb", "monster", "home"]
    },
    monster: {
      can: "このモンスターページでは、対象モンスターのドロップ品、宝珠、白宝箱、生息地などを確認できます。素材集め、宝珠集め、白宝箱狙いの前に見る個別情報ページです。",
      use: "通常ドロップ、レアドロップ、宝珠、装備、マップ情報を確認してください。金策目的の場合は、ドロップ品のバザー価格ページやランキングもあわせて見ると判断しやすくなります。",
      view: "ドロップ品価格は更新時点の目安です。生息地や入手情報は登録データをもとに表示しており、実際の出現数、混雑、ドロップ率、狩りやすさは反映していません。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。モンスター情報、価格、ランキングは参考用です。狩場へ行く前や高額素材を狙う前にはゲーム内で最終確認してください。",
      links: ["monster", "bazaar", "orb", "steal"]
    },
    about: {
      can: "このページでは、DQ10ツールの概要、免責事項、問い合わせ先、プライバシーや利用上の注意を確認できます。サイトの位置づけやデータの扱いを知りたい方向けの案内ページです。",
      use: "各見出しを読み、必要に応じて問い合わせフォームや関連ページへ移動してください。ツールの使い方を知りたい場合は、トップページから目的の機能を開くと探しやすくなります。",
      view: "このサイトの価格、ランキング、計算結果は、収集・更新されたデータをもとにした参考情報です。公式情報やゲーム内表示を置き換えるものではありません。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。掲載内容は正確性を保証するものではなく、バザー価格や各種データは変動します。重要な判断はゲーム内または公式情報で確認してください。",
      links: ["home", "bazaar", "craft", "crystal"]
    },
    generic: {
      can: "このページでは、DQ10のプレイや金策、職人作業の下調べに役立つ情報を確認できます。検索、フィルター、リンクを使うことで、目的のデータへ移動しやすくしています。",
      use: "ページ内の検索欄や選択項目を使って、気になる素材、装備、モンスター、条件を探してください。関連リンクがある場合は、価格、レシピ、装備、モンスター情報を行き来できます。",
      view: "表示される価格、件数、ランキング、計算結果は更新時点の目安です。前回価格や出品件数がある場合は、相場の変化や売買判断の参考にできます。",
      caution: "このサイトはDQ10公式ではない個人制作ツールです。バザー価格やシミュレーション結果は変動し、公式情報やゲーム内表示と差が出る場合があります。最終確認はゲーム内で行ってください。",
      links: ["home", "bazaar", "craft", "equipment"]
    }
  };

  const SPA_SECTION_GUIDES = {
    profit: "profit",
    "craft-records": "craft-records",
    bazaar: "bazaar",
    "present-codes": "present-codes",
    "crystal-simulator": "crystal-simulator",
    "steal-farming": "steal-farming",
    "cell-farming": "cell-farming",
    routine: "routine",
    "boss-card": "boss-card",
    orbs: "orbs",
    "white-boxes": "white-boxes",
    "equipment-db": "equipment-db",
    "monster-info": "monster-info",
    favorites: "favorites"
  };

  function ensureStylesheet() {
    if (document.querySelector(`link[href="${GUIDE_STYLE_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GUIDE_STYLE_HREF;
    document.head.appendChild(link);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderLinks(linkKeys) {
    const links = (linkKeys || [])
      .map((key) => RELATED_LINKS[key])
      .filter(Boolean)
      .map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`)
      .join("");
    return links || `<li><a href="${RELATED_LINKS.home.href}">${RELATED_LINKS.home.label}</a></li>`;
  }

  function createGuideElement(guideKey, extraClass = "") {
    const guide = GUIDE_MAP[guideKey] || GUIDE_MAP.generic;
    const section = document.createElement("section");
    section.className = `page-guide${extraClass ? ` ${extraClass}` : ""}`;
    section.setAttribute("aria-label", "このページの補足ガイド");
    section.dataset.pageGuideKey = guideKey;
    section.innerHTML = `
      <details>
        <summary>${SUMMARY_TEXT}</summary>
        <div class="page-guide-body">
          <h2>このページでできること</h2>
          <p>${escapeHtml(guide.can)}</p>
          <h3>基本的な使い方</h3>
          <p>${escapeHtml(guide.use)}</p>
          <h3>データや結果の見方</h3>
          <p>${escapeHtml(guide.view)}</p>
          <h3>注意点</h3>
          <p>${escapeHtml(guide.caution)}</p>
          <h3>関連ツール</h3>
          <ul>${renderLinks(guide.links)}</ul>
        </div>
      </details>
    `;
    return section;
  }

  function appendGuide(target, guideKey, extraClass = "") {
    if (!target || target.querySelector(":scope > .page-guide")) return null;
    const guide = createGuideElement(guideKey, extraClass);
    target.appendChild(guide);
    return guide;
  }

  function insertHomeGuide() {
    const topUpdateSection = document.getElementById("topUpdateSection");
    const main = document.querySelector("main");
    if (!main || document.querySelector(".home-page-guide")) return;
    const guide = createGuideElement("home", "home-page-guide");
    if (!document.body.classList.contains("is-home-mode")) {
      guide.classList.add("is-collapsed");
    }
    if (topUpdateSection?.parentNode === main) {
      topUpdateSection.insertAdjacentElement("afterend", guide);
    } else {
      main.insertBefore(guide, main.firstChild);
    }
  }

  function initSpaGuides() {
    if (!document.querySelector(".tab-content")) return false;
    insertHomeGuide();
    Object.entries(SPA_SECTION_GUIDES).forEach(([sectionId, guideKey]) => {
      appendGuide(document.getElementById(sectionId), guideKey);
    });
    return true;
  }

  function getIndividualGuideKey() {
    const type = String(document.body?.dataset?.individualType || "").trim();
    const path = window.location.pathname;
    const pathGuideMap = {
      "/bazaar/": "bazaar",
      "/craft/": "profit",
      "/crystal-simulator/": "crystal-simulator",
      "/craft-records/": "craft-records",
      "/equipment/": "equipment-db",
      "/monster/": "monster-info",
      "/orb/": "orbs",
      "/routine/": "routine",
      "/favorites/": "favorites",
      "/present-codes/": "present-codes",
      "/steal-farming/": "steal-farming",
      "/cell-farming/": "cell-farming",
      "/whitebox/": "white-boxes"
    };
    if (pathGuideMap[path]) return pathGuideMap[path];
    if (/^\/bazaar\/.+/.test(path) || /素材|item|material|邏/.test(type)) return "material";
    if (/^\/equipment\/.+/.test(path) || /装備|equipment/.test(type)) return "equipment";
    if (/^\/recipe\/.+/.test(path) || /レシピ|recipe/.test(type)) return "recipe";
    if (/^\/orb\/.+/.test(path) || /宝珠|orb/.test(type)) return "orb";
    if (/^\/monster\/.+/.test(path) || /モンスター|monster/.test(type)) return "monster";
    if (/^\/about\//.test(path) || /^\/privacy\//.test(path) || /^\/terms\//.test(path) || /^\/contact\//.test(path)) return "about";
    return "generic";
  }

  function initStandaloneGuide() {
    const main = document.querySelector("main");
    if (!main || main.querySelector(":scope > .page-guide")) return;
    appendGuide(main, getIndividualGuideKey());
  }

  function init() {
    ensureStylesheet();
    if (!initSpaGuides()) {
      initStandaloneGuide();
    }
  }

  window.DQ10PageGuide = { init };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

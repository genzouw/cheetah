概要
====================

コードネーム
--------------------

**cheetah**


システム構成図
--------------------

<style>
img {
	width: 100%;
}
</style>
![](file:///Users/genzouw/30_projects/cheetah/Network Diagram.png)


0. システム構成ノード情報
--------------------

| ノード名(サーバー名) | ip                              | 
| ---                  | ---                             | 
| DECSY                | 192.168.1.85                    | 
| daito-batch-server   | 192.168.1.200                   | 
| Amazon S3            | s3-ap-northeast-1.amazonaws.com | 


1. DECSYより出力されるファイルの定義
--------------------

### フォーマット

*csv*

### プロパティ

  | 項目名                                             | 例                         | 備考                                   | 
  | :---:                                              | :---:                      | :---:                                  | 
  | 商品番号                                           | **M17-1153**               |                                        | 
  | 単位                                               | **個**                     |                                        | 
  | 在庫状況                                           | **メーカー取り寄せ**       |                                        | 
  | 発送日目安                                         | **6〜8日（土日祝を除く）** |                                        | 
  | 入荷予定区分                                       | **999999**                 | ナビプラスに連携するソート条件値に一致 | 
  | <span style="color:blue">在庫数</span>             | **1**                      | 在庫がない場合には**空**               | 
  | <span style="color:blue">在庫時在庫状況</span>     | **在庫**                   | 在庫がない場合には**空**               | 
  | <span style="color:blue">在庫時発送日目安</span>   | **15:00まで即納**          | 在庫がない場合には**空**               | 
  | <span style="color:blue">在庫時入荷予定区分</span> | **000001**                 | ナビプラスに連携するソート条件値に一致 | 

※<span style="color:blue">青文字</span>の項目は、即出荷可能な在庫を保持している場合にのみ値がセットされる。


### ファイル名

**yyyymmdd-hhmm.csv**

_※年月日-時分のタイムスタンプ値をファイル名、拡張子をcsvとする。_


### 出力例

* 1行目はヘッダ行
* 各項目は**ダブルクォート**で囲まれる

```csv:
"商品番号","単位","在庫状況","発送日目安","入荷予定区分","在庫数","在庫時在庫状況","在庫時発送日目安","在庫時入荷予定区分"
"M17-1153","個","メーカー取り寄せ","6〜8日（土日祝を除く）","999999","1","在庫","15:00まで即納","000001"
...
```


2. daito-batch-serverが変換するjsonファイル項目
--------------------

### フォーマット

**json**

* _※1ファイル内に格納される商品は1つのみ。_
* _※DECSYから100商品のcsvを受信した際には、jsonファイルは100ファイル作成される。_
* _※ブラウザから参照される際の転送負荷を減らすために出来る限り不要なスペース（空白、改行、タブ）は出力しない。ワンラインで出力。_


### プロパティ

DECSYより出力されるcsvのプロパティと同様のため、省略。

| 項目名                                             | 例                         | 算出方法              | 
| :---:                                              | :---:                      | :---:                 | 
| データ出力日時                                     | **11/04(金) 11:00**        | csvのファイル名       | 
| 商品番号                                           | **M17-1153**               | csvのプロパティ値     | 
| 単位                                               | **個**                     | csvのプロパティ値     | 
| 在庫状況                                           | **メーカー取り寄せ**       | csvのプロパティ値     | 
| 発送日目安                                         | **6〜8日（土日祝を除く）** | csvのプロパティ値     | 
| 入荷予定区分                                       | **z999999**                | "z" + csvプロパティ値 | 
| <span style="color:blue">在庫数</span>             | **1**                      | csvのプロパティ値     | 
| <span style="color:blue">在庫時在庫状況</span>     | **在庫**                   | csvのプロパティ値     | 
| <span style="color:blue">在庫時発送日目安</span>   | **15:00まで即納**          | csvのプロパティ値     | 
| <span style="color:blue">在庫時入荷予定区分</span> | **z000001**                | "z" + csvプロパティ値 | 


### ファイル名

<span style="color:red">商品番号</span>.json

* _※商品番号部分は、実際の商品番号の値がセットされる。_


### 出力例

_※実際には一行で出力されるが、見やすさを考慮して改行している。_

```json:
{
  "データ出力日時": "11/04(金) 11:00",
  "商品番号": "M17-1153",
  "単位": "個",
  "在庫状況": "メーカー取り寄せ",
  "発送日目安": "6〜8日（土日祝を除く）",
  "入荷予定区分": "z999999",
  "在庫数": "1",
  "在庫時在庫状況": "在庫",
  "在庫時発送日目安": "15:00まで即納",
  "在庫時入荷予定区分": "z000001"
}
```




実装方法
====================

### 言語

* javascript（各サイト）
* bash（サーバ処理）


各サイトで実装するべきjavascript処理サンプル
====================

必須ライブラリは以下の２つ。

* jquery
* cheetah.js（大都オリジナルライブラリ）

サンプルページを以下に記載。

http://192.168.1.200/index.html?product-code=b01


### 一部抜粋

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
	<script src="//s3-ap-northeast-1.amazonaws.com/daito-lead-time-info/js/cheetah.js"></script>
	<script>
		// URLの"?"以降を切り取って配列に入れておく
		var queryString = (function getUrlVars() {
			var vars = [], hash;
			var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for(var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}
			return vars;
		})();

		// outputLeadTimes()関数を呼び出せば、商品番号に該当する情報を取得できる。
		$.outputLeadTimes(
			// 商品番号
			queryString['product-code'],
			// 正常時の処理、異常時の処理を記載
			{
				"success":function( json, status ) {
					// この例では、 div#lead-time-table に取得したコンテンツを出力している

					// ↓↓↓↓↓ここからHTML要素出力ロジック↓↓↓↓↓
					var table = $("<table />")
							.append(
								$("<caption />").text('出荷予定表('+json["データ出力日時"]+' 現在)')
							)
							.append(
								$("<colgroup />")
									.append($("<col />"))
									.append($("<col />"))
									.append($("<col />"))
							)
							.append(
								$("<thead />").append(
									$("<tr />")
										.append($("<th />").text('在庫状況'))
										.append($("<th />").text('在庫数'))
										.append($("<th />").text('発送日目安'))
								)
							)
							.append(
								(json["在庫数"] == null ?
									$("<tbody />")
										.append(
											$("<tr />")
												.append($("<td />").text(json["在庫状況"]))
												.append($("<td />").text("-"))
												.append($("<td />").text(json["発送日目安"]))
										) :
									$("<tbody />")
										.append(
											$("<tr />")
												.append($("<td />").text(json["在庫時在庫状況"]))
												.append($("<td />").text(json["在庫数"]))
												.append($("<td />").text(json["在庫時発送日目安"]))
										)
										.append(
											$("<tr />")
												.append($("<td />").text(json["在庫状況"]))
												.append($("<td />").text("-"))
												.append($("<td />").text(json["発送日目安"]))
										)
								)
							);

					$("#lead-time-table")
						.find('*').remove().end()
						.append(table);
					// ↑↑↑↑↑ここまでHTML要素出力ロジック↑↑↑↑↑

				},
				"error":function( data, status ) {
					alert('エラー！');
				}
			}
		);

	</script>

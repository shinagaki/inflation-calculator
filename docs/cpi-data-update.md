# CPIデータ更新ガイド

## 概要

このドキュメントは、inflation-calculatorプロジェクトのCPIデータを更新する手順とデータソースをまとめたものです。

## データファイル

- **CSV**: `src/data/cpi_all.csv`
- **JSON**: `src/data/cpi_all.json`（CSVから自動生成）

## 更新タイミング

- **推奨**: 毎年1月下旬〜2月（前年の年間平均データが各国から出揃った後）
- 各国のデータ公開スケジュールが異なるため、全データが揃うまで待つ

### 各国のデータ公開スケジュール（例: 2025年データの場合）

| 国 | 公開日 | 内容 | 出典 |
|-----|--------|------|------|
| **米国** | 1月13日頃 | 12月分 + 年間平均 | [BLS Schedule](https://www.bls.gov/schedule/news_release/cpi.htm) |
| **英国** | 1月21日頃 | 12月分（年平均は手動計算） | [ONS](https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7bt/mm23) |
| **日本** | 1月24日頃 | 12月分 + 年平均（全国） | [総務省](https://www.stat.go.jp/data/cpi/index.html) |
| **EU** | 1月中旬 | 12月分 | [Eurostat](https://ec.europa.eu/eurostat/web/hicp) |

**結論**: 毎年 **1月24日以降** に全データが揃う見込み。日本の年平均公開を待ってから更新するのがベスト。

## データソース一覧

### 日本 (JPY)

**公式サイト**: [総務省統計局 消費者物価指数](https://www.stat.go.jp/data/cpi/sokuhou/tsuki/index-z.html)

**取得方法**:
```
WebFetch: https://www.stat.go.jp/data/cpi/sokuhou/tsuki/index-z.html
プロンプト: 最新の消費者物価指数（CPI）の総合指数の値と、その年月を教えてください。2020年基準=100での値を探してください。
```

**注意点**:
- 基準年: 2020年=100
- 月次データから年間平均を計算する必要がある
- 既存データは別の基準年で換算済みのため、過去データとの整合性を確認

**年間平均の計算**:
- 12ヶ月分の月次データを取得し、平均を計算
- または、総務省の年報データを待つ

---

### 米国 (USD)

**公式サイト**:
- [BLS Consumer Price Index](https://www.bls.gov/cpi/)
- [FRED CPIAUCSL](https://fred.stlouisfed.org/series/CPIAUCSL)
- [Minneapolis Fed CPI Calculator](https://www.minneapolisfed.org/about-us/monetary-policy/inflation-calculator/consumer-price-index-1913-)

**取得方法**:
```
WebFetch: https://www.minneapolisfed.org/about-us/monetary-policy/inflation-calculator/consumer-price-index-1913-
プロンプト: 2024年と2025年のCPI年間平均値を教えてください。
```

**注意点**:
- 基準年: 1982-84=100
- BLSサイトは403エラーになることがあるため、FREDまたはMinneapolis Fedを使用
- 年間平均はBLSが公式発表（通常1月中旬）

**代替取得方法**:
```
WebSearch: US CPI 2024 annual average index 1982-84=100
```

---

### 英国 (GBP)

**公式サイト**: [ONS CPI Index](https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7bt/mm23)

**取得方法**:
```
WebFetch: https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7bt/mm23
プロンプト: CPI INDEX の最新の月次値（2015=100基準）を教えてください。2024年と2025年の各月のデータがあれば、それも教えてください。
```

**注意点**:
- 基準年: 2015=100
- 月次データが取得できる
- 年間平均は12ヶ月の平均を手動計算

**年間平均の計算例（2024年）**:
```
(131.5+132.3+133.0+133.5+133.9+134.1+133.8+134.3+134.2+135.0+135.1+135.6) / 12 = 133.86
```

---

### EU/ユーロ圏 (EUR)

**公式サイト**:
- [Eurostat HICP](https://ec.europa.eu/eurostat/web/hicp)
- [FRED Euro Area HICP](https://fred.stlouisfed.org/series/CP0000EZ19M086NEST)

**取得方法**:
```
WebFetch: https://fred.stlouisfed.org/series/CP0000EZ19M086NEST
プロンプト: Euro Area HICPの最新の指数値（2015=100基準）を教えてください。2024年と2025年の月次データがあれば、それも教えてください。
```

**注意点**:
- 基準年: 2015=100（2026年以降は2025=100に変更予定）
- Eurostatのデータブラウザは直接fetch不可（JavaScript動的読み込み）
- FREDを使うと取得しやすい

---

## 更新手順

### 1. データ取得

各国のデータを上記の方法で取得する。

### 2. CSVファイル更新

`src/data/cpi_all.csv` の最終行に新しい年のデータを追加:

```csv
2026,325.0,113.2,139.5,132.0
```

フォーマット: `year,usd,jpy,gbp,eur`

### 3. JSON変換

```bash
npm run convert-cpi
```

### 4. 動作確認

```bash
npm run dev
```

ブラウザで計算結果を確認。

### 5. コミット

変更をコミットする。

---

## 通貨追加時の対応

新しい通貨を追加する場合:

### 1. データソースの調査

- 公式統計機関のCPIデータを探す
- 基準年を確認
- APIまたはWebページからの取得方法を確認

### 2. CSVヘッダー追加

```csv
year,usd,jpy,gbp,eur,新通貨コード
```

### 3. 過去データの入力

- 可能な限り過去のCPIデータを入力
- データがない年は空欄のまま

### 4. 変換スクリプト確認

`scripts/convert-cpi.js` が新しい列を正しく処理するか確認。

### 5. アプリケーション側の対応

- 通貨選択UIに追加
- 為替レート取得の対応確認

---

## 主要国のCPIデータソース（将来の参考）

| 国/地域 | 統計機関 | URL |
|---------|---------|-----|
| カナダ | Statistics Canada | https://www.statcan.gc.ca/ |
| オーストラリア | ABS | https://www.abs.gov.au/ |
| 韓国 | KOSTAT | https://kostat.go.kr/ |
| 中国 | NBS | http://www.stats.gov.cn/ |
| インド | MOSPI | https://mospi.gov.in/ |
| ブラジル | IBGE | https://www.ibge.gov.br/ |
| スイス | BFS | https://www.bfs.admin.ch/ |

---

## トラブルシューティング

### WebFetchで403エラーが出る

一部のサイト（BLS等）はボット対策があるため:
- 代替サイト（FRED、Minneapolis Fed）を使用
- WebSearchで最新データを検索

### Eurostatのデータブラウザが読めない

JavaScriptで動的に読み込むため:
- FREDのミラーデータを使用
- WebSearchで年間データを検索

### 基準年が異なる

各国で基準年が異なるため、既存データとの整合性に注意:
- 日本: 2020=100（CSVでは換算済み）
- 米国: 1982-84=100
- 英国: 2015=100
- EU: 2015=100

過去データは既に換算済みのため、新しいデータも同じ基準で入力すること。

---

## 更新履歴

| 日付 | 更新内容 |
|------|---------|
| 2026-01-11 | ドキュメント作成 |

# 今いくら（日本円のインフレーション計算機 🇯🇵）

消費者物価指数（CPI）に基づいて、過去の金額を現在の価値に換算するウェブアプリケーションです。

詳しい解説は[ブログ記事](https://creco.net/create_japanese_yen_inflation_calculator/)をご覧ください。

## 機能 ✨

- 過去の金額を現在の価値に換算
- 1970年以降の任意の年の金額に対応
- 複数の通貨での表示に対応（USD、EUR、GBP、など）
- CPIデータに基づく正確な計算
- モバイルフレンドリーなレスポンシブデザイン
- 計算結果のSNSシェア機能

## 技術スタック 🛠️

- React + TypeScript
- Vite
- Tailwind CSS
- React Share（SNSシェア機能）
- CoinGecko API（為替レート取得）

## セットアップ 🚀

```bash
# リポジトリのクローン
git clone [https://github.com/shinagaki/inflation-calculator]
cd inflation-calculator

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## CPIデータの更新 📊

CPIデータを更新する場合は、以下の手順で行います：

1. 新しいCPIデータを`src/data/cpi_all.csv`に配置
2. 以下のコマンドを実行してJSONに変換

```bash
npm run convert-cpi
```

変換されたデータは`src/data/cpi_all.json`に出力されます。

## 使用方法 📝

1. 年を選択（1970年以降）
2. 金額を入力
3. 通貨を選択（オプション）
4. 自動的に現在の価値に換算された金額が表示されます
5. 必要に応じて計算結果をSNSでシェア

## データソース 📊

- 消費者物価指数（CPI）：🇯🇵 総務省統計局、🇺🇸 Department of Labor、🇬🇧 Office for National Statistics、🇪🇺 eurostat
- 為替レート：CoinGecko API

## ライセンス 📄

MIT

## 作者 👤

Shintaro Inagaki ([@shinagaki](https://github.com/shinagaki))

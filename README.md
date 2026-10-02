# 学びのログ

学習した分野や時間、学んだことを日付ごとに記録するシンプルな学習ログです。HTML/CSS/JavaScriptとlocalStorageだけで動作します。

## 使い方

`index.html` をブラウザで開くだけで使えます。ビルドやサーバー起動は不要です。

```text
my-study-log/
├── index.html
├── styles.css
├── study-log.js
├── README.md
└── LICENSE
```

## 記録できる内容

- 学習日、分野、学習時間（分）
- 学んだこと、次にやること（任意）
- 日付ごとに1件の記録。再度保存するとその日の記録を更新
- 記録の編集・削除、学んだことの検索、分野での絞り込み
- 累計学習時間と直近7日間の学習時間

名前、住所、連絡先などの個人情報を入力する欄はありません。学習記録はこのブラウザのlocalStorageに保存され、外部には送信されません。共有端末では記録内容に注意してください。

## 使用技術

- HTML
- CSS
- JavaScript
- localStorage

外部ライブラリは使っていません。

## localStorage

保存キーは `study-log.entries.v1` です。

データは次のような配列で保存されます。

```json
[
  {
    "id": "example-id",
    "date": "2026-04-29",
    "subject": "数学",
    "minutes": 45,
    "learned": "二次方程式の解の公式を使った問題を解いた",
    "next": "練習問題をもう3問解く",
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  }
]
```

## ファイル構成

- `index.html`: 画面の構造
- `styles.css`: レイアウトと見た目
- `study-log.js`: 保存、表示、編集、削除、検索、学習時間の集計
- `README.md`: この説明ファイル
- `LICENSE`: MITライセンス

## ライセンス

MIT License

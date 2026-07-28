# iias-web

IIAS（Integrated Intelligence Archive System）の Web クライアント。

## 概要

Nuxt.js で構築された PWA。エヴァンゲリオン風ターミナル UI × 日本の行政システム風グリッドレイアウトを採用。
Android / iOS / PC のブラウザから利用できる軽量管理画面を目指す。

## 技術スタック

- Nuxt.js 3
- Vue 3
- TypeScript
- @towakey/ndma-ui（改修・再利用予定）

## セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build        # 本番ビルド
npm run generate     # 静的サイト生成
npm run preview      # ビルド結果のプレビュー
```

## ディレクトリ構成

```
app/            # Nuxt アプリケーションルート
public/         # 静的アセット
nuxt.config.ts  # Nuxt 設定
package.json    # 依存管理
```

## 今後の追加予定

- PWA 設定
- IIAS 専用 UI テーマ
- API 連携（iias-core）

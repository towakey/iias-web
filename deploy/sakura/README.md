# さくらレンタルサーバー 静的サイト運用

## 想定 URL

- API: `https://kyosserver.sakura.ne.jp/iias-core/api/...`
- Web: `https://kyosserver.sakura.ne.jp/iias-web/`

## ビルド

```bash
# 本番用環境変数を設定して静的生成
export NUXT_PUBLIC_API_BASE_URL=https://kyosserver.sakura.ne.jp/iias-core/api
export NUXT_APP_BASE_URL=/iias-web/
export NUXT_NITRO_PRESET=static
pnpm install
pnpm generate

# .output/public をサーバーへ転送
# .htaccess は含まれているので SPA fallback も有効
```

## 初回配置

```bash
# サーバー側で空の iias-web ディレクトリを作成し、.output/public を配置
mkdir -p /home/kyosserver/www/iias-web
```

## GitHub Actions

`iias-web` リポジトリの `.github/workflows/deploy-sakura.yml` を利用。

必要な設定：

- `Secrets`
  - `SAKURA_HOST`, `SAKURA_USER`, `SAKURA_SSH_KEY`, `SAKURA_PORT`
  - `SAKURA_WEB_DIR`：転送先ディレクトリ（例 `/home/ユーザー名/www/iias-web/`）
- `Variables`
  - `SAKURA_API_BASE_URL`
  - `SAKURA_WEB_BASE_URL`

# sports-man web

本地 Web 应用，用来把 `$sports-man` 的风格与 dimension 参数做成可视化选择器。

## 启动

```bash
cd sports-man-web
npm start
```

打开：

```text
http://127.0.0.1:4173
```

## EdgeOne 部署

这个项目不能只按纯静态站点部署，否则页面会提示「当前是静态托管页面，不能保存 API 设置」。原因是 API 设置、生图、图库都需要后端接口。

已内置 EdgeOne Functions：

```text
edge-functions/api/settings.js
edge-functions/api/generate.js
edge-functions/api/images.js
edge-functions/api/image.js
edge-functions/api/download.js
```

部署到 EdgeOne 时请选择支持 Functions 的全栈/Pages Functions 部署方式。部署后：

- `POST /api/settings` 会把设置保存到 EdgeOne Blob
- `POST /api/generate` 会调用 OpenAI-compatible 生图接口
- 生成图片会写入 EdgeOne Blob，并显示在图库中

推荐在 EdgeOne 环境变量中配置 API Key：

```text
SPORTS_MAN_API_KEY=你的生图 API Key
```

也兼容：

```text
OPENAI_API_KEY=你的生图 API Key
```

如果没有配置环境变量，也可以在页面的 Image API 设置里填写 API Key；GET 设置接口不会把 Key 回传给浏览器，只会显示是否已设置。

## 生图链路

前端点击「开始生图」后，根据左侧 Image API 设置选择生成方式：

### Codex CLI + `$imagegen`

1. 前端将当前 prompt 发送到 `POST /api/generate`
2. 后端运行 `scripts/codex-imagegen.mjs`
3. 脚本调用 `codex exec`，要求 Codex 使用 `$imagegen` 生图
4. 脚本从 `~/.codex/generated_images` 找到新生成图片
5. 图片复制到 `output/images/`
6. 前端自动刷新图库

### 我的生图 API

左侧 Image API 面板选择「我的生图 API」，填写：

- `API Endpoint`
- `API Key`
- `Model`
- `Size`

当前按 OpenAI-compatible images API 发送：

```json
{
  "model": "gpt-image-1",
  "prompt": "...",
  "n": 1,
  "size": "1024x1536",
  "response_format": "b64_json"
}
```

后端会解析这些返回格式：

- `data[0].b64_json`
- `data[0].url`
- `image_base64`
- `base64`
- `image_url`
- 直接返回 image content-type 的二进制图片

默认 Codex CLI 路径：

```text
/Applications/Codex.app/Contents/Resources/codex
```

如需覆盖：

```bash
CODEX_BIN=/path/to/codex npm start
```

## 输出目录

```text
output/images
```

每张新生成图片会附带同名元数据文件：

```text
image-name.png
image-name.png.json
```

元数据包含：风格、运动项目、pose、attribute、composition、focus、background、effect、color、provider 和完整 prompt。网页图库可按风格筛选、查看关键维度，并下载图片。

## 注意

如果 `codex exec` 当前环境没有暴露 `$imagegen` 或图片生成能力，页面会显示错误提示。应用不会删除 `~/.codex/generated_images` 中的原始生成文件，只会复制新图到自己的输出目录。

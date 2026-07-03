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

# Moon Outfit

深蓝月光、香槟金与粉银的单页穿搭体验。按 9:16 竖版构图设计；手机上保留可读字号并自然纵向滚动，无底部多页面导航。所有输入与结果均是真实网页元素。

## 部署至 Vercel

ZIP 是项目源码包，请先解压，不要把 ZIP 当作静态文件上传到网站。

### 方法一：GitHub 导入（推荐）

1. 解压 ZIP。将 `moon-outfit` 文件夹里的完整内容上传至新的 GitHub 仓库，包含 `api`、`lib`、`scripts`、`assets` 和 `vercel.json`。
2. 在 Vercel 选择 Add New → Project → 导入该仓库。
3. Root Directory 选包含 `package.json` 和 `vercel.json` 的目录。Framework Preset 选 **Other**。
4. 配置由 `vercel.json` 提供：Build Command 为 `node scripts/build.mjs`，Output Directory 为 `public`。不要把输出目录设为仓库根目录。
5. 在 Environment Variables 中添加 `OPENROUTER_API_KEY`，值为你在 OpenRouter 创建的 API Key。勾选需要使用的 Production / Preview 环境。
6. 点击 Deploy。若在首次部署后才添加或修改环境变量，请重新部署。
7. 打开部署网址，填完表单，点击 **Generate My Moon Outfit**。

### 方法二：Vercel CLI

在解压后的 `moon-outfit` 目录打开终端，执行 `npx vercel`。按提示关联项目，然后在 Vercel 网页项目设置中配置上述环境变量，最后执行 `npx vercel --prod`。

不要将 API Key 发给访客或粘贴进 `index.html`、`app.js`、GitHub 文件。`.env.example` 只有占位符，不是有效密钥。API Key 只在服务器端读取。

## 免费 AI

默认后端调用 `openrouter/free`，并使用 `response_format: json_schema` 请求结构化 JSON。服务端再次检查字段与数值，前端用纯文本显示内容。

可选环境变量 `OPENROUTER_MODEL` 可指定 ID 以 `:free` 结尾的模型。项目拒绝付费模型 ID，不自动切换至付费模型。免费额度、模型可用性、延迟由 OpenRouter 决定；不保证永久免费或无限量。免费路由没有可用的结构化输出模型时，界面会给出重试提示。

## 结果与图片

包含 Moon Phase、Daily Energy、Power Color、Avoid Color、Best Outfit、Best Scent、Best Crystal、Best Time、Do、Avoid、Affirmation。

首次加载的卡片明确标记为 **Sample reading**。只有后端成功返回并校验通过后才改为个人结果。失败时保留原有内容并显示错误，不伪造成功。

月相使用固定朔望月周期计算近似值，不是精密天文历。出生信息用于创意个性化，不计算星盘。能量分数、时段、宝石等是娱乐与自我反思建议，不是科学预测。日期使用浏览器时区；用户填写的城市/时区也会发送给 AI，供本地时间建议使用。顶部满月为装饰图片，不随真实月相变化。

背景与穿搭是预先制作的 AI 图片，已包含在包内。生成阅读时更新文字，不另调用图片模型；穿搭配图作为固定风格参考。字体来自 Google Fonts，无法联网时使用系统衬线字体。

## 本地预览与检查

安装 Node.js 22，在项目目录运行：

```sh
npm run dev
```

打开 `http://127.0.0.1:4173`。本地运行实际 AI 时，需要先在当前终端设置 `OPENROUTER_API_KEY`；脚本不自动读取 `.env`。不设置 Key 也能检查页面，提交时会显示配置提示。

```sh
npm test
node scripts/build.mjs
```

测试使用模拟响应，不消耗 API 额度。检查覆盖输入、结构化成功响应、免费模型限制、缺少密钥、服务繁忙、超时及无效 AI 内容。交付时未使用你的 API Key，真实账户的线上调用需部署后验证。

## 文件

`index.html` / `style.css` / `app.js`：前端；`api/generate.js`：Vercel Serverless；`lib/reading.js`：校验与月相；`assets/`：本地配图；`scripts/build.mjs`：只复制公开前端文件；`scripts/dev.mjs`：本地预览；`tests/`：接口检查。

不依赖第三方 npm 包，无数据库、不在浏览器保存用户出生信息。提交的数据会经 OpenRouter 发给模型提供方。接口包含方法、来源提示、输入大小和格式检查；这些不等于用户鉴权或持久限流。公开推广前，可在 Vercel Firewall 设置请求速率限制，避免共用免费额度被滥用。

## 参考文档

- https://openrouter.ai/openrouter/free
- https://openrouter.ai/docs/guides/features/structured-outputs
- https://vercel.com/docs/functions/runtimes/node-js
- https://vercel.com/docs/cli/deploying-from-cli

## 配图记录

由内置 imagegen 工具生成，无文字，无 UI。

- `assets/moon-garden.webp`：Portrait 9:16 luxurious deep navy Mediterranean ocean terrace, huge champagne full moon upper-right at approximately 20% height, stars, cascading flowers down side edges, candles along lower edges, pink silk curtains, dark uncluttered center for UI, photoreal romantic moonlight. No text, logos, people or UI.
- `assets/outfit.webp`：Landscape luxury editorial still life, silver satin camisole, ivory wide-leg trousers, layered gold celestial jewelry, silver bag, nude heels and jasmine on navy marble, warm candlelight, photoreal. No text, people, logos or UI.

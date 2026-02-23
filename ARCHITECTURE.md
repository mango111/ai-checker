# 架构设计 - AI Checker

## 文档信息

| 项目 | 内容 |
|------|------|
| 项目名称 | AI Checker |
| 版本 | v1.0 MVP |
| 日期 | 2026-02-23 |

---

## 1. 系统架构

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Next.js 14 App                      │   │
│  │  ┌─────────────┐    ┌─────────────────────┐    │   │
│  │  │   Pages     │    │   API Routes        │    │   │
│  │  │  - /        │    │  - /api/check       │    │   │
│  │  │  - /result  │    │  - /api/suggestions │    │   │
│  │  └─────────────┘    └──────────┬──────────┘    │   │
│  └─────────────────────────────────┼───────────────┘   │
└────────────────────────────────────┼────────────────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │   目标网站          │
                          │   (fetch 抓取)      │
                          └─────────────────────┘
```

### 1.2 架构说明

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js 14 + React | App Router, Server Components |
| 样式 | Tailwind CSS | 快速开发，响应式 |
| API | Next.js API Routes | Serverless，无需独立后端 |
| 部署 | Vercel | 免费额度足够 MVP |

---

## 2. 技术选型

### 2.1 前端

| 技术 | 版本 | 理由 |
|------|------|------|
| Next.js | 14.x | App Router, 部署简单 |
| React | 18.x | 生态成熟 |
| Tailwind CSS | 3.x | 快速开发 |
| TypeScript | 5.x | 类型安全 |

### 2.2 后端（API Routes）

| 技术 | 用途 |
|------|------|
| node-fetch | 抓取网页 |
| cheerio | 解析 HTML |
| zod | 参数校验 |

### 2.3 部署

| 服务 | 用途 | 费用 |
|------|------|------|
| Vercel | 托管 + CDN | 免费 |
| 域名 | aichecker.dev（建议） | ~$10/年 |

---

## 3. 目录结构

```
ai-checker/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页
│   │   ├── result/
│   │   │   └── page.tsx        # 结果页
│   │   └── api/
│   │       └── check/
│   │           └── route.ts    # 检测 API
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── card.tsx
│   │   ├── url-input.tsx       # URL 输入组件
│   │   ├── score-card.tsx      # 评分卡片
│   │   ├── content-view.tsx    # 内容展示
│   │   └── suggestions.tsx     # 优化建议
│   ├── lib/
│   │   ├── checker.ts          # 检测核心逻辑
│   │   ├── parser.ts           # HTML 解析
│   │   ├── scorer.ts           # 评分计算
│   │   └── suggestions.ts      # 建议生成
│   └── types/
│       └── index.ts            # 类型定义
├── public/
│   └── favicon.ico
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 4. API 设计

### 4.1 检测接口

**POST /api/check**

请求：
```json
{
  "url": "https://example.com"
}
```

响应：
```json
{
  "code": 200,
  "data": {
    "url": "https://example.com",
    "score": 78,
    "meta": {
      "title": "Example Domain",
      "description": "This domain is...",
      "ogTitle": null,
      "ogDescription": null,
      "ogImage": null
    },
    "structure": {
      "h1": ["Example Domain"],
      "h2": [],
      "h3": [],
      "hasJsonLd": false,
      "hasMicrodata": false
    },
    "content": {
      "text": "This domain is established...",
      "wordCount": 45,
      "images": [
        { "src": "...", "alt": "" }
      ],
      "links": [
        { "href": "...", "text": "More information" }
      ]
    },
    "suggestions": [
      {
        "priority": "high",
        "type": "meta",
        "message": "缺少 meta description",
        "detail": "添加 meta description 有助于 AI 理解页面内容"
      }
    ],
    "checkedAt": "2026-02-23T06:30:00Z"
  }
}
```

---

## 5. 核心模块

### 5.1 checker.ts - 检测主流程

```typescript
export async function checkUrl(url: string): Promise<CheckResult> {
  // 1. 抓取页面
  const html = await fetchPage(url)
  
  // 2. 解析内容
  const parsed = parseHtml(html)
  
  // 3. 计算评分
  const score = calculateScore(parsed)
  
  // 4. 生成建议
  const suggestions = generateSuggestions(parsed)
  
  return { url, score, ...parsed, suggestions }
}
```

### 5.2 scorer.ts - 评分规则

```typescript
const RULES = [
  { name: 'hasTitle', weight: 15, check: (p) => !!p.meta.title },
  { name: 'hasTitleLength', weight: 5, check: (p) => p.meta.title?.length >= 30 && p.meta.title?.length <= 60 },
  { name: 'hasDescription', weight: 15, check: (p) => !!p.meta.description },
  { name: 'hasDescLength', weight: 5, check: (p) => p.meta.description?.length >= 120 && p.meta.description?.length <= 160 },
  { name: 'hasH1', weight: 10, check: (p) => p.structure.h1.length === 1 },
  { name: 'hasJsonLd', weight: 15, check: (p) => p.structure.hasJsonLd },
  { name: 'hasOgTags', weight: 10, check: (p) => !!p.meta.ogTitle && !!p.meta.ogDescription },
  { name: 'hasContent', weight: 10, check: (p) => p.content.wordCount >= 300 },
  { name: 'imagesHaveAlt', weight: 10, check: (p) => p.content.images.every(i => !!i.alt) },
  { name: 'linksHaveText', weight: 5, check: (p) => p.content.links.every(l => !!l.text && l.text !== 'click here') },
]
```

---

## 6. 部署方案

### 6.1 Vercel 部署

```bash
# 安装 Vercel CLI
pnpm i -g vercel

# 部署
vercel

# 生产部署
vercel --prod
```

### 6.2 环境变量

```bash
# .env.local（本地开发）
# 暂无需要的环境变量

# Vercel 环境变量（如需）
# NEXT_PUBLIC_GA_ID=G-XXXXXX  # Google Analytics
```

### 6.3 域名配置

1. 在 Vercel 项目设置中添加域名
2. 配置 DNS 指向 Vercel
3. 自动 HTTPS

---

## 7. 开发计划

| 阶段 | 任务 | 负责人 | 工时 |
|------|------|--------|------|
| 1 | 项目初始化 + 基础 UI | frontend | 0.5 天 |
| 2 | 检测 API 开发 | backend | 1 天 |
| 3 | 结果页面开发 | frontend | 0.5 天 |
| 4 | 评分 + 建议逻辑 | backend | 0.5 天 |
| 5 | 联调 + 优化 | frontend + backend | 0.5 天 |
| 6 | 测试 + 部署 | test + architect | 0.5 天 |

---

## 8. 风险评估

| 风险 | 影响 | 应对 |
|------|------|------|
| 目标网站反爬 | 无法抓取 | 添加 User-Agent，必要时用 Puppeteer |
| 抓取超时 | 用户体验差 | 设置 10s 超时，提示用户 |
| Vercel 免费额度 | 超限 | 监控用量，必要时升级 |

---

## 附录

### A. 参考资源
- Next.js 文档：https://nextjs.org/docs
- Vercel 部署：https://vercel.com/docs
- Cheerio：https://cheerio.js.org/

import type { CheckResult, Suggestion, ScoreRule } from '@/types'

type ParsedResult = Omit<CheckResult, 'score' | 'suggestions' | 'checkedAt'>

const RULES: ScoreRule[] = [
  {
    name: 'hasTitle',
    weight: 10,
    check: (p) => !!p.meta.title,
    suggestion: {
      priority: 'high',
      type: 'meta',
      message: '缺少页面标题 (title)',
      detail: '添加 <title> 标签，帮助 AI 理解页面主题',
    },
  },
  {
    name: 'titleLength',
    weight: 5,
    check: (p) => {
      const len = p.meta.title?.length || 0
      return len >= 20 && len <= 70
    },
    suggestion: {
      priority: 'medium',
      type: 'meta',
      message: '标题长度不理想',
      detail: '建议标题长度在 20-70 字符之间，当前标题可能过短或过长',
    },
  },
  {
    name: 'hasDescription',
    weight: 15,
    check: (p) => !!p.meta.description,
    suggestion: {
      priority: 'high',
      type: 'meta',
      message: '缺少 meta description',
      detail: '添加 meta description 是 AI 理解页面内容的重要依据',
    },
  },
  {
    name: 'descriptionLength',
    weight: 5,
    check: (p) => {
      const len = p.meta.description?.length || 0
      return len >= 80 && len <= 160
    },
    suggestion: {
      priority: 'medium',
      type: 'meta',
      message: 'meta description 长度不理想',
      detail: '建议 description 长度在 80-160 字符之间',
    },
  },
  {
    name: 'hasH1',
    weight: 10,
    check: (p) => p.structure.h1.length >= 1,
    suggestion: {
      priority: 'high',
      type: 'structure',
      message: '缺少 H1 标题',
      detail: '每个页面应该有一个 H1 标题，表明页面主题',
    },
  },
  {
    name: 'singleH1',
    weight: 5,
    check: (p) => p.structure.h1.length === 1,
    suggestion: {
      priority: 'medium',
      type: 'structure',
      message: 'H1 标题数量不正确',
      detail: '建议每个页面只有一个 H1 标题，当前有多个或没有',
    },
  },
  {
    name: 'hasJsonLd',
    weight: 15,
    check: (p) => p.structure.hasJsonLd,
    suggestion: {
      priority: 'high',
      type: 'structured-data',
      message: '缺少结构化数据 (JSON-LD)',
      detail: '添加 JSON-LD 结构化数据，帮助 AI 更好地理解页面内容类型',
    },
  },
  {
    name: 'hasOgTitle',
    weight: 5,
    check: (p) => !!p.meta.ogTitle,
    suggestion: {
      priority: 'low',
      type: 'social',
      message: '缺少 Open Graph 标题',
      detail: '添加 og:title 标签，优化社交分享和 AI 理解',
    },
  },
  {
    name: 'hasOgDescription',
    weight: 5,
    check: (p) => !!p.meta.ogDescription,
    suggestion: {
      priority: 'low',
      type: 'social',
      message: '缺少 Open Graph 描述',
      detail: '添加 og:description 标签',
    },
  },
  {
    name: 'hasOgImage',
    weight: 5,
    check: (p) => !!p.meta.ogImage,
    suggestion: {
      priority: 'low',
      type: 'social',
      message: '缺少 Open Graph 图片',
      detail: '添加 og:image 标签，提供页面预览图',
    },
  },
  {
    name: 'hasContent',
    weight: 10,
    check: (p) => p.content.wordCount >= 100,
    suggestion: {
      priority: 'medium',
      type: 'content',
      message: '页面内容过少',
      detail: '建议页面至少有 100 个词的内容，帮助 AI 理解页面主题',
    },
  },
  {
    name: 'imagesHaveAlt',
    weight: 5,
    check: (p) => {
      if (p.content.images.length === 0) return true
      return p.content.images.every((img) => !!img.alt)
    },
    suggestion: {
      priority: 'medium',
      type: 'accessibility',
      message: '部分图片缺少 alt 属性',
      detail: '为图片添加 alt 描述，帮助 AI 理解图片内容',
    },
  },
  {
    name: 'hasCanonical',
    weight: 5,
    check: (p) => !!p.meta.canonical,
    suggestion: {
      priority: 'low',
      type: 'seo',
      message: '缺少 canonical 标签',
      detail: '添加 canonical 标签，避免重复内容问题',
    },
  },
]

export function calculateScore(parsed: ParsedResult): number {
  let score = 0
  for (const rule of RULES) {
    if (rule.check(parsed)) {
      score += rule.weight
    }
  }
  return Math.min(100, Math.max(0, score))
}

export function generateSuggestions(parsed: ParsedResult): Suggestion[] {
  const suggestions: Suggestion[] = []
  
  for (const rule of RULES) {
    if (!rule.check(parsed) && rule.suggestion) {
      suggestions.push(rule.suggestion)
    }
  }

  // 按优先级排序
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return suggestions
}

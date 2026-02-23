import * as cheerio from 'cheerio'
import type { CheckResult } from '@/types'

export function parseHtml(html: string, url: string): Omit<CheckResult, 'score' | 'suggestions' | 'checkedAt'> {
  const $ = cheerio.load(html)

  // Meta 信息
  const meta = {
    title: $('title').text().trim() || null,
    description: $('meta[name="description"]').attr('content')?.trim() || null,
    ogTitle: $('meta[property="og:title"]').attr('content')?.trim() || null,
    ogDescription: $('meta[property="og:description"]').attr('content')?.trim() || null,
    ogImage: $('meta[property="og:image"]').attr('content')?.trim() || null,
    canonical: $('link[rel="canonical"]').attr('href')?.trim() || null,
  }

  // 结构信息
  const h1: string[] = []
  const h2: string[] = []
  const h3: string[] = []
  
  $('h1').each((_, el) => {
    const text = $(el).text().trim()
    if (text) h1.push(text)
  })
  $('h2').each((_, el) => {
    const text = $(el).text().trim()
    if (text) h2.push(text)
  })
  $('h3').each((_, el) => {
    const text = $(el).text().trim()
    if (text) h3.push(text)
  })

  // JSON-LD
  const jsonLdTypes: string[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '{}')
      if (json['@type']) {
        jsonLdTypes.push(json['@type'])
      }
    } catch {}
  })

  const structure = {
    h1,
    h2,
    h3,
    hasJsonLd: jsonLdTypes.length > 0,
    jsonLdTypes,
    hasMicrodata: $('[itemscope]').length > 0,
  }

  // 内容信息
  // 移除脚本和样式
  $('script, style, nav, header, footer, aside').remove()
  
  const text = $('body').text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000) // 限制长度

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length

  const images: { src: string; alt: string }[] = []
  $('img').each((_, el) => {
    const src = $(el).attr('src') || ''
    const alt = $(el).attr('alt') || ''
    if (src) {
      images.push({ src, alt })
    }
  })

  const links: { href: string; text: string }[] = []
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const linkText = $(el).text().trim()
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      links.push({ href, text: linkText })
    }
  })

  const content = {
    text: text.slice(0, 2000), // 返回前 2000 字符
    wordCount,
    images: images.slice(0, 20), // 最多 20 张图
    links: links.slice(0, 30), // 最多 30 个链接
  }

  return { url, meta, structure, content }
}

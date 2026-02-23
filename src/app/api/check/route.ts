import { NextRequest, NextResponse } from 'next/server'
import { parseHtml } from '@/lib/parser'
import { calculateScore, generateSuggestions } from '@/lib/scorer'
import type { CheckResult } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { code: 400, error: '请提供网址' },
        { status: 400 }
      )
    }

    // 验证 URL
    let targetUrl: URL
    try {
      targetUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { code: 400, error: '无效的网址' },
        { status: 400 }
      )
    }

    // 抓取页面
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    let html: string
    try {
      const response = await fetch(targetUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIChecker/1.0; +https://aichecker.dev)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      })
      clearTimeout(timeout)

      if (!response.ok) {
        return NextResponse.json(
          { code: 502, error: `无法访问该网站 (${response.status})` },
          { status: 502 }
        )
      }

      html = await response.text()
    } catch (err: any) {
      clearTimeout(timeout)
      if (err.name === 'AbortError') {
        return NextResponse.json(
          { code: 504, error: '请求超时，网站响应过慢' },
          { status: 504 }
        )
      }
      return NextResponse.json(
        { code: 502, error: '无法访问该网站' },
        { status: 502 }
      )
    }

    // 解析内容
    const parsed = parseHtml(html, targetUrl.toString())

    // 计算评分
    const score = calculateScore(parsed)

    // 生成建议
    const suggestions = generateSuggestions(parsed)

    const result: CheckResult = {
      ...parsed,
      score,
      suggestions,
      checkedAt: new Date().toISOString(),
    }

    return NextResponse.json({ code: 200, data: result })
  } catch (err) {
    console.error('Check error:', err)
    return NextResponse.json(
      { code: 500, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { CheckResult } from '@/types'

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'
  const bgColor = score >= 80 ? 'stroke-green-500' : score >= 60 ? 'stroke-yellow-500' : 'stroke-red-500'
  
  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="56"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-slate-200"
        />
        <circle
          cx="64"
          cy="64"
          r="56"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className={bgColor}
          strokeDasharray={`${(score / 100) * 352} 352`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
      </div>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
  }
  const labels = { high: '高', medium: '中', low: '低' }
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[priority as keyof typeof colors]}`}>
      {labels[priority as keyof typeof labels]}优先级
    </span>
  )
}

function ResultContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)

  useEffect(() => {
    if (!url) {
      setError('缺少网址参数')
      setLoading(false)
      return
    }

    const checkUrl = async () => {
      try {
        const res = await fetch('/api/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        const data = await res.json()
        
        if (data.code === 200) {
          setResult(data.data)
        } else {
          setError(data.error || '检测失败')
        }
      } catch {
        setError('网络错误，请重试')
      } finally {
        setLoading(false)
      }
    }

    checkUrl()
  }, [url])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-slate-600">正在分析网站...</p>
          <p className="mt-2 text-sm text-slate-400">{url}</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-900">检测失败</h1>
          <p className="mt-2 text-slate-600">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
          </Link>
        </div>
      </main>
    )
  }

  if (!result) return null

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </Link>
          <h1 className="text-xl font-bold text-slate-900">检测结果</h1>
          <div></div>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ScoreRing score={result.score} />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-lg font-semibold text-slate-900 break-all">{result.url}</h2>
              <p className="mt-2 text-slate-600">
                AI 可见性评分：
                <span className={`font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {result.score >= 80 ? '优秀' : result.score >= 60 ? '良好' : '需改进'}
                </span>
              </p>
              <p className="text-sm text-slate-400 mt-1">
                检测时间：{new Date(result.checkedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        </div>

        {/* AI View */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">🤖 AI 看到的内容</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-500">标题 (Title)</label>
              <p className="mt-1 text-slate-900">{result.meta.title || <span className="text-red-500">未设置</span>}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-500">描述 (Description)</label>
              <p className="mt-1 text-slate-900">{result.meta.description || <span className="text-red-500">未设置</span>}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500">H1 标题</label>
              {result.structure.h1.length > 0 ? (
                <ul className="mt-1 list-disc list-inside text-slate-900">
                  {result.structure.h1.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              ) : (
                <p className="mt-1 text-red-500">未设置</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500">结构化数据</label>
              <p className="mt-1 text-slate-900">
                {result.structure.hasJsonLd ? (
                  <span className="text-green-600">✓ 已设置 JSON-LD ({result.structure.jsonLdTypes.join(', ')})</span>
                ) : (
                  <span className="text-red-500">✗ 未设置</span>
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500">内容统计</label>
              <p className="mt-1 text-slate-600">
                {result.content.wordCount} 词 · {result.content.images.length} 张图片 · {result.content.links.length} 个链接
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">💡 优化建议</h3>
          
          {result.suggestions.length === 0 ? (
            <p className="text-green-600">🎉 太棒了！没有发现需要优化的问题。</p>
          ) : (
            <div className="space-y-4">
              {result.suggestions.map((s, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PriorityBadge priority={s.priority} />
                    <span className="font-medium text-slate-900">{s.message}</span>
                  </div>
                  <p className="text-sm text-slate-600">{s.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            检测其他网站
          </Link>
        </div>
      </div>
    </main>
  )
}

function LoadingFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-6 text-lg text-slate-600">加载中...</p>
      </div>
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultContent />
    </Suspense>
  )
}

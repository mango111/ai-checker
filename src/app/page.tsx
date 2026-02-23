'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    setError('')

    try {
      // 验证 URL
      let checkUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        checkUrl = 'https://' + url
      }
      new URL(checkUrl)

      // 跳转到结果页
      router.push(`/result?url=${encodeURIComponent(checkUrl)}`)
    } catch {
      setError('请输入有效的网址')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Checker
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            检测你的网站对 AI 的可见性
          </p>
        </div>

        {/* 输入框 */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="输入网址，如 example.com"
              className="flex-1 px-5 py-4 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  检测中
                </span>
              ) : '检测'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-red-500 text-sm">{error}</p>
          )}
        </form>

        {/* 说明 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-slate-900">AI 视角分析</h3>
            <p className="mt-2 text-sm text-slate-600">
              查看 ChatGPT、Claude 等 AI 如何理解你的网站内容
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-slate-900">可见性评分</h3>
            <p className="mt-2 text-sm text-slate-600">
              获得 0-100 的 AI 可见性评分，了解优化空间
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="font-semibold text-slate-900">优化建议</h3>
            <p className="mt-2 text-sm text-slate-600">
              获取具体的优化建议，提升 AI 搜索排名
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-16 text-sm text-slate-400">
          支持 ChatGPT / Claude / Perplexity 等 AI 模型
        </p>
      </div>
    </main>
  )
}

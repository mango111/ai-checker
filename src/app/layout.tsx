import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Checker - 检测网站 AI 可见性',
  description: '检测你的网站对 ChatGPT、Claude 等 AI 的可见性，获取优化建议',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

// 替换为你的 GA4 测量 ID
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

export const metadata: Metadata = {
  title: 'AI Checker - 检测网站 AI 可见性',
  description: '检测你的网站对 ChatGPT、Claude 等 AI 的可见性，获取优化建议',
  keywords: 'AI SEO, AI 可见性, ChatGPT, Claude, 网站优化, SEO 检测',
  openGraph: {
    title: 'AI Checker - 检测网站 AI 可见性',
    description: '检测你的网站对 ChatGPT、Claude 等 AI 的可见性，获取优化建议',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Google Analytics */}
        {GA_ID && GA_ID !== 'G-XXXXXXXXXX' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {children}
      </body>
    </html>
  )
}

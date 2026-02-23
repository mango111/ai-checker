'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-slate-900">查收邮件</h2>
            <p className="mt-3 text-slate-600">
              登录链接已发送到 <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              点击邮件中的链接即可登录
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 text-slate-600 hover:text-slate-900"
            >
              关闭
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">登录 / 注册</h2>
              <p className="mt-2 text-slate-600">
                使用邮箱登录，无需密码
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入邮箱地址"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {error && (
                <p className="mt-2 text-red-500 text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '发送中...' : '发送登录链接'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              首次使用会自动创建账号
            </p>
          </>
        )}
      </div>
    </div>
  )
}

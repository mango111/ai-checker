export interface CheckResult {
  url: string
  score: number
  meta: {
    title: string | null
    description: string | null
    ogTitle: string | null
    ogDescription: string | null
    ogImage: string | null
    canonical: string | null
  }
  structure: {
    h1: string[]
    h2: string[]
    h3: string[]
    hasJsonLd: boolean
    jsonLdTypes: string[]
    hasMicrodata: boolean
  }
  content: {
    text: string
    wordCount: number
    images: { src: string; alt: string }[]
    links: { href: string; text: string }[]
  }
  suggestions: Suggestion[]
  checkedAt: string
}

export interface Suggestion {
  priority: 'high' | 'medium' | 'low'
  type: string
  message: string
  detail: string
}

export interface ScoreRule {
  name: string
  weight: number
  check: (result: Omit<CheckResult, 'score' | 'suggestions' | 'checkedAt'>) => boolean
  suggestion?: {
    priority: 'high' | 'medium' | 'low'
    type: string
    message: string
    detail: string
  }
}

'use client'

import axios from 'axios'

const DEFAULT_INTERNAL_API_URL = 'http://backend:8706/api'
const DEFAULT_PUBLIC_PORT = process.env.NEXT_PUBLIC_API_PORT || '8706'

const resolveBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location?.protocol || 'http:'
    const hostname = window.location?.hostname || 'localhost'
    return `${protocol}//${hostname}:${DEFAULT_PUBLIC_PORT}/api`
  }

  return DEFAULT_INTERNAL_API_URL
}

const BASE_URL = resolveBaseUrl()

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const apiKey = process.env.NEXT_APP_API_KEY
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`
  }
  return config
})

export default apiClient

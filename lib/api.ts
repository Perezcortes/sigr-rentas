import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('access_token')
    if (t) config.headers.Authorization = `Bearer ${t}`
  }
  return config
})

let refreshing = false
let queue: Array<() => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original: any = error.config
    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true
      if (!refreshing) {
        refreshing = true
        try {
          const rt = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
          if (!rt) throw new Error('No refresh token')
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refresh_token: rt }
          )
          localStorage.setItem('access_token', data.access_token)
          queue.forEach(fn => fn()); queue = []
          return api(original)
        } finally { refreshing = false }
      }
      return new Promise((resolve) => { queue.push(() => resolve(api(original))) })
    }
    return Promise.reject(error)
  }
)

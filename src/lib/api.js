import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: API_URL })

// ใส่ token ทุก request อัตโนมัติ
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ถ้า 401 → logout
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const auth = {
  login: (username, password) => api.post('/auth/login', { username, password }),
}

export const transactions = {
  list: (params) => api.get('/transactions', { params }),
  summary: (month) => api.get('/transactions/summary', { params: { month } }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
}

export const debts = {
  list: () => api.get('/debts'),
  summary: () => api.get('/debts/summary'),
  payoffCalc: (extra) => api.get('/debts/payoff-calc', { params: { extra_payment: extra } }),
  update: (id, data) => api.put(`/debts/${id}`, data),
  create: (data) => api.post('/debts', data),
}

export const summary = {
  netWorth: () => api.get('/summary/net-worth'),
  cashflowAlert: () => api.get('/summary/cashflow-alert'),
}

export default api

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import DebtPage from './pages/Debt'
import Dashboard from './pages/Dashboard'
import { TransactionsPage, IncomePage, ExpensePage, InvestPage, BudgetPage } from './pages/Pages'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/debt" replace />} />
            <Route path="debt" element={<DebtPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="income" element={<IncomePage />} />
            <Route path="expense" element={<ExpensePage />} />
            <Route path="invest" element={<InvestPage />} />
            <Route path="budget" element={<BudgetPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

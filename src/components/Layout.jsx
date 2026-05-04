import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/debt',         icon: '⚡', label: 'หนี้สิน',    alert: true },
  { to: '/dashboard',    icon: '⊞', label: 'Dashboard' },
  { to: '/transactions', icon: '↕', label: 'รายการ' },
  { to: '/income',       icon: '＋', label: 'รายรับ' },
  { to: '/expense',      icon: '－', label: 'รายจ่าย' },
  { to: '/invest',       icon: '◈', label: 'ลงทุน' },
  { to: '/budget',       icon: '◎', label: 'งบประมาณ' },
]

export default function Layout() {
  const { logout } = useAuth()
  const nav = useNavigate()

  const handleLogout = () => { logout(); nav('/login') }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-48 bg-surface border-r border-border flex flex-col fixed h-screen z-50">
        <div className="p-4 border-b border-border">
          <div className="mono text-lg font-bold text-debt">DebtFlow</div>
          <div className="text-[10px] text-gray-600 mt-0.5 tracking-widest uppercase">บันทึกการเงิน</div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(n => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all
                ${isActive
                  ? n.to === '/debt'
                    ? 'bg-debt/10 text-debt border border-debt/30 font-semibold'
                    : 'bg-surface2 text-white font-medium'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-surface2'
                }`
              }>
              <span className="text-base">{n.icon}</span>
              <span>{n.label}</span>
              {n.alert && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">!</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 p-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-debt to-pink-500 flex items-center justify-center text-white font-bold text-sm">ป</div>
            <div>
              <div className="text-xs font-semibold">นพ.ป่อง</div>
              <div className="text-[10px] text-gray-600">Admin</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-xs text-gray-600 hover:text-gray-400 py-1">
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-48 flex-1 flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}

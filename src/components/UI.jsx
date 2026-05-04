import { fmt, TYPE_COLOR, TYPE_LABEL } from '../lib/utils'

// Page header with topbar
export function PageHeader({ title, sub, month, setMonth, onAdd }) {
  const prevMonth = () => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 2)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const nextMonth = () => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const thaiMonth = () => {
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
    const [y, m] = month.split('-')
    return `${months[parseInt(m) - 1]} ${parseInt(y) + 543}`
  }

  return (
    <div className="bg-surface border-b border-border px-6 h-14 flex items-center justify-between sticky top-0 z-40">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-[11px] text-gray-500">{sub || thaiMonth()}</div>
      </div>
      <div className="flex items-center gap-2">
        {month && setMonth && (
          <div className="flex items-center gap-1 bg-surface2 border border-border rounded-lg px-2 py-1.5 text-xs">
            <button onClick={prevMonth} className="px-1 text-gray-400 hover:text-white">◀</button>
            <span className="px-2">{thaiMonth()}</span>
            <button onClick={nextMonth} className="px-1 text-gray-400 hover:text-white">▶</button>
          </div>
        )}
        {onAdd && (
          <button onClick={onAdd} className="btn-primary flex items-center gap-1.5">
            <span>+</span> บันทึก
          </button>
        )}
      </div>
    </div>
  )
}

// Summary card
export function SumCard({ label, value, sub, color, prefix = '฿' }) {
  return (
    <div className="card p-4 relative overflow-hidden flex-1 min-w-0">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">{label}</div>
      <div className="mono text-lg font-bold" style={{ color }}>
        {prefix}{fmt(value)}
      </div>
      {sub && <div className="text-[10px] text-gray-600 mt-1">{sub}</div>}
    </div>
  )
}

// Transaction row
export function TxRow({ tx, onClick }) {
  const color = TYPE_COLOR[tx.transaction_type] || '#aaa'
  const label = TYPE_LABEL[tx.transaction_type] || tx.transaction_type
  const isPositive = tx.transaction_type === 'income'

  return (
    <div onClick={() => onClick?.(tx)}
      className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-surface2 cursor-pointer transition-colors">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ background: `${color}18` }}>
        {tx.category?.icon || '📋'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{tx.category?.name || tx.note || label}</div>
        <div className="text-[11px] text-gray-500 mt-0.5">
          {tx.transaction_date} · {label} · {tx.payment_method === 'cash' ? 'เงินสด' : tx.payment_method === 'credit' ? 'บัตรเครดิต' : 'โอน'}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="mono text-sm font-semibold" style={{ color }}>
          {isPositive ? '+' : '-'}฿{fmt(tx.amount)}
        </div>
      </div>
    </div>
  )
}

// Progress bar
export function ProgressBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100)
  const c = pct >= 100 ? '#f87171' : pct >= 85 ? '#fbbf24' : color || '#60a5fa'
  return (
    <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c }} />
    </div>
  )
}

// Loading spinner
export function Spinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-debt border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Empty state
export function Empty({ text = 'ไม่มีข้อมูล' }) {
  return (
    <div className="flex items-center justify-center h-48 text-gray-600 text-sm">{text}</div>
  )
}

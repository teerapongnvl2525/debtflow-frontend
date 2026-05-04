import { useState, useEffect } from 'react'
import { transactions as txApi } from '../lib/api'
import { fmt, currentMonth, TYPE_COLOR, TYPE_LABEL } from '../lib/utils'
import { PageHeader, TxRow, SumCard, Spinner, Empty } from '../components/UI'
import AddModal from '../components/AddModal'

// ---- ALL TRANSACTIONS ----
export function TransactionsPage() {
  const [month, setMonth] = useState(currentMonth())
  const [filter, setFilter] = useState('all')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = { month }
      if (filter !== 'all') params.type = filter
      const res = await txApi.list(params)
      setList(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [month, filter])

  const filters = ['all','income','expense','debt','invest','transfer']
  const filterLabel = { all:'ทั้งหมด', income:'รายรับ', expense:'รายจ่าย', debt:'โปะหนี้', invest:'ลงทุน', transfer:'โอน' }

  return (
    <>
      {modal && <AddModal onClose={() => setModal(false)} onSaved={load} />}
      <PageHeader title="รายการทั้งหมด" month={month} setMonth={setMonth} onAdd={() => setModal(true)} />
      <div className="p-5">
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                filter === f ? 'bg-invest/20 text-invest border border-invest/40' : 'text-gray-500 border border-border'
              }`}>
              {filterLabel[f]}
            </button>
          ))}
        </div>
        <div className="card">
          {loading ? <Spinner />
            : list.length === 0 ? <Empty text="ไม่มีรายการในเดือนนี้" />
            : list.map(tx => <TxRow key={tx.id} tx={tx} />)
          }
        </div>
      </div>
    </>
  )
}

// ---- INCOME PAGE ----
export function IncomePage() {
  const [month, setMonth] = useState(currentMonth())
  const [list, setList] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [l, s] = await Promise.all([
        txApi.list({ month, type: 'income' }),
        txApi.summary(month)
      ])
      setList(l.data)
      setSummary(s.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [month])

  // สัดส่วนรายรับ
  const incomeBreakdown = [
    { label: 'เงินเดือน', amount: 53840, color: '#34d399' },
    { label: 'ประจำตำแหน่ง+เบี้ย', amount: 39750, color: '#6ee7b7' },
    { label: 'คลินิก', amount: 24000, color: '#a7f3d0' },
  ]
  const totalFixed = 117590

  return (
    <>
      {modal && <AddModal onClose={() => setModal(false)} onSaved={load} defaultType="income" />}
      <PageHeader title="รายรับ" month={month} setMonth={setMonth} onAdd={() => setModal(true)} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <SumCard label="รายรับรวม" value={summary?.income || 0} color="#34d399" />
          <SumCard label="เป้าหมาย" value={117590} color="#6ee7b7" />
          <SumCard label="จำนวนรายการ" value={list.length} color="#34d399" prefix="" />
        </div>

        {/* สัดส่วน */}
        <div className="card p-4">
          <div className="text-sm font-semibold mb-3">สัดส่วนรายรับ (เป้าหมาย)</div>
          <div className="space-y-3">
            {incomeBreakdown.map((b, i) => {
              const pct = Math.round(b.amount / totalFixed * 100)
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{b.label}</span>
                    <span className="mono" style={{ color: b.color }}>฿{fmt(b.amount)} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-surface2 rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: b.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold">รายการรายรับ</div>
          </div>
          {loading ? <Spinner />
            : list.length === 0 ? <Empty text="ยังไม่มีรายการรายรับ" />
            : list.map(tx => <TxRow key={tx.id} tx={tx} />)
          }
        </div>
      </div>
    </>
  )
}

// ---- EXPENSE PAGE ----
export function ExpensePage() {
  const [month, setMonth] = useState(currentMonth())
  const [list, setList] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [l, s] = await Promise.all([
        txApi.list({ month, type: 'expense' }),
        txApi.summary(month)
      ])
      setList(l.data)
      setSummary(s.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [month])

  return (
    <>
      {modal && <AddModal onClose={() => setModal(false)} onSaved={load} defaultType="expense" />}
      <PageHeader title="รายจ่าย" month={month} setMonth={setMonth} onAdd={() => setModal(true)} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SumCard label="รายจ่ายรวม" value={summary?.expense || 0} color="#f87171" />
          <SumCard label="โปะหนี้" value={summary?.debt_payment || 0} color="#fb923c" />
        </div>

        {/* Recurring reminders */}
        <div className="card p-4">
          <div className="text-sm font-semibold mb-3">📋 รายจ่ายประจำเดือนนี้</div>
          <div className="space-y-1">
            {[
              { label: 'ผ่อนบ้าน KTB', amount: 13900, day: 2 },
              { label: 'สินเชื่อบุคคล KTB', amount: 5500, day: 2 },
              { label: 'First Choice ผ่อน', amount: 15729, day: 5 },
              { label: 'Coway', amount: 690, day: 5 },
              { label: 'Allianz SA+PAG', amount: 15481, day: 17 },
              { label: 'AIA (งวดสุดท้าย ธ.ค.)', amount: 6250, day: '–' },
            ].map((r, i) => (
              <div key={i} className="flex justify-between text-xs py-1.5 border-b border-border last:border-0">
                <span className="text-gray-400">{r.label}</span>
                <span className="text-gray-600">วันที่ {r.day}</span>
                <span className="mono text-expense">฿{fmt(r.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold">รายการรายจ่าย</div>
          </div>
          {loading ? <Spinner />
            : list.length === 0 ? <Empty text="ยังไม่มีรายการรายจ่าย" />
            : list.map(tx => <TxRow key={tx.id} tx={tx} />)
          }
        </div>
      </div>
    </>
  )
}

// ---- INVEST PAGE ----
export function InvestPage() {
  const [month, setMonth] = useState(currentMonth())
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await txApi.list({ month, type: 'invest' })
      setList(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [month])

  const portfolio = [
    { label: 'กบข. (27%)', amount: 1679583, color: '#60a5fa', note: '5.73%/ปี' },
    { label: 'Jitta Portfolio', amount: 1020000, color: '#93c5fd', note: 'หุ้นไทย' },
    { label: 'KFGOLDRMF', amount: 380000, color: '#bfdbfe', note: 'ทองคำ RMF' },
    { label: 'AIA (CV รวม)', amount: 899723, color: '#7c3aed', note: 'สะสมทรัพย์' },
  ]
  const total = portfolio.reduce((s, p) => s + p.amount, 0)

  return (
    <>
      {modal && <AddModal onClose={() => setModal(false)} onSaved={load} defaultType="invest" />}
      <PageHeader title="ลงทุน" month={month} setMonth={setMonth} onAdd={() => setModal(true)} />
      <div className="p-5 space-y-4">
        <SumCard label="พอร์ตรวม" value={total} color="#60a5fa" />

        <div className="card p-4">
          <div className="text-sm font-semibold mb-3">สัดส่วนพอร์ต</div>
          <div className="space-y-3">
            {portfolio.map((p, i) => {
              const pct = Math.round(p.amount / total * 100)
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{p.label} <span className="text-gray-500">{p.note}</span></span>
                    <span className="mono" style={{ color: p.color }}>฿{fmt(p.amount)} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-surface2 rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-[11px] text-gray-500">🎯 เป้าหมาย passive income <span className="text-invest font-semibold">฿160,000/เดือน</span> อายุ 60 ปี (อีก 16 ปี)</div>
          </div>
        </div>

        <div className="card">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold">รายการลงทุนเดือนนี้</div>
          </div>
          {loading ? <Spinner />
            : list.length === 0 ? <Empty text="ยังไม่มีรายการลงทุน" />
            : list.map(tx => <TxRow key={tx.id} tx={tx} />)
          }
        </div>
      </div>
    </>
  )
}

// ---- BUDGET PAGE ----
export function BudgetPage() {
  const [month, setMonth] = useState(currentMonth())

  const budgets = [
    { icon: '🍽️', label: 'อาหาร', budget: 8000, used: 7200 },
    { icon: '⛽', label: 'น้ำมัน', budget: 3000, used: 1800 },
    { icon: '🏠', label: 'บ้าน/สาธารณูปโภค', budget: 3000, used: 2800 },
    { icon: '🎮', label: 'บันเทิง', budget: 4000, used: 5400, over: true },
    { icon: '🏫', label: 'ค่าเล่าเรียนบุตร', budget: 29167, used: 29167 },
    { icon: '🛡️', label: 'ประกัน Allianz', budget: 15481, used: 15481 },
    { icon: '🛡️', label: 'ประกัน AIA (reserve)', budget: 6250, used: 6250 },
    { icon: '🛒', label: 'ผ่อน First Choice', budget: 15729, used: 15729 },
    { icon: '⚡', label: 'โปะหนี้ OD (เป้า)', budget: 10000, used: 0 },
    { icon: '💧', label: 'Coway', budget: 690, used: 690 },
  ]

  return (
    <>
      <PageHeader title="งบประมาณ" month={month} setMonth={setMonth} />
      <div className="p-5">
        <div className="card">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold">งบประมาณรายหมวด</div>
          </div>
          <div className="p-4 space-y-4">
            {budgets.map((b, i) => {
              const pct = Math.min(b.used / b.budget * 100, 100)
              const color = b.over ? '#f87171' : pct >= 100 ? '#f87171' : pct >= 85 ? '#fbbf24' : '#60a5fa'
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm">{b.icon} {b.label}</span>
                    <span className="mono text-xs" style={{ color: b.over ? '#f87171' : '#7c85a2' }}>
                      ฿{fmt(b.used)} / {fmt(b.budget)} {b.over && '⚠'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface2 rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

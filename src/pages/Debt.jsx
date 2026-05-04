import { useState, useEffect } from 'react'
import { debts as debtApi } from '../lib/api'
import { fmt, fmtDec } from '../lib/utils'
import { PageHeader, SumCard, Spinner } from '../components/UI'
import AddModal from '../components/AddModal'

function calcMonths(balance, rate, minPay, extra) {
  const r = rate / 100 / 12
  const pay = minPay + extra
  if (!pay || !balance) return 0
  if (r === 0) return Math.ceil(balance / pay)
  if (pay <= balance * r) return '∞'
  return Math.ceil(-Math.log(1 - (balance * r) / pay) / Math.log(1 + r))
}

const PRIORITY_COLOR = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#94a3b8', 5: '#94a3b8' }
const DEBT_TYPE_LABEL = { od: 'OD', personal: 'สินเชื่อบุคคล', mortgage: 'สินเชื่อบ้าน', credit_card: 'บัตรเครดิต' }

export default function DebtPage() {
  const [debtList, setDebtList] = useState([])
  const [summary, setSummary] = useState(null)
  const [extra, setExtra] = useState(5000)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  const load = async () => {
    try {
      const [dl, sm] = await Promise.all([debtApi.list(), debtApi.summary()])
      setDebtList(dl.data)
      setSummary(sm.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const topDebt = debtList.find(d => d.priority === 1)
  const monthsMin = topDebt ? calcMonths(topDebt.balance, topDebt.interest_rate, topDebt.min_payment || 3248, 0) : '-'
  const monthsExtra = topDebt ? calcMonths(topDebt.balance, topDebt.interest_rate, topDebt.min_payment || 3248, extra) : '-'

  if (loading) return <><PageHeader title="หนี้สิน" /><Spinner /></>

  return (
    <>
      {modal && <AddModal onClose={() => setModal(false)} onSaved={load} defaultType="debt" debtList={debtList} />}

      <PageHeader title="หนี้สิน" sub="ติดตามและลดหนี้" onAdd={() => setModal(true)} />

      <div className="p-5 space-y-4">
        {/* Alert Banner */}
        {topDebt && (
          <div className="bg-gradient-to-r from-red-500/15 to-debt/8 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-red-400">ลำดับความสำคัญสูงสุด: {topDebt.name}</div>
              <div className="text-xs text-gray-400 mt-1">
                ดอกเบี้ย {topDebt.interest_rate}%/ปี · ยอดค้าง ฿{fmt(topDebt.balance)} · ครบชำระวันที่ {topDebt.due_day} ของเดือน
              </div>
            </div>
            <button onClick={() => setModal(true)} className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
              โปะเพิ่ม →
            </button>
          </div>
        )}

        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SumCard label="หนี้รวม" value={summary?.total_balance || 0} color="#f87171" />
          <SumCard label="ดอกเบี้ย/เดือน" value={summary?.total_monthly_interest || 0} color="#ef4444" />
          <SumCard label="จ่ายขั้นต่ำ/เดือน" value={summary?.total_min_payment || 0} color="#fb923c" />
          <SumCard label="จำนวนรายการหนี้" value={summary?.debt_count || 0} color="#60a5fa" prefix="" />
        </div>

        {/* Debt Cards */}
        <div className="grid md:grid-cols-3 gap-3">
          {debtList.map(d => {
            const pct = d.original_amount ? ((d.original_amount - d.balance) / d.original_amount * 100) : 0
            const color = PRIORITY_COLOR[d.priority] || '#94a3b8'
            const monthlyInt = d.interest_rate ? fmtDec(d.balance * d.interest_rate / 100 / 12) : '0'
            return (
              <div key={d.id} className="card p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs font-bold mb-0.5" style={{ color }}>
                      #{d.priority} · {DEBT_TYPE_LABEL[d.debt_type] || d.debt_type}
                    </div>
                    <div className="text-sm font-semibold">{d.name}</div>
                    <div className="text-[11px] text-gray-500">{d.bank} · {d.interest_rate}%/ปี</div>
                  </div>
                  <div className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${color}20`, color }}>
                    #{d.priority}
                  </div>
                </div>

                <div className="mono text-xl font-bold text-expense mb-2">฿{fmt(d.balance)}</div>

                {d.original_amount > 0 && (
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>ชำระแล้ว {pct.toFixed(0)}%</span>
                      {d.due_day && <span>ครบ {d.due_day} ของเดือน</span>}
                    </div>
                    <div className="h-1 bg-surface2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-gray-500">
                  {d.min_payment ? <span>ขั้นต่ำ ฿{fmt(d.min_payment)}/เดือน</span> : <span>—</span>}
                  <span style={{ color }}>ดอก ฿{monthlyInt}/เดือน</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Payoff Calculator */}
        {topDebt && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="text-sm font-semibold mb-3">🧮 คำนวณโปะ {topDebt.name}</div>
              <div className="mb-3">
                <div className="text-[11px] text-gray-500 mb-2">จ่ายเพิ่มต่อเดือน</div>
                <input type="range" min={0} max={20000} step={500} value={extra}
                  onChange={e => setExtra(Number(e.target.value))}
                  className="w-full accent-debt" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>฿0</span>
                  <span className="text-debt mono font-bold">+฿{fmt(extra)}</span>
                  <span>฿20,000</span>
                </div>
              </div>
              <div className="bg-surface2 rounded-lg p-3 flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">ขั้นต่ำอย่างเดียว</div>
                  <div className="mono text-lg font-bold text-expense">{monthsMin} เดือน</div>
                </div>
                <div className="w-px bg-border" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">โปะเพิ่ม ฿{fmt(extra)}</div>
                  <div className="mono text-lg font-bold text-income">{monthsExtra} เดือน</div>
                </div>
              </div>
              {extra > 0 && monthsMin !== '∞' && monthsExtra !== '∞' && (
                <div className="text-xs text-income mt-2">
                  ✓ ประหยัดได้ {Number(monthsMin) - Number(monthsExtra)} เดือน
                </div>
              )}
            </div>

            {/* Strategy */}
            <div className="card p-4">
              <div className="text-sm font-semibold mb-3">🎯 แนะนำเดือนนี้ (Avalanche)</div>
              <div className="space-y-2">
                {[
                  { n: 1, text: 'โปะ OD ธนวัฏก่อน', sub: '18%/ปี — แพงสุด ทุก ฿1,000 ประหยัด ฿180/ปี', color: '#ef4444', urgent: true },
                  { n: 2, text: 'จ่ายบัตรเครดิตเต็มจำนวน', sub: 'หลีกเลี่ยงดอก 16% เดือนถัดไป', color: '#f97316' },
                  { n: 3, text: 'ผ่อนสินเชื่อบุคคลตามปกติ', sub: '4.1% — จ่ายขั้นต่ำ ฿5,500', color: '#eab308' },
                  { n: 4, text: 'ผ่อนบ้านตามปกติ', sub: '2.8% — ต่ำสุด ไม่รีบโปะ', color: '#94a3b8' },
                ].map(r => (
                  <div key={r.n} className="flex gap-2.5 p-2.5 bg-surface2 rounded-lg"
                    style={{ border: r.urgent ? `1px solid ${r.color}30` : '1px solid transparent' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ background: r.color }}>{r.n}</div>
                    <div>
                      <div className="text-xs font-semibold">{r.text}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AIA Countdown */}
        <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <div className="text-sm font-semibold text-green-400">AIA ปีนี้ชำระงวดสุดท้าย!</div>
            <div className="text-xs text-gray-500 mt-0.5">หลัง ธ.ค. 2569 ประหยัดได้ ฿6,250/เดือน — Cash flow ดีขึ้นทันที</div>
          </div>
        </div>
      </div>
    </>
  )
}

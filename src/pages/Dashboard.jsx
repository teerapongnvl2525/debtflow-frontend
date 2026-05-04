import { useState, useEffect } from 'react'
import { transactions as txApi, summary as sumApi, debts as debtApi } from '../lib/api'
import { fmt, currentMonth, thaiMonth } from '../lib/utils'
import { PageHeader, SumCard, TxRow, Spinner } from '../components/UI'
import AddModal from '../components/AddModal'

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth())
  const [txSummary, setTxSummary] = useState(null)
  const [netWorth, setNetWorth] = useState(null)
  const [recentTx, setRecentTx] = useState([])
  const [debtSummary, setDebtSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [sm, nw, tx, ds] = await Promise.all([
        txApi.summary(month),
        sumApi.netWorth(),
        txApi.list({ month }),
        debtApi.summary(),
      ])
      setTxSummary(sm.data)
      setNetWorth(nw.data)
      setRecentTx(tx.data.slice(0, 7))
      setDebtSummary(ds.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [month])

  if (loading) return <><PageHeader title="Dashboard" month={month} setMonth={setMonth} /><Spinner /></>

  const nw = netWorth?.financial_net_worth || 0

  return (
    <>
      {modal && <AddModal onClose={() => setModal(false)} onSaved={load} />}
      <PageHeader title="Dashboard" month={month} setMonth={setMonth} onAdd={() => setModal(true)} />

      <div className="p-5 space-y-4">
        {/* Net Worth Banner */}
        <div className="card p-4 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Financial Net Worth</div>
            <div className="mono text-3xl font-bold text-yellow-400 mt-1">฿{fmt(nw)}</div>
            <div className="text-[11px] text-gray-600 mt-0.5">ไม่รวมมูลค่าบ้าน</div>
          </div>
          <div className="w-px h-10 bg-border hidden md:block" />
          <div className="flex gap-4 flex-wrap">
            <div>
              <div className="text-[10px] text-gray-500">สินทรัพย์</div>
              <div className="mono text-sm font-semibold text-income">฿{fmt(netWorth?.total_financial_assets || 0)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500">หนี้รวม</div>
              <div className="mono text-sm font-semibold text-expense">-฿{fmt(netWorth?.total_debt || 0)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500">มูลค่าบ้าน</div>
              <div className="mono text-sm font-semibold text-gray-400">฿{fmt(netWorth?.total_external || 0)}</div>
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SumCard label="รายรับ" value={txSummary?.income || 0} color="#34d399"
            sub={`เป้า ฿117,590`} />
          <SumCard label="รายจ่าย" value={txSummary?.expense || 0} color="#f87171" />
          <SumCard label="ลงทุน" value={txSummary?.invest || 0} color="#60a5fa" />
          <SumCard label="คงเหลือ" value={txSummary?.remaining || 0}
            color={(txSummary?.remaining || 0) >= 0 ? '#fbbf24' : '#f87171'}
            sub={(txSummary?.remaining || 0) < 0 ? '⚠ ติดลบ' : ''} />
        </div>

        {/* Cash flow alert */}
        {txSummary?.cashflow_alert && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400">
            ⚠ รายจ่ายสูงกว่ารายรับเดือนนี้ — ควรทบทวนค่าใช้จ่าย
          </div>
        )}

        <div className="grid md:grid-cols-5 gap-3">
          {/* Recent transactions */}
          <div className="card md:col-span-3">
            <div className="px-4 py-3 border-b border-border flex justify-between items-center">
              <div className="text-sm font-semibold">รายการล่าสุด</div>
            </div>
            {recentTx.length === 0
              ? <div className="p-8 text-center text-gray-600 text-sm">ยังไม่มีรายการ</div>
              : recentTx.map(tx => <TxRow key={tx.id} tx={tx} />)
            }
          </div>

          {/* Debt due + AIA notice */}
          <div className="md:col-span-2 space-y-3">
            <div className="card p-4">
              <div className="text-sm font-semibold mb-3">⏰ ครบกำหนดชำระเดือนนี้</div>
              <div className="space-y-0">
                {(debtSummary?.upcoming_payments || []).map((d, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0 text-xs">
                    <span className="text-gray-400">{d.name}</span>
                    <span className="text-gray-500">วันที่ {d.due_day}</span>
                    <span className="mono font-medium text-expense">฿{fmt(d.min_payment)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 text-xs">
                  <span className="text-gray-400">💧 Coway</span>
                  <span className="text-gray-500">วันที่ 5</span>
                  <span className="mono font-medium text-expense">฿690</span>
                </div>
              </div>
            </div>

            <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-3">
              <div className="text-xs font-semibold text-green-400 mb-1">🎉 AIA งวดสุดท้าย ธ.ค. 2569</div>
              <div className="text-[11px] text-gray-500">ประหยัด ฿6,250/เดือน หลังจากนั้น</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

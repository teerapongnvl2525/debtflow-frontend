import { useState, useEffect } from 'react'
import { transactions } from '../lib/api'
import { TYPE_COLOR, currentMonth } from '../lib/utils'

const TYPES = [
  { id: 'expense', icon: '－', label: 'รายจ่าย' },
  { id: 'income',  icon: '＋', label: 'รายรับ' },
  { id: 'debt',    icon: '⚡', label: 'โปะหนี้' },
  { id: 'invest',  icon: '◈', label: 'ลงทุน' },
  { id: 'transfer',icon: '⇄', label: 'โอน' },
]

const PAYS = [
  { id: 'cash',     label: '💵 เงินสด' },
  { id: 'transfer', label: '🏦 โอน' },
  { id: 'debit',    label: '💳 เดบิต' },
  { id: 'credit',   label: '💳 เครดิต' },
]

export default function AddModal({ onClose, onSaved, defaultType, debtList = [] }) {
  const [type, setType] = useState(defaultType || 'expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [pay, setPay] = useState('transfer')
  const [note, setNote] = useState('')
  const [debtId, setDebtId] = useState('')
  const [saving, setSaving] = useState(false)

  const color = TYPE_COLOR[type] || '#aaa'

  const handleSave = async () => {
    if (!amount || isNaN(amount)) return
    setSaving(true)
    try {
      await transactions.create({
        transaction_type: type,
        amount: parseFloat(amount),
        transaction_date: date,
        payment_method: pay,
        note,
        debt_id: type === 'debt' ? debtId || undefined : undefined,
      })
      onSaved?.()
      onClose()
    } catch (e) {
      alert('บันทึกไม่สำเร็จ: ' + (e.response?.data?.detail || e.message))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center">
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-border rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface">
          <div className="text-sm font-semibold">บันทึกรายการ</div>
          <button onClick={onClose} className="text-gray-500 text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type tabs */}
          <div className="grid grid-cols-5 gap-1.5">
            {TYPES.map(t => {
              const c = TYPE_COLOR[t.id]
              const active = type === t.id
              return (
                <button key={t.id} onClick={() => setType(t.id)}
                  className="py-2 rounded-lg border text-center transition-all text-xs"
                  style={{
                    borderColor: active ? c : '#2a2f47',
                    background: active ? `${c}15` : 'transparent',
                    color: active ? c : '#7c85a2'
                  }}>
                  <div className="text-base">{t.icon}</div>
                  <div className="mt-0.5">{t.label}</div>
                </button>
              )
            })}
          </div>

          {/* Amount */}
          <div>
            <label className="text-[11px] text-gray-500 block mb-1.5">จำนวนเงิน (บาท)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-3 outline-none focus:border-invest mono text-xl font-bold transition-colors"
              style={{ color }} />
          </div>

          {/* Debt selector */}
          {type === 'debt' && (
            <div>
              <label className="text-[11px] text-gray-500 block mb-1.5">โปะหนี้รายการไหน</label>
              <select value={debtId} onChange={e => setDebtId(e.target.value)} className="select">
                <option value="">-- เลือกหนี้ --</option>
                {debtList.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — ฿{Number(d.balance).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-[11px] text-gray-500 block mb-1.5">วันที่</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </div>

          {/* Payment method */}
          <div>
            <label className="text-[11px] text-gray-500 block mb-1.5">วิธีชำระ</label>
            <div className="flex flex-wrap gap-2">
              {PAYS.map(p => (
                <button key={p.id} onClick={() => setPay(p.id)}
                  className="px-3 py-1.5 rounded-full border text-xs transition-all"
                  style={{
                    borderColor: pay === p.id ? '#60a5fa' : '#2a2f47',
                    background: pay === p.id ? 'rgba(96,165,250,0.1)' : 'transparent',
                    color: pay === p.id ? '#60a5fa' : '#7c85a2'
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {pay === 'credit' && (
            <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-400">
              ⚠ รายจ่ายบัตรเครดิต — ยอดธนาคารยังไม่หัก จนกว่าจะจ่ายบิล
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-[11px] text-gray-500 block mb-1.5">หมายเหตุ</label>
            <input value={note} onChange={e => setNote(e.target.value)}
              placeholder="รายละเอียด (optional)" className="input" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-border sticky bottom-0 bg-surface">
          <button onClick={onClose} className="btn-secondary flex-1">ยกเลิก</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-2 flex-1 font-bold rounded-lg px-4 py-2 text-sm transition-opacity disabled:opacity-50"
            style={{ background: color, color: '#0b0e18' }}>
            {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}

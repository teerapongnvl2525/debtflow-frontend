export const fmt = (n) =>
  Number(n).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const fmtDec = (n) =>
  Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const TYPE_COLOR = {
  income: '#34d399',
  expense: '#f87171',
  invest: '#60a5fa',
  debt: '#fb923c',
  transfer: '#fbbf24',
}

export const TYPE_LABEL = {
  income: 'รายรับ',
  expense: 'รายจ่าย',
  invest: 'ลงทุน',
  debt: 'โปะหนี้',
  transfer: 'โอน',
}

export const TYPE_ICON = {
  income: '＋',
  expense: '－',
  invest: '◈',
  debt: '⚡',
  transfer: '⇄',
}

export const currentMonth = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const thaiMonth = (m) => {
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  const [y, mo] = m.split('-')
  return `${months[parseInt(mo) - 1]} ${parseInt(y) + 543}`
}

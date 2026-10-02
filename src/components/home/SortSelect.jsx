import { SORT_OPTIONS } from '../../data/vehiculos'

export default function SortSelect({ value, onChange }) {
  return (
    <label className="flex items-center shrink-0 gap-2">
      <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted">Ordenar por:</span>
      <select
        className="px-3 py-2 bg-card border border-border rounded-[4px] text-[12px] cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

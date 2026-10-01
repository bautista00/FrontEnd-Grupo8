import { SORT_OPTIONS } from '../../data/vehiculos'
import './SortSelect.css'

export default function SortSelect({ value, onChange }) {
  return (
    <label className="sort-select">
      <span className="sort-select__label">Ordenar por:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

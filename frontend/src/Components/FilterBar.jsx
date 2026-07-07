import styles from "./FilterBar.module.css"


const DATE_OPTIONS = [
    { key: "any", label: "Било кога" },
    { key: "today", label: "Денес" },
    { key: "thisWeek", label: "Оваа недела" },
    { key: "weekend", label: "Викендов" },
    { key: "nextWeek", label: "Следна недела" },
]

function ChipGroup({ options, value, onChange }) {
    return (
        <div className={styles.chipGroup}>
            {options.map((opt) => (
                <button
                    key={opt.key}
                    className={`${styles.chip} ${value === opt.key ? styles.chipActive : ""}`}
                    onClick={() => onChange(opt.key)}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    )
}

export default function FilterBar({ source, setSource, dateRange, setDateRange }) {
    return (
        <div className={styles.filterBar}>
            <div className={styles.filterRow}>
                <span className={styles.filterLabel}>Кога</span>
                <ChipGroup options={DATE_OPTIONS} value={dateRange} onChange={setDateRange} />
            </div>
        </div>
    )
}

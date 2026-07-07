import styles from "./Nav.module.css"
import SearchBar from "./SearchBar"

const VIEWS = [
    { key: "events", label: "Настани" },
    { key: "artists", label: "Артисти" },
    { key: "analytics", label: "Аналитика" },
]

export default function Nav(props){
    const { view, setView, isAdmin, onAddEvent, refreshKey } = props;
    return (
        <nav className={styles.navbarContainer}>
            <div className={styles.logoGroup}>
                <span className={styles.subtitle}>Не знаеш каде?</span>
                <h1 className={styles.mainTitle}>
                    <span className={styles.accent}>Шема</span> е тука за тебе{" "}
                    <span className={styles.discoBall}>🪩</span>
                </h1>
            </div>

            <div className={styles.viewToggle}>
                {VIEWS.map((v) => (
                    <button
                        key={v.key}
                        className={`${styles.toggleButton} ${view === v.key ? styles.toggleActive : ""}`}
                        onClick={() => setView(v.key)}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            <div className={styles.searchGroup}>
                {view === "events" && <SearchBar setPosts={props.setPosts} refreshKey={refreshKey}/>}
                {isAdmin && (
                    <button className={styles.addButton} onClick={onAddEvent} title="Додади настан (админ)">
                        + Настан
                    </button>
                )}
            </div>
        </nav>
    )
}

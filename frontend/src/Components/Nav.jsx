import { useState } from "react"
import { Link } from "react-router-dom"
import styles from "./Nav.module.css"
import SearchBar from "./SearchBar"
import ConfirmModal from "./ConfirmModal"

const VIEWS = [
    { key: "events", label: "Настани" },
    { key: "artists", label: "Артисти" },
    { key: "analytics", label: "Аналитика" },
]

export default function Nav(props){
    const { view, setView, isAdmin, user, onLogout, onAddEvent, refreshKey } = props;
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
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
                {user ? (
                    <div className={styles.userBox}>
                        <span className={styles.greeting}>
                            Здраво, <strong>{user.username}</strong>{isAdmin && <span className={styles.adminBadge}>админ</span>}
                        </span>
                        <button className={styles.logoutButton} onClick={() => setLogoutConfirmOpen(true)}>Одјави се</button>
                    </div>
                ) : (
                    <Link className={styles.loginButton} to="/login">Најави се</Link>
                )}
            </div>

            {logoutConfirmOpen && (
                <ConfirmModal
                    icon="👋"
                    title="Одјава?"
                    message={`Ќе се одјавиш од профилот ${user?.username}. Секогаш можеш повторно да се најавиш.`}
                    confirmLabel="Одјави се"
                    cancelLabel="Останувам"
                    onConfirm={() => { setLogoutConfirmOpen(false); onLogout(); }}
                    onCancel={() => setLogoutConfirmOpen(false)}
                />
            )}
        </nav>
    )
}

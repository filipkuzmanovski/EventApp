import styles from "./Footer.module.css"

export default function Footer({ adminToken, setAdminToken }){
    const year = new Date().getFullYear();

    const handleAdminClick = () => {
        if (adminToken) {
            if (window.confirm("Одјава од админ режим?")) {
                setAdminToken("");
            }
        } else {
            const token = window.prompt("Админ токен:");
            if (token) setAdminToken(token.trim());
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.brand}>
                    <span className={styles.accent}>Шема</span>
                    <p className={styles.tagline}>
                        Најдобрите забави во градот, на едно место 🪩
                    </p>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.columnTitle}>Клубови</h4>
                    <a href="https://www.instagram.com/club.pure.skopje/" target="_blank" rel="noreferrer">Pure</a>
                    <a href="https://www.instagram.com/makka.bar/" target="_blank" rel="noreferrer">Makka</a>
                    <a href="https://www.instagram.com/havana.summer.club/" target="_blank" rel="noreferrer">Havana</a>
                    <a href="https://www.instagram.com/franz.freewifi/" target="_blank" rel="noreferrer">Franz</a>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <p>
                    © {year} Шема. Сите права задржани.
                    <button
                        className={`${styles.adminDot} ${adminToken ? styles.adminActive : ""}`}
                        onClick={handleAdminClick}
                        aria-label="Админ"
                        title={adminToken ? "Админ режим активен" : ""}
                    >
                        ⚙
                    </button>
                </p>
            </div>
        </footer>
    )
}

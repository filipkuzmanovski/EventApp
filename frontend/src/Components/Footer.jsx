import styles from "./Footer.module.css"

export default function Footer(){
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.brand}>
                    <span className={styles.accent}>Шема</span>
                    <p className={styles.tagline}>
                        Најдобрите забави во градот, на едно место 🪩
                    </p>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <p>© {year} Шема. Сите права задржани.</p>
            </div>
        </footer>
    )
}

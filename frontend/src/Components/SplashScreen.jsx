import styles from "./SplashScreen.module.css"

export default function SplashScreen({ fading }) {
    return (
        <div className={`${styles.splash} ${fading ? styles.fadeOut : ""}`}>
            <span className={styles.ball}>🪩</span>
            <h1 className={styles.wordmark}>Шема</h1>
            <p className={styles.tag}>Не знаеш каде? Шема е тука за тебе.</p>
        </div>
    )
}

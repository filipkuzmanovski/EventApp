import { useEffect } from "react"
import styles from "./ConfirmModal.module.css"

/**
 * Themed confirmation dialog.
 * danger=true styles the confirm button red (destructive actions).
 */
export default function ConfirmModal({
    icon = "❓",
    title,
    message,
    confirmLabel = "Потврди",
    cancelLabel = "Откажи",
    danger = false,
    onConfirm,
    onCancel,
}) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onCancel() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onCancel])

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div
                className={`${styles.modal} ${danger ? styles.dangerModal : ""}`}
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-label={title}
            >
                <span className={styles.icon}>{icon}</span>
                <h2 className={styles.title}>{title}</h2>
                {message && <p className={styles.message}>{message}</p>}

                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button
                        className={`${styles.confirmButton} ${danger ? styles.dangerButton : ""}`}
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

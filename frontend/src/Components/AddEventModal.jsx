import { useEffect, useState } from "react"
import styles from "./AddEventModal.module.css"

const ADMIN_URL = "http://localhost:8080/api/admin/events"

export default function AddEventModal({ adminToken, onClose, onCreated }) {
    const [form, setForm] = useState({
        bar: "", caption: "", image_url: "", event_date: "", address: "", post_url: "",
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

    async function submit(e) {
        e.preventDefault()
        if (!form.bar.trim() || !form.caption.trim()) {
            setError("Клуб и опис се задолжителни.")
            return
        }
        setSaving(true)
        setError(null)
        try {
            const payload = {
                ...form,
                // datetime-local has no timezone — send it as local ISO with offset
                event_date: form.event_date
                    ? new Date(form.event_date).toISOString()
                    : null,
            }
            const response = await fetch(ADMIN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Token": adminToken,
                },
                body: JSON.stringify(payload),
            })
            if (response.status === 403) {
                setError("Невалиден админ токен.")
                return
            }
            if (!response.ok) {
                setError(`Грешка од серверот (${response.status}).`)
                return
            }
            onCreated()
            onClose()
        } catch {
            setError("Серверот не е достапен.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
                <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Затвори">✕</button>
                <h2 className={styles.title}>Додади настан</h2>

                <label className={styles.label}>
                    Клуб / локација *
                    <input className={styles.input} value={form.bar} onChange={set("bar")} placeholder="пр. Omnia Night Club" />
                </label>

                <label className={styles.label}>
                    Опис *
                    <textarea className={styles.textarea} rows={5} value={form.caption} onChange={set("caption")} placeholder="Опис на настанот..." />
                </label>

                <div className={styles.rowSplit}>
                    <label className={styles.label}>
                        Датум и време
                        <input className={styles.input} type="datetime-local" value={form.event_date} onChange={set("event_date")} />
                    </label>
                    <label className={styles.label}>
                        Слика (URL)
                        <input className={styles.input} value={form.image_url} onChange={set("image_url")} placeholder="https://..." />
                    </label>
                </div>

                <div className={styles.rowSplit}>
                    <label className={styles.label}>
                        Адреса
                        <input className={styles.input} value={form.address} onChange={set("address")} placeholder="ул. ..., Скопје" />
                    </label>
                    <label className={styles.label}>
                        Линк до пост
                        <input className={styles.input} value={form.post_url} onChange={set("post_url")} placeholder="https://... (опционално)" />
                    </label>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button className={styles.submit} type="submit" disabled={saving}>
                    {saving ? "Се зачувува..." : "Зачувај настан"}
                </button>
            </form>
        </div>
    )
}

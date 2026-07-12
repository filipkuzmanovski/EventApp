import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import styles from "./AuthPage.module.css"

const AUTH_URL = "http://localhost:8080/api/auth"

export default function AuthPage({ mode, onAuth }) {
    const isRegister = mode === "register"
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: "", username: "", password: "", repeat: "" })
    const [error, setError] = useState(null)
    const [saving, setSaving] = useState(false)

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

    async function submit(e) {
        e.preventDefault()
        setError(null)

        if (!form.username.trim() || !form.password) {
            setError("Пополнете ги сите полиња.")
            return
        }
        if (isRegister) {
            if (!form.email.trim()) {
                setError("Пополнете ги сите полиња.")
                return
            }
            if (form.password !== form.repeat) {
                setError("Лозинките не се совпаѓаат.")
                return
            }
        }

        setSaving(true)
        try {
            const body = isRegister
                ? { email: form.email, username: form.username, password: form.password }
                : { username: form.username, password: form.password }
            const response = await fetch(`${AUTH_URL}/${isRegister ? "register" : "login"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) {
                setError(data.message || `Грешка (${response.status}).`)
                return
            }
            onAuth(data) // { username, role, adminToken? }
            navigate("/")
        } catch {
            setError("Серверот не е достапен.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.page}>
            <form className={styles.card} onSubmit={submit}>
                <Link to="/" className={styles.logo}>Шема 🪩</Link>
                <h1 className={styles.title}>{isRegister ? "Регистрирај се" : "Најави се"}</h1>
                <p className={styles.subtitle}>
                    {isRegister
                        ? "Направи профил и биди дел од шемата."
                        : "Добредојде назад! Внеси ги твоите податоци."}
                </p>

                {isRegister && (
                    <label className={styles.label}>
                        Е-маил
                        <input className={styles.input} type="email" value={form.email} onChange={set("email")} placeholder="ime@primer.com" autoComplete="email" />
                    </label>
                )}

                <label className={styles.label}>
                    Корисничко име
                    <input className={styles.input} value={form.username} onChange={set("username")} placeholder="корисничко име" autoComplete="username" />
                </label>

                <label className={styles.label}>
                    Лозинка
                    <input className={styles.input} type="password" value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete={isRegister ? "new-password" : "current-password"} />
                </label>

                {isRegister && (
                    <label className={styles.label}>
                        Повтори лозинка
                        <input className={styles.input} type="password" value={form.repeat} onChange={set("repeat")} placeholder="••••••••" autoComplete="new-password" />
                    </label>
                )}

                {error && <p className={styles.error}>{error}</p>}

                <button className={styles.submit} type="submit" disabled={saving}>
                    {saving ? "Само момент..." : isRegister ? "Регистрирај се" : "Најави се"}
                </button>

                <p className={styles.switchLine}>
                    {isRegister ? (
                        <>Веќе имаш профил? <Link className={styles.switchLink} to="/login">Најави се</Link></>
                    ) : (
                        <>Немаш профил? <Link className={styles.switchLink} to="/register">Регистрирај се</Link></>
                    )}
                </p>
            </form>
        </div>
    )
}

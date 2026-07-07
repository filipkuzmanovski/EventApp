import { useEffect, useState } from "react"
import styles from "./Analytics.module.css"
import { cleanBarName } from "../utils"

const ALL_URL = "http://localhost:8080/api/events/all"

export default function Analytics({ onSelectBar }) {
    const [stats, setStats] = useState([])
    const [total, setTotal] = useState(0)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch(ALL_URL)
                const posts = await response.json()

                const counts = new Map()
                for (const post of posts) {
                    const name = post.bar?.name || "?"
                    counts.set(name, (counts.get(name) || 0) + 1)
                }
                const rows = [...counts.entries()]
                    .map(([name, count]) => ({
                        name,
                        count,
                        pct: posts.length ? (count / posts.length) * 100 : 0,
                    }))
                    .sort((a, b) => b.count - a.count)

                setStats(rows)
                setTotal(posts.length)
            } catch {
                setStats([])
            } finally {
                setLoaded(true)
            }
        }
        load()
    }, [])

    if (loaded && stats.length === 0) {
        return (
            <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📊</span>
                <h2>Нема податоци за аналитика</h2>
                <p>Аналитиката се појавува штом има настани.</p>
            </div>
        )
    }

    const maxPct = stats.length ? stats[0].pct : 100

    return (
        <div className={styles.analytics}>
            <div className={styles.header}>
                <h2 className={styles.title}>Каде се случува шемата?</h2>
                <p className={styles.subtitle}>
                    {total} настани во {stats.length} локации — кликни на локација за да ги видиш настаните
                </p>
            </div>

            <div className={styles.chart}>
                {stats.map((row, index) => (
                    <button
                        key={row.name}
                        className={styles.row}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onClick={() => onSelectBar(row.name)}
                        title={`Види ги настаните во ${cleanBarName(row.name)}`}
                    >
                        <div className={styles.rowTop}>
                            <span className={styles.venue}>{cleanBarName(row.name)}</span>
                            <span className={styles.numbers}>
                                {row.count} {row.count === 1 ? "настан" : "настани"}
                                <span className={styles.pct}> • {row.pct.toFixed(1)}%</span>
                            </span>
                        </div>
                        <div className={styles.track}>
                            <div
                                className={styles.fill}
                                style={{ width: `${(row.pct / maxPct) * 100}%` }}
                            ></div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

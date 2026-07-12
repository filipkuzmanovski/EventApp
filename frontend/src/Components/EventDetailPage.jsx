import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import styles from "./EventDetailPage.module.css"
import { cleanBarName, placeholderFor, formatEventDate } from "../utils"

const API = "http://localhost:8080/api"

// Small clickable event card used in the related-events rows
function MiniEventCard({ post }) {
    const fallback = placeholderFor(post.postUrl)
    const dateLabel = formatEventDate(post.eventDate)
    return (
        <Link to={`/event/${post.id}`} className={styles.miniCard}>
            <div className={styles.miniImageWrap}>
                <img
                    src={post.imageUrl || fallback}
                    alt={cleanBarName(post.bar?.name)}
                    loading="lazy"
                    onError={(e) => {
                        if (e.currentTarget.src !== window.location.origin + fallback) {
                            e.currentTarget.src = fallback
                        }
                    }}
                />
            </div>
            <div className={styles.miniBody}>
                <span className={styles.miniVenue}>{cleanBarName(post.bar?.name)}</span>
                {dateLabel && <span className={styles.miniDate}>{dateLabel}</span>}
                <span className={styles.miniCaption}>{(post.caption || "").slice(0, 70)}…</span>
            </div>
        </Link>
    )
}

export default function EventDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState(null)
    const [allPosts, setAllPosts] = useState([])
    const [status, setStatus] = useState("loading")

    useEffect(() => {
        window.scrollTo(0, 0)
        async function load() {
            setStatus("loading")
            try {
                const [postRes, allRes] = await Promise.all([
                    fetch(`${API}/events/${id}`),
                    fetch(`${API}/events/all`),
                ])
                if (!postRes.ok) {
                    setStatus("notfound")
                    return
                }
                setPost(await postRes.json())
                setAllPosts(await allRes.json())
                setStatus("ok")
            } catch {
                setStatus("error")
            }
        }
        load()
    }, [id])

    if (status === "loading") {
        return <div className={styles.stateScreen}><span className={styles.spinner}>🪩</span></div>
    }
    if (status !== "ok") {
        return (
            <div className={styles.stateScreen}>
                <h2>{status === "notfound" ? "Настанот не постои" : "Серверот не е достапен"}</h2>
                <Link className={styles.backLink} to="/">← Назад кон настаните</Link>
            </div>
        )
    }

    const bar = post.bar || {}
    const displayName = cleanBarName(bar.name)
    const fallback = placeholderFor(post.postUrl)
    const dateLabel = formatEventDate(post.eventDate)
    const artists = post.artists || []
    const isInstagram = (post.postUrl || "").includes("instagram.com")
    const mapQuery = encodeURIComponent(bar.address || `${bar.name} Macedonia`)

    // Related events: same venue / same category (upcoming-ish ordering by date)
    const byDate = (a, b) => new Date(a.eventDate || 0) - new Date(b.eventDate || 0)
    const samePlace = allPosts
        .filter((p) => p.id !== post.id && p.bar?.name === bar.name)
        .sort(byDate)
        .slice(0, 6)
    const similar = allPosts
        .filter((p) =>
            p.id !== post.id &&
            p.bar?.name !== bar.name &&
            bar.category &&
            p.bar?.category === bar.category
        )
        .sort(byDate)
        .slice(0, 6)

    return (
        <div className={styles.page}>
            <header className={styles.topBar}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>← Назад</button>
                <Link to="/" className={styles.logo}>Шема 🪩</Link>
            </header>

            <div className={styles.hero}>
                <img
                    className={styles.heroImage}
                    src={post.imageUrl || fallback}
                    alt={displayName}
                    onError={(e) => {
                        if (e.currentTarget.src !== window.location.origin + fallback) {
                            e.currentTarget.src = fallback
                        }
                    }}
                />
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <div className={styles.heroChips}>
                        {bar.category && <span className={styles.categoryChip}>{bar.category}</span>}
                        {bar.city && <span className={styles.cityChip}>📍 {bar.city}</span>}
                    </div>
                    <h1 className={styles.title}>
                        {artists.length > 0 ? `${artists.map(a => a.name).join(", ")} во ${displayName}` : displayName}
                    </h1>
                    {dateLabel && <span className={styles.dateChip}>🗓 {dateLabel}</span>}
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.mainCol}>
                    {artists.length > 0 && (
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Настапуваат</h3>
                            <div className={styles.artistRow}>
                                {artists.map((a) => (
                                    <div key={a.id} className={styles.artistPill}>
                                        <span className={styles.artistName}>🎤 {a.name}</span>
                                        {a.role && <span className={styles.artistRole}>{a.role}</span>}
                                        {a.instagram && (
                                            <a className={styles.artistLink} href={a.instagram} target="_blank" rel="noreferrer">
                                                Instagram
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>За настанот</h3>
                        <p className={styles.caption}>{post.caption}</p>
                    </section>

                    {isInstagram && (
                        <a className={styles.sourceLink} href={post.postUrl} target="_blank" rel="noreferrer">
                            Оригинален пост на Instagram ↗
                        </a>
                    )}
                </div>

                <aside className={styles.sideCol}>
                    <section className={styles.sideCard}>
                        <h3 className={styles.sectionTitle}>Резервации</h3>
                        {bar.phone ? (
                            <>
                                <p className={styles.reserveText}>Резервирај место во {displayName}:</p>
                                <a className={styles.reserveButton} href={`tel:${bar.phone}`}>
                                    📞 {bar.phone}
                                </a>
                            </>
                        ) : (
                            <p className={styles.reserveText}>Нема број за резервации — провери го оригиналниот пост.</p>
                        )}
                    </section>

                    <section className={styles.sideCard}>
                        <h3 className={styles.sectionTitle}>Локација</h3>
                        {bar.address && <p className={styles.address}>📍 {bar.address}</p>}
                        <div className={styles.mapWrap}>
                            <iframe
                                title={`Мапа — ${displayName}`}
                                src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </section>
                </aside>
            </div>

            {samePlace.length > 0 && (
                <section className={styles.relatedSection}>
                    <h3 className={styles.relatedTitle}>Настани на исто место</h3>
                    <div className={styles.relatedRow}>
                        {samePlace.map((p) => <MiniEventCard key={p.id} post={p} />)}
                    </div>
                </section>
            )}

            {similar.length > 0 && (
                <section className={styles.relatedSection}>
                    <h3 className={styles.relatedTitle}>
                        Слични настани {bar.category && <span className={styles.categoryHint}>({bar.category})</span>}
                    </h3>
                    <div className={styles.relatedRow}>
                        {similar.map((p) => <MiniEventCard key={p.id} post={p} />)}
                    </div>
                </section>
            )}
        </div>
    )
}

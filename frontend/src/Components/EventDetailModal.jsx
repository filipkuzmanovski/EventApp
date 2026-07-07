import { useEffect } from "react"
import styles from "./EventDetailModal.module.css"
import { cleanBarName, placeholderFor, formatEventDate } from "../utils"

export default function EventDetailModal({ post, onClose }) {
    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    if (!post) return null

    const displayName = cleanBarName(post.bar?.name)
    const fallback = placeholderFor(post.postUrl)
    const dateLabel = formatEventDate(post.eventDate)
    const artists = post.artists || []
    const address = post.bar?.address
    const isInstagram = (post.postUrl || "").includes("instagram.com")
    const isManual = (post.postUrl || "").startsWith("manual://")
    // Map works even without a stored address — falls back to venue name
    const mapQuery = encodeURIComponent(address || `${post.bar?.name} Skopje Macedonia`)

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Затвори">✕</button>

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
                    <div className={styles.heroText}>
                        <h2 className={styles.venueName}>{displayName}</h2>
                        {dateLabel && <span className={styles.dateChip}>{dateLabel}</span>}
                    </div>
                </div>

                <div className={styles.body}>
                    {artists.length > 0 && (
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Настапуваат</h3>
                            <div className={styles.artistRow}>
                                {artists.map((a) => (
                                    <div key={a.id} className={styles.artistPill}>
                                        <span className={styles.artistName}>🎤 {a.name}</span>
                                        {a.role && <span className={styles.artistRole}>{a.role}</span>}
                                        {(a.instagram || a.kadevecerUrl) && (
                                            <a
                                                className={styles.artistLink}
                                                href={a.instagram || a.kadevecerUrl}
                                                target="_blank" rel="noreferrer"
                                            >
                                                {a.instagram ? "Instagram" : "Профил"}
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

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Локација</h3>
                        {address && <p className={styles.address}>📍 {address}</p>}
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

                    {!isManual && (
                        <a className={styles.sourceLink} href={post.postUrl} target="_blank" rel="noreferrer">
                            {isInstagram ? "Оригинален пост на Instagram ↗" : "Види на Каде вечер ↗"}
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

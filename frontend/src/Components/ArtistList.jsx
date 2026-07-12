import { useEffect, useState } from "react"
import styles from "./ArtistList.module.css"

const ARTISTS_URL = "http://localhost:8080/api/artists"

function ArtistCard({ artist, index }) {
    const [imgFailed, setImgFailed] = useState(false)
    const initial = (artist.name || "?").charAt(0).toUpperCase()

    const socials = [
        { label: "Instagram", url: artist.instagram },
        { label: "Facebook", url: artist.facebook },
        { label: "YouTube", url: artist.youtube },
    ].filter((s) => s.url)

    return (
        <div className={styles.artistCard} style={{ animationDelay: `${index * 0.06}s` }}>
            <div className={styles.avatarWrap}>
                {artist.imageUrl && !imgFailed ? (
                    <img
                        className={styles.avatar}
                        src={artist.imageUrl}
                        alt={artist.name}
                        loading="lazy"
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <div className={styles.avatarFallback}>{initial}</div>
                )}
            </div>

            <h3 className={styles.artistName}>{artist.name}</h3>
            {artist.role && <span className={styles.artistRole}>{artist.role}</span>}

            <div className={styles.socialRow}>
                {socials.map((s) => (
                    <a
                        key={s.label}
                        className={styles.socialLink}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {s.label}
                    </a>
                ))}
            </div>
        </div>
    )
}

export default function ArtistList() {
    const [artists, setArtists] = useState([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch(ARTISTS_URL)
                const data = await response.json()
                setArtists(data)
            } catch {
                setArtists([])
            } finally {
                setLoaded(true)
            }
        }
        load()
    }, [])

    if (loaded && artists.length === 0) {
        return (
            <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🎤</span>
                <h2>Нема артисти во моментов</h2>
                <p>Артистите се појавуваат тука штом има закажани настани.</p>
            </div>
        )
    }

    return (
        <div className={styles.artistGrid}>
            {artists.map((artist, index) => (
                <ArtistCard key={artist.id} artist={artist} index={index} />
            ))}
        </div>
    )
}

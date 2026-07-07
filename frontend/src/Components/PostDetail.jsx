import styles from "./PostDetail.module.css"
import { cleanBarName, placeholderFor, formatEventDate } from "../utils"

export default function PostDetail({ post, onDetails }){
    const displayName = cleanBarName(post.bar?.name);
    const fallback = placeholderFor(post.postUrl);
    const imageSrc = post.imageUrl || fallback;
    const dateLabel = formatEventDate(post.eventDate);
    const artistNames = (post.artists || []).map((a) => a.name).join(", ");

    return (
        <div className={styles.postCard}>
            <div className={styles.imageContainer}>
                <img
                    className={styles.cardImage}
                    src={imageSrc}
                    alt={displayName}
                    loading="lazy"
                    onError={(e) => {
                        // Expired/broken image links — quietly swap to a placeholder
                        if (e.currentTarget.src !== window.location.origin + fallback) {
                            e.currentTarget.src = fallback;
                        }
                    }}
                ></img>
                <div className={styles.imageOverlay}></div>
                <span className={styles.barChip}>{displayName}</span>
                {dateLabel && <span className={styles.dateChip}>{dateLabel}</span>}
            </div>
            {artistNames && (
                <div className={styles.artistLine}>🎤 {artistNames}</div>
            )}
            <div className={styles.cardBody}>
                <p>{post.caption}</p>
            </div>
            <div className={styles.cardFooter}>
                <p className={styles.ctaText}>Сакате да дознаете повеќе?</p>
                <button className={styles.instagramLink} onClick={() => onDetails(post)}>
                    Повеќе детали
                </button>
            </div>
        </div>
    )
}

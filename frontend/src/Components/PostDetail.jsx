import { useState } from "react"
import { Link } from "react-router-dom"
import styles from "./PostDetail.module.css"
import ConfirmModal from "./ConfirmModal"
import { cleanBarName, placeholderFor, formatEventDate } from "../utils"

export default function PostDetail({ post, adminToken, onDeleted }){
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const displayName = cleanBarName(post.bar?.name);
    const fallback = placeholderFor(post.postUrl);
    const imageSrc = post.imageUrl || fallback;
    const dateLabel = formatEventDate(post.eventDate);
    const artistNames = (post.artists || []).map((a) => a.name).join(", ");

    async function handleDelete() {
        setDeleting(true);
        try {
            const response = await fetch(`http://localhost:8080/api/admin/events/${post.id}`, {
                method: "DELETE",
                headers: { "X-Admin-Token": adminToken },
            });
            if (response.ok) {
                setConfirmOpen(false);
                onDeleted();
            } else {
                alert(`Бришењето не успеа (${response.status}).`);
            }
        } catch {
            alert("Серверот не е достапен.");
        } finally {
            setDeleting(false);
        }
    }

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
                {adminToken && (
                    <button
                        className={styles.deleteButton}
                        onClick={() => setConfirmOpen(true)}
                        title="Избриши настан (админ)"
                        aria-label="Избриши настан"
                    >
                        🗑
                    </button>
                )}
            </div>
            {artistNames && (
                <div className={styles.artistLine}>🎤 {artistNames}</div>
            )}
            <div className={styles.cardBody}>
                <p>{post.caption}</p>
            </div>
            <div className={styles.cardFooter}>
                <p className={styles.ctaText}>Сакате да дознаете повеќе?</p>
                <Link className={styles.instagramLink} to={`/event/${post.id}`}>
                    Повеќе детали
                </Link>
            </div>

            {confirmOpen && (
                <ConfirmModal
                    icon="🗑"
                    danger
                    title="Избриши настан?"
                    message={`Настанот во ${displayName} ќе биде трајно избришан. Оваа акција не може да се врати.`}
                    confirmLabel={deleting ? "Се брише..." : "Избриши"}
                    cancelLabel="Откажи"
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmOpen(false)}
                />
            )}
        </div>
    )
}

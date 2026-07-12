import { useEffect, useState } from "react";
import PostDetail from "./PostDetail";
import FilterBar from "./FilterBar";
import { cleanBarName } from "../utils";
import styles from "./PostList.module.css"

const POSTS_PER_PAGE = 8;

function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, days) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy;
}

// Returns [start, end) for a date-filter key, or null for "any"
function getDateRange(key) {
    const now = new Date();
    const today = startOfDay(now);
    // Monday of the current week (Mon-based week)
    const monday = addDays(today, -((now.getDay() + 6) % 7));
    const nextMonday = addDays(monday, 7);

    switch (key) {
        case "today":    return [today, addDays(today, 1)];
        case "thisWeek": return [today, nextMonday];
        case "weekend":  return [addDays(monday, 4), nextMonday]; // Fri 00:00 → Sun end
        case "nextWeek": return [nextMonday, addDays(nextMonday, 7)];
        default:         return null;
    }
}

function matchesDate(post, range) {
    if (!range) return true;
    if (!post.eventDate) return false; // undated posts only appear under "Било кога"
    const date = new Date(post.eventDate);
    return !isNaN(date) && date >= range[0] && date < range[1];
}

export default function PostList(props){
    const { posts, selectedBar, onClearBar, adminToken, onPostsChanged } = props;
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState("any");

    // Whenever the list or a filter changes, jump back to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [posts, dateRange, selectedBar]);

    const range = getDateRange(dateRange);
    let filtered = posts.filter(
        (post) =>
            matchesDate(post, range) &&
            (!selectedBar || post.bar?.name === selectedBar)
    );
    // With an active date filter, soonest events first
    if (range) {
        filtered = [...filtered].sort(
            (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
        );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const visiblePosts = filtered.slice(startIndex, startIndex + POSTS_PER_PAGE);

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (posts.length === 0) {
        return (
            <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🪩</span>
                <h2>Нема настани во моментов</h2>
                <p>Провери повторно наскоро — шемата секогаш се враќа.</p>
            </div>
        );
    }

    return (
       <>
         <FilterBar dateRange={dateRange} setDateRange={setDateRange} />

         {selectedBar && (
            <div className={styles.selectedBarRow}>
                <button className={styles.selectedBarChip} onClick={onClearBar}>
                    📍 {cleanBarName(selectedBar)} <span className={styles.chipX}>✕</span>
                </button>
            </div>
         )}

         {filtered.length === 0 ? (
            <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🔍</span>
                <h2>Нема настани за овој филтер</h2>
                <p>Пробај друг период или клуб.</p>
            </div>
         ) : (
         <div className={styles.postGrid}>
           {visiblePosts.map((post, index)=>(
              <div
                key={post.id}
                className={styles.cardWrapper}
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <PostDetail post={post} adminToken={adminToken} onDeleted={onPostsChanged}></PostDetail>
              </div>
           ))}
         </div>
         )}

         {totalPages > 1 && (
           <div className={styles.pagination}>
             <button
               className={styles.pageButton}
               onClick={() => goToPage(Math.max(1, currentPage - 1))}
               disabled={currentPage === 1}
             >
               ← Претходна
             </button>

             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
               <button
                 key={page}
                 className={`${styles.pageButton} ${page === currentPage ? styles.activePage : ""}`}
                 onClick={() => goToPage(page)}
               >
                 {page}
               </button>
             ))}

             <button
               className={styles.pageButton}
               onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
               disabled={currentPage === totalPages}
             >
               Следна →
             </button>
           </div>
         )}
       </>
    )
}

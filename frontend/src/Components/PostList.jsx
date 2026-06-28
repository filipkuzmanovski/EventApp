import { useEffect, useState } from "react";
import PostDetail from "./PostDetail";
import styles from "./PostList.module.css"

const POSTS_PER_PAGE = 8;

export default function PostList(props){
    const posts = props.posts;
    const [currentPage, setCurrentPage] = useState(1);

    // Whenever the list changes (e.g. a new search), jump back to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [posts]);

    const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const visiblePosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    return (
       <>
         <div className={styles.postGrid}>
           {visiblePosts.map((post)=>(
              <PostDetail key={post.id} post_url={post.postUrl} caption={post.caption} bar_name={post.bar.name}></PostDetail>
           ))}
         </div>

         {totalPages > 1 && (
           <div className={styles.pagination}>
             <button
               className={styles.pageButton}
               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
               disabled={currentPage === 1}
             >
               ← Претходна
             </button>

             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
               <button
                 key={page}
                 className={`${styles.pageButton} ${page === currentPage ? styles.activePage : ""}`}
                 onClick={() => setCurrentPage(page)}
               >
                 {page}
               </button>
             ))}

             <button
               className={styles.pageButton}
               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages}
             >
               Следна →
             </button>
           </div>
         )}
       </>
    )
}

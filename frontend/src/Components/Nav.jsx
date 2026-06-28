import styles from "./Nav.module.css"
import SearchBar from "./SearchBar"

export default function Nav(props){
    return (
        <nav className={styles.navbarContainer}> {/* New wrapper */}
            <div className={styles.logoGroup}> {/* Grouping the text */}
                <span className={styles.subtitle}>Не знаеш каде?</span>
                <h1 className={styles.mainTitle}>
                    <span className={styles.accent}>Шема</span> е тука за тебе 🪩
                </h1>
            </div>

            <div className={styles.searchGroup}>
                <SearchBar setPosts={props.setPosts}/>
            </div>
        </nav>
    )
}
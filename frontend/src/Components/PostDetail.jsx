import styles from "./PostDetail.module.css"
export  default function PostDetail(props){
    return (
        <div className={styles.postCard}>
            <div className={styles.imageContainer}>
                <img className={styles.cardImage} src={`/images/${props.bar_name}.jpg`} alt={props.bar_name}></img>
            </div>
             <div className={styles.header}>
                <h3>{props.bar_name}</h3>
            </div>
            <div className={styles.cardBody}>
                <p>{props.caption}</p>
            </div>
            <div>
                <p className={styles.ctaText}>Сакате да дознаете повеќе?</p><br/>
                <a className={styles.instagramLink} href={props.post_url} target="_blank">
                    Притиснете овде
                </a>
            </div>
        </div>
    )
}
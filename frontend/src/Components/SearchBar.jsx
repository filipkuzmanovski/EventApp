import { useEffect, useState } from "react"
import styles from "./SearchBar.module.css"

const BACKEND_URL="http://localhost:8080/api/events/barName"
const BACKEND_URL_ALL="http://localhost:8080/api/events/all";
export default function SearchBar(props){
    const [barName,setBarName]=useState("");
    const setPosts=props.setPosts;
    const refreshKey=props.refreshKey;
      useEffect(()=>{
        async function search() {
            try {
                if(barName==""){
                    const response = await fetch(`${BACKEND_URL_ALL}`)
                    const data=await response.json();
                    setPosts(data)
                }else{
                    const response=await fetch(`${BACKEND_URL}?barName=${barName}`)
                    const data=await response.json();
                    setPosts(data)
                }
            } catch {
                // Backend unreachable — keep the UI alive with an empty list
                setPosts([])
            }
        }
        search()
      },[barName, refreshKey])
    return (
         <div className={styles.searchBar}>
            <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            <input
                className={styles.input}
                type="text"
                placeholder="Побарајте даден клуб"
                value={barName}
                onChange={(event)=>setBarName(event.target.value)}
            />
        </div>
    )
}

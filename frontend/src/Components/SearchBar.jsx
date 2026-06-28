import { useEffect, useState } from "react"
import styles from "./SearchBar.module.css"

const BACKEND_URL="http://localhost:8080/api/events/barName"
const BACKEND_URL_ALL="http://localhost:8080/api/events/all";
export default function SearchBar(props){
    const [barName,setBarName]=useState("");
    const setPosts=props.setPosts;
    console.log(barName)
      useEffect(()=>{
        async function search() {
            if(barName==""){
            const response = await fetch(`${BACKEND_URL_ALL}`)
            const data=await response.json();
            console.log("Data from backend recieved:",data)
            setPosts(data)
            }else{
                const response=await fetch(`${BACKEND_URL}?barName=${barName}`)
                const data=await response.json();
                console.log("Data recieved from barName repo: ",data)
                setPosts(data)
            }
        }
        search()
      },[barName])
    return (
         <div className={styles.searchBar}>
            <input className={styles.input} type="text" placeholder="Побарајте даден клуб" value={barName} onChange={(event)=>setBarName(event.target.value)}>
                
            </input>
        </div>
    )
}
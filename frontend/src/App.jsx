import { useState } from 'react'
import './App.css'
import PostList from './Components/PostList'
import Nav from './Components/Nav';
import Footer from './Components/Footer';

function App() {
  const [posts,setPosts]=useState([])
  return (
    <>
    <Nav setPosts={setPosts}/>
    <PostList posts={posts}></PostList>
    <Footer/>
    </>
  )
}

export default App

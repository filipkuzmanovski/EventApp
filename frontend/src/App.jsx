import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import PostList from './Components/PostList'
import ArtistList from './Components/ArtistList'
import Analytics from './Components/Analytics'
import AddEventModal from './Components/AddEventModal'
import EventDetailPage from './Components/EventDetailPage'
import AuthPage from './Components/AuthPage'
import Nav from './Components/Nav';
import Footer from './Components/Footer';
import SplashScreen from './Components/SplashScreen';

function Home({ setPosts, posts, view, setView, selectedBar, setSelectedBar, user, onLogout, onAddEvent, onPostsChanged, refreshKey }) {
  const [splashFading, setSplashFading] = useState(false)
  const [splashGone, setSplashGone] = useState(false)
  const isAdmin = user?.role === "ADMIN"

  useEffect(() => {
    // Show the splash ~1.8s, fade it out over 0.6s, then remove it
    const fadeTimer = setTimeout(() => setSplashFading(true), 1800)
    const goneTimer = setTimeout(() => setSplashGone(true), 2400)
    return () => { clearTimeout(fadeTimer); clearTimeout(goneTimer) }
  }, [])

  return (
    <>
      {!splashGone && <SplashScreen fading={splashFading}/>}
      <Nav
        setPosts={setPosts}
        view={view} setView={setView}
        isAdmin={isAdmin}
        user={user}
        onLogout={onLogout}
        onAddEvent={onAddEvent}
        refreshKey={refreshKey}
      />
      <main className="mainContent">
        {view === "events" && (
          <PostList
            posts={posts}
            selectedBar={selectedBar}
            onClearBar={() => setSelectedBar(null)}
            adminToken={isAdmin ? user.adminToken : null}
            onPostsChanged={onPostsChanged}
          />
        )}
        {view === "artists" && <ArtistList/>}
        {view === "analytics" && (
          <Analytics onSelectBar={(barName) => { setSelectedBar(barName); setView("events") }}/>
        )}
      </main>
    </>
  )
}

function App() {
  const [posts,setPosts]=useState([])
  const [view, setView] = useState("events")
  const [selectedBar, setSelectedBar] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shemaUser")) || null
    } catch {
      return null
    }
  })

  const handleAuth = (userData) => {
    setUser(userData)
    localStorage.setItem("shemaUser", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("shemaUser")
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <Home
              posts={posts} setPosts={setPosts}
              view={view} setView={setView}
              selectedBar={selectedBar} setSelectedBar={setSelectedBar}
              user={user}
              onLogout={handleLogout}
              onAddEvent={() => setShowAddModal(true)}
              onPostsChanged={() => setRefreshKey((k) => k + 1)}
              refreshKey={refreshKey}
            />
            <Footer/>
          </>
        }/>
        <Route path="/event/:id" element={<><EventDetailPage/><Footer/></>}/>
        <Route path="/login" element={<AuthPage mode="login" onAuth={handleAuth}/>}/>
        <Route path="/register" element={<AuthPage mode="register" onAuth={handleAuth}/>}/>
      </Routes>
      {showAddModal && user?.role === "ADMIN" && (
        <AddEventModal
          adminToken={user.adminToken}
          onClose={() => setShowAddModal(false)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </BrowserRouter>
  )
}

export default App

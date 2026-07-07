import { useEffect, useState } from 'react'
import './App.css'
import PostList from './Components/PostList'
import ArtistList from './Components/ArtistList'
import Analytics from './Components/Analytics'
import AddEventModal from './Components/AddEventModal'
import Nav from './Components/Nav';
import Footer from './Components/Footer';
import SplashScreen from './Components/SplashScreen';

function App() {
  const [posts,setPosts]=useState([])
  const [view, setView] = useState("events")
  const [selectedBar, setSelectedBar] = useState(null)
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken") || "")
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [splashFading, setSplashFading] = useState(false)
  const [splashGone, setSplashGone] = useState(false)

  useEffect(() => {
    // Show the splash ~1.8s, fade it out over 0.6s, then remove it
    const fadeTimer = setTimeout(() => setSplashFading(true), 1800)
    const goneTimer = setTimeout(() => setSplashGone(true), 2400)
    return () => { clearTimeout(fadeTimer); clearTimeout(goneTimer) }
  }, [])

  const updateAdminToken = (token) => {
    setAdminToken(token)
    if (token) localStorage.setItem("adminToken", token)
    else localStorage.removeItem("adminToken")
  }

  // From the analytics dashboard: jump to events filtered to that club
  const selectBarFromAnalytics = (barName) => {
    setSelectedBar(barName)
    setView("events")
  }

  return (
    <>
    {!splashGone && <SplashScreen fading={splashFading}/>}
    <Nav
      setPosts={setPosts}
      view={view} setView={setView}
      isAdmin={!!adminToken}
      onAddEvent={() => setShowAddModal(true)}
      refreshKey={refreshKey}
    />
    <main className="mainContent">
      {view === "events" && (
        <PostList
          posts={posts}
          selectedBar={selectedBar}
          onClearBar={() => setSelectedBar(null)}
        />
      )}
      {view === "artists" && <ArtistList/>}
      {view === "analytics" && <Analytics onSelectBar={selectBarFromAnalytics}/>}
    </main>
    <Footer adminToken={adminToken} setAdminToken={updateAdminToken}/>
    {showAddModal && (
      <AddEventModal
        adminToken={adminToken}
        onClose={() => setShowAddModal(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    )}
    </>
  )
}

export default App

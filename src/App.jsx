import React, { useState } from 'react'
import ViewProfileSelector from './components/ViewProfileSelector'
import KanbanBoard from './components/KanbanBoard'
import './index.css'

function App() {
  const [profile, setProfile] = useState(null) // null, 'standard', 'accessible'

  const handleSelectProfile = (selectedProfile) => {
    setProfile(selectedProfile)
    document.documentElement.setAttribute('data-profile', selectedProfile)
  }

  return (
    <div className="app-container">
      {!profile ? (
        <ViewProfileSelector onSelectProfile={handleSelectProfile} />
      ) : (
        <KanbanBoard onChangeProfile={() => setProfile(null)} />
      )}
    </div>
  )
}

export default App

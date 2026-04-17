import React, { useState } from 'react'
import ViewProfileSelector from './components/ViewProfileSelector'
import KanbanBoard from './components/KanbanBoard'
import './index.css'

function App() {
  const [user, setUser] = useState(null) // null, 'Marco', 'Naxhito', 'Nena'

  const handleSelectUser = (selectedUser) => {
    setUser(selectedUser)
    document.documentElement.setAttribute('data-profile', selectedUser)
  }

  return (
    <div className="app-container">
      {!user ? (
        <ViewProfileSelector onSelectProfile={handleSelectUser} />
      ) : (
        <KanbanBoard currentUser={user} onChangeProfile={() => {
          setUser(null);
          document.documentElement.removeAttribute('data-profile');
        }} />
      )}
    </div>
  )
}

export default App

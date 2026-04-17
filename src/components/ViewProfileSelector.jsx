import React from 'react';
import { User } from 'lucide-react';
import './ViewProfileSelector.css';

export default function ViewProfileSelector({ onSelectProfile }) {
  const users = [
    { name: 'Marco', desc: 'Vista Estándar', className: '' },
    { name: 'Naxhito', desc: 'Vista Estándar', className: '' },
    { name: 'Nena', desc: 'Vista Accesible (Textos grandes)', className: 'accessible' }
  ];

  return (
    <div className="profile-selector-overlay">
      <div className="glass-panel profile-selector-container">
        <h1>Kasa-ban</h1>
        <p>¿Quién va a usar el tablero?</p>
        
        <div className="profile-cards">
          {users.map(u => (
            <button key={u.name} className={`profile-card ${u.className}`} onClick={() => onSelectProfile(u.name)}>
              <div className="profile-icon">
                <User size={48} />
              </div>
              <h2>{u.name}</h2>
              <p>{u.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Eye, Glasses } from 'lucide-react';
import './ViewProfileSelector.css';

export default function ViewProfileSelector({ onSelectProfile }) {
  return (
    <div className="profile-selector-overlay">
      <div className="glass-panel profile-selector-container">
        <h1>Kasa-ban</h1>
        <p>Selecciona tu perfil de vista para continuar / Select your view profile</p>
        
        <div className="profile-cards">
          <button className="profile-card" onClick={() => onSelectProfile('standard')}>
            <div className="profile-icon">
              <Eye size={48} />
            </div>
            <h2>Estándar</h2>
            <p>Vista normal y estilizada</p>
          </button>
          
          <button className="profile-card accessible" onClick={() => onSelectProfile('accessible')}>
            <div className="profile-icon">
              <Glasses size={48} />
            </div>
            <h2>Accesible</h2>
            <p>Textos grandes y mayor contraste</p>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoginComponent from './components/LoginComponent.jsx';
import SearchComponent from './components/SearchComponent.jsx';
import LibraryComponent from './components/LibraryComponent.jsx';
import UserDashboard from './components/UserDashboard.jsx'; // 1. Importamos o Dashboard!
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('search'); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  if (!user) return <LoginComponent onLogin={setUser} />;

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>MediaDiet</h1>

      <Toaster 
  position="bottom-center"
  toastOptions={{
    style: {
      background: 'var(--card-bg)',
      color: 'var(--text-main)',
      border: '1px solid var(--lb-green)',
    },
    success: {
      iconTheme: {
        primary: 'var(--lb-green)',
        secondary: 'var(--card-bg)',
      },
    },
  }}
/>

      <div className="navbar">
        <button className="nav-button" onClick={() => setView('search')}>Buscar</button>
        <button className="nav-button" onClick={() => setView('library')}>Biblioteca</button>
        
        {/* 2. Adicionamos o botão do Perfil/Estatísticas */}
        <button className="nav-button" onClick={() => setView('dashboard')}>Estatísticas</button>
        
        <button className="nav-button" onClick={handleSignOut}>Sair</button>
      </div>

      {/* 3. Lógica para mostrar a tela certa */}
      {view === 'search' && <SearchComponent />}
      {view === 'library' && <LibraryComponent />}
      {view === 'dashboard' && <UserDashboard />}
    </div>
  );
}
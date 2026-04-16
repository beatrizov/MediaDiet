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


  return (
    <>
      {/* 1. O Toaster fica aqui no topo, livre de condicionais, garantindo que ele exista em todas as telas */}
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

      {/* 2. Lógica de exibição: Se NÃO tiver usuário logado, mostra SÓ o Login */}
      {!user ? (
        <LoginComponent onLogin={setUser} />
      ) : (
        <div>
          <h1 style={{ textAlign: 'center', margin: '20px 0' }}>MediaDiet</h1>
          
          <div className="navbar">
            <button className="nav-button" onClick={() => setView('search')}>Buscar</button>
            <button className="nav-button" onClick={() => setView('library')}>Biblioteca</button>
            <button className="nav-button" onClick={() => setView('dashboard')}>Estatísticas</button>
            <button className="nav-button" onClick={handleSignOut}>Sair</button>
          </div>

          {/* Renderização das Views (mantenha o código que você já tem aqui) */}
          {view === 'search' && <SearchComponent />}
          {view === 'library' && <LibraryComponent />}
          {view === 'dashboard' && <UserDashboard />}
        </div>
      )}
    </>
  );
}
import React, { useEffect, useState } from 'react';
import { useMediaLog } from '../hooks/useMediaLog';
import DetailsModal from './DetailsModal.jsx';
import "../App.css";
import Loading from './Loading.jsx'; 

export default function LibraryComponent() {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ESTADOS DOS FILTROS E ORDENAÇÃO
  const [sortBy, setSortBy] = useState('recent');
  const [selectedDecade, setSelectedDecade] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const { getUserLogs, updateMedia, deleteMedia } = useMediaLog();

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getUserLogs();
      setLogs(data);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (id, rating, review, status) => {
    await updateMedia(id, rating, review, status);
    fetchLogs();
  };

  const handleDeleteItem = async (id) => {
    await deleteMedia(id);
    fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleOpenDetails = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  // 1. EXTRAÇÃO INTELIGENTE: Pega anos e gêneros únicos do banco
  const getYear = (dateString) => {
    if (!dateString) return null;
    const match = String(dateString).match(/^(\d{4})/); // Tenta achar 4 números seguidos
    return match ? parseInt(match[1], 10) : null;
  };

  // Gera lista única de gêneros (em ordem alfabética)
  const availableGenres = Array.from(new Set(
    logs.filter(log => activeTab === 'all' || log.mediaType === activeTab) 
        .flatMap(log => log.genres || [])
  )).sort();

  // Gera lista única de décadas (da mais nova para a mais antiga)
  const availableDecades = Array.from(new Set(
    logs.filter(log => activeTab === 'all' || log.mediaType === activeTab)
        .map(log => {
          const year = getYear(log.releaseDate);
          if (!year) return null;
          return Math.floor(year / 10) * 10; 
        }).filter(Boolean)
  )).sort((a, b) => b - a);

  // Quando trocar de aba, reseta os filtros para não dar resultados vazios sem querer
  useEffect(() => {
    setSelectedDecade('all');
    setSelectedGenre('all');
  }, [activeTab]);

  // 2. APLICAÇÃO DOS FILTROS (Aba + Gênero + Década)
  const filteredLogs = logs.filter(log => {
    // Filtro de Aba
    if (activeTab !== 'all' && log.mediaType !== activeTab) return false;

    // Filtro de Gênero
    if (selectedGenre !== 'all') {
      if (!log.genres || !log.genres.includes(selectedGenre)) return false;
    }

    // Filtro de Década
    if (selectedDecade !== 'all') {
      const year = getYear(log.releaseDate);
      if (!year) return false; 
      const decade = Math.floor(year / 10) * 10;
      if (decade !== parseInt(selectedDecade, 10)) return false;
    }

    return true;
  });

  // Função auxiliar para ordenar por data do Firebase
  const getTime = (dateField) => {
    if (!dateField) return 0;
    if (dateField.toDate) return dateField.toDate().getTime();
    if (dateField.seconds) return dateField.seconds * 1000;
    return new Date(dateField).getTime() || 0;
  };

  // 3. ORDENAÇÃO FINA
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortBy === 'recent') return getTime(b.createdAt) - getTime(a.createdAt);
    if (sortBy === 'oldest') return getTime(a.createdAt) - getTime(b.createdAt);
    if (sortBy === 'rating_high') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'rating_low') return (a.rating || 0) - (b.rating || 0);
    if (sortBy === 'title') {
      const titleA = a.titleSnapshot || '';
      const titleB = b.titleSnapshot || '';
      return titleA.localeCompare(titleB);
    }
    return 0;
  });

  // ESTILOS REUTILIZÁVEIS
  const tabStyle = (tabName) => ({
    padding: '5px 10px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: activeTab === tabName ? '#ffffff' : '#8bc',
    border: 'none',
    borderBottom: activeTab === tabName ? '2px solid #00e054' : '2px solid transparent',
    borderRadius: '0',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '12px',
    letterSpacing: '1px',
    transition: 'color 0.2s'
  });

  return (
    <div>
      <h2>Minha Biblioteca</h2>
      
      {/* HEADER DA BIBLIOTECA: Estilo Letterboxd */}
      <div className="library-header">
        
        {/* Menu de Abas */}
        <div className="tabs-container">
          <button style={tabStyle('all')} onClick={() => setActiveTab('all')}>Todos</button>
          <button style={tabStyle('movie')} onClick={() => setActiveTab('movie')}>Filmes</button>
          <button style={tabStyle('tv')} onClick={() => setActiveTab('tv')}>Séries</button>
          <button style={tabStyle('book')} onClick={() => setActiveTab('book')}>Livros</button>
        </div>

        {/* Filtros e Ordenação */}
        <div className="filters-container">
          
          {/* Filtro de Década */}
          <div className="filter-item">
            <span className="filter-label">Década</span>
            <select value={selectedDecade} onChange={(e) => setSelectedDecade(e.target.value)} className="letterboxd-select">
              <option value="all">Todas</option>
              {availableDecades.map(decade => (
                <option key={decade} value={decade}>{decade}s</option>
              ))}
            </select>
          </div>

          {/* Filtro de Gênero */}
          <div className="filter-item">
            <span className="filter-label">Gênero</span>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="letterboxd-select">
              <option value="all">Todos</option>
              {availableGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div className="filter-item">
            <span className="filter-label">Ordenar por</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="letterboxd-select">
              <option value="recent">Quando Adicionado</option>
              <option value="rating_high">Maior Nota</option>
              <option value="rating_low">Menor Nota</option>
              <option value="title">Título</option>
              <option value="oldest">Mais Antigo</option>
            </select>
          </div>

        </div>
      </div>

      {/* RENDERIZAÇÃO DOS CARDS */}
      {isLoading ? (
        <Loading />
      ) : sortedLogs.length > 0 ? (
        <div className="grid-container">
          {sortedLogs.map((item) => (
            <div 
              key={item.id} 
              className="media-card" 
              onClick={() => handleOpenDetails(item)}
              style={{ cursor: 'pointer' }}
            >
              {item.imageSnapshot ? (
                <img src={item.imageSnapshot} alt={item.titleSnapshot} />
              ) : (
                <div className="no-image-placeholder">Sem Capa</div>
              )}
              
              <div className="media-info">
                <h4 className="media-title" title={item.titleSnapshot}>
                  {item.titleSnapshot}
                </h4>
                <div style={{ color: '#00e054', fontSize: '14px' }}>
                  {"★".repeat(item.rating || 0)}{"☆".repeat(5 - (item.rating || 0))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'gray', marginTop: '50px' }}>
          <p>Nenhum item encontrado com esses filtros.</p>
        </div>
      )}

      <DetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        item={selectedItem}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem} 
      />
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useMediaLog } from '../hooks/useMediaLog';
import DetailsModal from './DetailsModal.jsx';
import "../App.css";

export default function LibraryComponent() {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { getUserLogs, updateMedia, deleteMedia } = useMediaLog();

  const fetchLogs = async () => {
    const data = await getUserLogs();
    setLogs(data);
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

  const filteredLogs = activeTab === 'all' 
    ? logs 
    : logs.filter(log => log.mediaType === activeTab);

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
      
      {/* Menu de Abas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button style={tabStyle('all')} onClick={() => setActiveTab('all')}>Todos</button>
        <button style={tabStyle('movie')} onClick={() => setActiveTab('movie')}>Filmes</button>
        <button style={tabStyle('tv')} onClick={() => setActiveTab('tv')}>Séries</button>
        <button style={tabStyle('book')} onClick={() => setActiveTab('book')}>Livros</button>
      </div>

      {/* Grid de Mídias */}
      <div className="grid-container">
        {filteredLogs.map((item) => (
          <div 
            key={item.id} 
            className="media-card" 
            onClick={() => handleOpenDetails(item)}
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
import React, { useState, useEffect } from 'react';

export default function DetailsModal({ isOpen, onClose, item, onUpdate, onDelete }) {
  const [editRating, setEditRating] = useState(0);
  const [editReview, setEditReview] = useState('');
  const [editStatus, setEditStatus] = useState('plan_to_watch');
  
  // NOVOS ESTADOS: Para gerenciar a sinopse
  const [synopsis, setSynopsis] = useState('');
  const [loadingSynopsis, setLoadingSynopsis] = useState(false);

  // Sincroniza os estados internos sempre que um novo filme/livro for aberto
  useEffect(() => {
    if (item) {
      setEditRating(item.rating || 0);
      setEditReview(item.review || '');
      setEditStatus(item.status || 'plan_to_watch');

      // NOVA LÓGICA: Busca a sinopse silenciosamente no fundo
      const fetchSynopsis = async () => {
        setLoadingSynopsis(true);
        try {
          // Usa apiId se vier do Firebase, ou id se vier direto da busca
          const mediaId = item.apiId || item.externalId || item.id; 
          const mediaType = item.type || item.mediaType || 'movie';

          if (mediaType === 'book') {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${mediaId}?key=${import.meta.env.VITE_GOOGLE_KEY}`);
            const data = await res.json();
            setSynopsis(data.volumeInfo?.description?.replace(/<[^>]+>/g, '') || 'Sinopse não disponível para este livro.');
          } else {
            const res = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${import.meta.env.VITE_TMDB_KEY}&language=pt-BR`);
            const data = await res.json();
            setSynopsis(data.overview || 'Sinopse não disponível.');
          }
        } catch (error) {
          setSynopsis('Erro ao carregar a sinopse da internet.');
        } finally {
          setLoadingSynopsis(false);
        }
      };

      fetchSynopsis();
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onUpdate(item.id, editRating, editReview, editStatus);
    onClose(); 
  };

  const handleDelete = () => {
    // Usa titleSnapshot se vier do Firebase, ou title/name se vier da busca
    const displayTitle = item.titleSnapshot || item.title || item.name;
    if (window.confirm(`Tem certeza que deseja remover "${displayTitle}"?`)) {
      onDelete(item.id);
      onClose();
    }
  };

  const displayTitle = item.titleSnapshot || item.title || item.name;
  const displayImage = item.imageSnapshot || item.image || item.poster_path; // Ajuste para exibir a capa independente de onde vier

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#242424', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '95%', border: '1px solid #444', color: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{displayTitle}</h3>
        
        {/* NOVA CAIXA: Exibição da Sinopse com scroll */}
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '4px', border: '1px solid #333' }}>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--lb-green)' }}>Sinopse</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#ccc', maxHeight: '80px', overflowY: 'auto', textAlign: 'justify', lineHeight: '1.4' }}>
            {loadingSynopsis ? 'Buscando sinopse na base de dados...' : synopsis}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {displayImage ? (
            <img 
              src={displayImage.startsWith('http') ? displayImage : `https://image.tmdb.org/t/p/w200${displayImage}`} 
              style={{ width: '120px', height: '180px', objectFit: 'cover', borderRadius: '4px' }} 
              alt="Capa" 
            />
          ) : (
            <div style={{ width: '120px', height: '180px', backgroundColor: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'gray' }}>Sem Capa</div>
          )}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'gray' }}>Status:</label>
              <select 
                value={editStatus} 
                onChange={e => setEditStatus(e.target.value)} 
                style={{ width: '100%', padding: '8px', backgroundColor: '#333', color: 'white', border: '1px solid #555' }}
              >
                <option value="plan_to_watch">Quero ver/ler</option>
                <option value="completed">Concluído</option>
                <option value="dropped">Abandonei</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'gray' }}>Sua Nota:</label>
              <div style={{ fontSize: '24px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    onClick={() => setEditRating(star)} 
                    style={{ cursor: 'pointer', color: star <= editRating ? '#00e054' : 'gray' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Sua Resenha (até 1000 caracteres):</label>
          <textarea 
            value={editReview} 
            onChange={e => setEditReview(e.target.value)}
            maxLength={1000}
            rows={5}
            style={{ width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', resize: 'none', boxSizing: 'border-box' }}
            placeholder="O que você achou?"
          />
          <div style={{ textAlign: 'right', fontSize: '12px', color: 'gray', marginTop: '5px' }}>
            {editReview.length}/1000
          </div>
        </div>

        {/* RODAPÉ ATUALIZADO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
          
          {/* Só exibe o botão de remover se a função onDelete for passada (ou seja, se estiver na aba biblioteca) */}
          {onDelete ? (
            <button 
              onClick={handleDelete} 
              style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '4px' }}
            >
              Remover da Biblioteca
            </button>
          ) : <div></div>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: 'transparent', color: 'white', border: '1px solid #555' }}>
              Cancelar
            </button>
            <button onClick={handleSave} style={{ padding: '8px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';

export default function DetailsModal({ isOpen, onClose, item, onUpdate, onDelete }) {
  const [editRating, setEditRating] = useState(0);
  const [editReview, setEditReview] = useState('');
  const [editStatus, setEditStatus] = useState('plan_to_watch');

  // Sincroniza os estados internos sempre que um novo filme/livro for aberto
  useEffect(() => {
    if (item) {
      setEditRating(item.rating || 0);
      setEditReview(item.review || '');
      setEditStatus(item.status || 'plan_to_watch');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onUpdate(item.id, editRating, editReview, editStatus);
    onClose(); 
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja remover "${item.titleSnapshot}"?`)) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#242424', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '95%', border: '1px solid #444', color: 'white' }}>
        
        <h3 style={{ marginTop: 0 }}>Editando: {item.titleSnapshot}</h3>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {item.imageSnapshot && (
            <img src={item.imageSnapshot} style={{ width: '120px', borderRadius: '4px' }} alt="Capa" />
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
                    style={{ cursor: 'pointer', color: star <= editRating ? 'gold' : 'gray' }}
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
            rows={6}
            style={{ width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', resize: 'none', boxSizing: 'border-box' }}
            placeholder="O que você achou?"
          />
          <div style={{ textAlign: 'right', fontSize: '12px', color: 'gray', marginTop: '5px' }}>
            {editReview.length}/1000
          </div>
        </div>

        {/* RODAPÉ ATUALIZADO COM BOTÃO DE REMOVER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
          
          <button 
            onClick={handleDelete} 
            style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '4px' }}
          >
            Remover da Biblioteca
          </button>

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
import React, { useState } from 'react';

export default function ReviewModal({ isOpen, onClose, onSave, item }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [status, setStatus] = useState('completed');

  // Se o modal não estiver aberto, não renderiza nada na tela
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item, rating, review, status);
    
    // Limpa o formulário para a próxima vez
    setRating(0);
    setReview('');
    setStatus('completed');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#242424', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%', border: '1px solid #444' }}>
        <h3 style={{ marginTop: 0 }}>Avaliando: {item.title}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="plan_to_watch">Quero ver/ler</option>
              <option value="completed">Concluído</option>
              <option value="dropped">Abandonei</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nota:</label>
            <div>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  style={{ cursor: 'pointer', fontSize: '30px', color: star <= rating ? 'gold' : 'gray' }}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Resenha:</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              maxLength={1000}
              rows={5}
              style={{ width: '100%', padding: '8px', resize: 'none' }}
              placeholder="Escreva o que achou..."
            />
            <div style={{ fontSize: '12px', color: 'gray', textAlign: 'right' }}>
              {review.length}/1000
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: 'transparent', border: '1px solid gray' }}>Cancelar</button>
            <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Salvar no Diário</button>
          </div>
        </form>
      </div>
    </div>
  );
}
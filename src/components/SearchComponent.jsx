import React, { useState, useEffect } from 'react';
import { useMediaLog } from '../hooks/useMediaLog';
import ReviewModal from './ReviewModal.jsx';
import toast from 'react-hot-toast';
import "../App.css";

export default function SearchComponent() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('tmdb');
  const [results, setResults] = useState([]);
  
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  
  // NOVO: Estado que controla se a rodinha está girando
  const [isLoading, setIsLoading] = useState(true); 
  
  const { saveMedia } = useMediaLog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true); // Liga o loading ao entrar na tela
      try {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_KEY}&language=pt-BR&page=1`);
        const tmdbData = await tmdbRes.json();
        const movies = (tmdbData.results || []).slice(0, 4).map(item => ({
          id: item.id,
          title: item.title,
          image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
          type: 'movie'
        }));
        setTrendingMovies(movies);

        const currentYear = new Date().getFullYear();
        const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:fiction+${currentYear}&orderBy=relevance&maxResults=20&key=${import.meta.env.VITE_GOOGLE_KEY}`);
        const gbData = await gbRes.json();
        
        const recentBooks = (gbData.items || []).filter(item => {
          const pubDate = item.volumeInfo.publishedDate;
          if (!pubDate) return false; 
          const pubYear = parseInt(pubDate.substring(0, 4), 10);
          return pubYear >= currentYear - 2 && pubYear <= currentYear;
        });

        const books = recentBooks.slice(0, 4).map(item => {
          const info = item.volumeInfo;
          return {
            id: item.id, 
            title: info.title,
            image: info.imageLinks ? info.imageLinks.thumbnail.replace('http:', 'https:') : '',
            type: 'book'
          };
        });
        
        setTrendingBooks(books);
      } catch (error) {
        console.error("Erro ao carregar itens em alta:", error);
      } finally {
        setIsLoading(false); // NOVO: Desliga o loading independentemente de dar certo ou erro
      }
    };

    fetchTrending();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Liga o loading ao clicar em Buscar
    let fetchedResults = [];

    try {
      if (searchType === 'tmdb') {
        const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${import.meta.env.VITE_TMDB_KEY}&language=pt-BR&query=${query}`);
        const data = await response.json();
        fetchedResults = (data.results || []).map(item => ({
          id: item.id,
          title: item.title || item.name,
          image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
          type: item.media_type === 'tv' ? 'tv' : 'movie'
        }));
      } else {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10&key=${import.meta.env.VITE_GOOGLE_KEY}`);
        const data = await response.json();
        fetchedResults = (data.items || []).map(item => {
          const info = item.volumeInfo;
          return {
            id: item.id, 
            title: info.title,
            image: info.imageLinks ? info.imageLinks.thumbnail.replace('http:', 'https:') : '',
            type: 'book'
          };
        });
      }
      setResults(fetchedResults);
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setIsLoading(false); // NOVO: Desliga o loading ao terminar a busca
    }
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmSave = (item, rating, review, status) => {
  saveMedia(item, rating, review, status);
  setIsModalOpen(false);
  toast.success('Adicionado à biblioteca!');
};

  const renderCards = (items) => (
    <div className="grid-container">
      {items.map((item) => (
        <div key={item.id} className="media-card">
          {item.image ? (
            <img src={item.image} alt={item.title} />
          ) : (
            <div className="no-image-placeholder" style={{ height: '225px', backgroundColor: '#1b2228', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Sem Capa
            </div>
          )}
          
          <div className="media-info">
            <h4 className="media-title" title={item.title}>{item.title}</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '5px 0' }}>
              {item.type === 'book' ? 'Livro' : 'Ecrã'}
            </p>
            <button className="add-button" onClick={() => handleOpenModal(item)}>
              + Adicionar
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSearch} className="search-form">
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="tmdb">Filmes/Séries</option>
          <option value="books">Livros</option>
        </select>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === '') setResults([]);
          }} 
          placeholder="O que você está procurando?"
          required
        />
        <button type="submit">Buscar</button>
      </form>

      {/* LÓGICA DE EXIBIÇÃO ATUALIZADA: Mostra o spinner se estiver carregando */}
      {isLoading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : results.length > 0 ? (
        renderCards(results)
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h3 className="chart-title">Filmes em Cartaz</h3>
          {renderCards(trendingMovies)}

          <h3 className="chart-title" style={{ marginTop: '40px' }}>Livros em Alta</h3>
          {renderCards(trendingBooks)}
        </div>
      )}

      <ReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleConfirmSave} 
        item={selectedItem} 
      />
    </div>
  );
}
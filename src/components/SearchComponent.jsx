import React, { useState, useEffect } from 'react';
import { useMediaLog } from '../hooks/useMediaLog';
import ReviewModal from './ReviewModal.jsx';
import toast from 'react-hot-toast';
import "../App.css";
import DetailsModal from './DetailsModal.jsx';
import Loading from './Loading.jsx'; 

// Tradutor de códigos de gênero do TMDB
const TMDB_GENRES = {
  28: "Ação", 12: "Aventura", 16: "Animação", 35: "Comédia", 80: "Crime", 99: "Documentário", 18: "Drama", 10751: "Família", 14: "Fantasia", 36: "História", 27: "Terror", 10402: "Música", 9648: "Mistério", 10749: "Romance", 878: "Ficção Científica", 10770: "Cinema TV", 53: "Thriller", 10752: "Guerra", 37: "Faroeste",
  10759: "Ação e Aventura", 10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Ficção e Fantasia", 10766: "Soap", 10767: "Talk", 10768: "Guerra e Política"
};

export default function SearchComponent() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('tmdb');
  const [results, setResults] = useState([]);
  
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true); 
  
  const { saveMedia } = useMediaLog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true); 
      try {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_KEY}&language=pt-BR&page=1`);
        const tmdbData = await tmdbRes.json();
        const movies = (tmdbData.results || []).slice(0, 6).map(item => ({
          id: item.id,
          title: item.title,
          image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
          type: 'movie',
          date: item.release_date || item.first_air_date || '',
          genres: (item.genre_ids || []).map(id => TMDB_GENRES[id]).filter(Boolean)
        }));
        setTrendingMovies(movies);

        const currentYear = new Date().getFullYear();
        const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:fiction+${currentYear}&orderBy=relevance&maxResults=20&key=${import.meta.env.VITE_GOOGLE_KEY}`);
        const gbData = await gbRes.json();
        
        const recentBooks = (gbData.items || []).filter(item => {
          const pubDate = item.volumeInfo.publishedDate;
          if (!pubDate) return false; 
          const pubYear = parseInt(pubDate.substring(0, 6), 10);
          return pubYear >= currentYear - 2 && pubYear <= currentYear;
        });

        const books = recentBooks.slice(0, 4).map(item => {
          const info = item.volumeInfo;
          return {
            id: item.id, 
            title: info.title,
            image: info.imageLinks ? info.imageLinks.thumbnail.replace('http:', 'https:') : '',
            type: 'book',
            date: info.publishedDate || '',
            genres: info.categories || []
          };
        });
        
        setTrendingBooks(books);
      } catch (error) {
        console.error("Erro ao carregar itens em alta:", error);
      } finally {
        setIsLoading(false); 
      }
    };

    fetchTrending();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    let fetchedResults = [];

    try {
      if (searchType === 'tmdb') {
        const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${import.meta.env.VITE_TMDB_KEY}&language=pt-BR&query=${query}`);
        const data = await response.json();
        fetchedResults = (data.results || []).map(item => ({
          id: item.id,
          title: item.title || item.name,
          image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
          type: item.media_type === 'tv' ? 'tv' : 'movie',
          // PEGANDO DATA E GÊNEROS (TMDB)
          date: item.release_date || item.first_air_date || '',
          genres: (item.genre_ids || []).map(id => TMDB_GENRES[id]).filter(Boolean)
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
            type: 'book',
            // PEGANDO DATA E GÊNEROS (Google Books)
            date: info.publishedDate || '',
            genres: info.categories || []
          };
       
        });
      }
      setResults(fetchedResults);
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setIsLoading(false); 
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

  const handleOpenDetails = (item) => {
    setDetailsItem(item);
    setIsDetailsOpen(true);
  };

  const renderCards = (items) => (
    <div className="grid-container">
      {items.map((item) => (
        <div key={item.id} className="media-card">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.title} 
              onClick={() => handleOpenDetails(item)}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <div 
              className="no-image-placeholder" 
              onClick={() => handleOpenDetails(item)}
              style={{ height: '225px', backgroundColor: '#1b2228', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              Sem Capa
            </div>
          )}
          
          <div className="media-info">
            <h4 className="media-title" title={item.title}>{item.title}</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '5px 0' }}>
              {item.type === 'book' ? 'Livro' : item.type === 'tv' ? 'Série' : 'Filme'}
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

      {/* LÓGICA DE EXIBIÇÃO ATUALIZADA: Usando o novo componente Loading */}
      {isLoading ? (
        <Loading />
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

      <DetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        item={detailsItem} 
      />
      
    </div>
  );
}
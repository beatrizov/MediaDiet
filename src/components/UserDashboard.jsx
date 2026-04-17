import React, { useState, useEffect } from 'react';
import { useMediaLog } from '../hooks/useMediaLog';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import '../App.css';
import Loading from './Loading.jsx'; 

export default function UserDashboard() {
  const [logs, setLogs] = useState([]);
  const { getUserLogs } = useMediaLog();
  
  // Estado que controla se a rodinha está girando
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true); // Liga o loading
      try {
        const data = await getUserLogs();
        setLogs(data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setIsLoading(false); // Desliga o loading
      }
    };
    fetchLogs();
  }, []);

  // SE ESTIVER CARREGANDO, MOSTRA APENAS A RODINHA
  if (isLoading) {
    return <Loading />;
  }

  // SE TERMINOU DE CARREGAR E ESTÁ VAZIO, MOSTRA A MENSAGEM
  if (logs.length === 0) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'gray' }}>Adicione itens à sua biblioteca para ver suas estatísticas!</div>;
  }

  // 1. DADOS DOS CARDS SUPERIORES
  const stats = logs.reduce((acc, item) => {
    acc.total++;
    if (item.mediaType) acc[item.mediaType] = (acc[item.mediaType] || 0) + 1;
    if (item.rating) {
      acc.totalRating += item.rating;
      acc.ratedCount++;
    }
    if (item.status === 'completed') acc.completed++;
    return acc;
  }, { total: 0, movie: 0, tv: 0, book: 0, totalRating: 0, ratedCount: 0, completed: 0 });

  const average = stats.ratedCount > 0 ? (stats.totalRating / stats.ratedCount).toFixed(1) : 0;

  // 2. PROCESSAMENTO DOS DADOS PARA OS GRÁFICOS (Agrupando por Mês/Ano)
  const processChartData = () => {
    const dataMap = {};

    logs.forEach(log => {
      // Tenta pegar a data salva no Firebase. Adapte 'createdAt' se o seu campo tiver outro nome.
      const dateRaw = log.createdAt?.toDate ? log.createdAt.toDate() : (log.createdAt || log.date || new Date());
      const dateObj = new Date(dateRaw);
      
      // Formata como "Mês/Ano" (ex: "4/2026")
      const monthYear = `${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

      if (!dataMap[monthYear]) {
        dataMap[monthYear] = {
          name: monthYear,
          Filmes: 0, Séries: 0, Livros: 0,
          movieRatingSum: 0, tvRatingSum: 0, bookRatingSum: 0,
          movieCount: 0, tvCount: 0, bookCount: 0,
          timestamp: dateObj.getTime()
        };
      }

      const type = log.mediaType;
      if (type) {
        // Soma o volume
        if (type === 'movie') dataMap[monthYear].Filmes += 1;
        if (type === 'tv') dataMap[monthYear].Séries += 1;
        if (type === 'book') dataMap[monthYear].Livros += 1;

        // Prepara as médias de notas
        if (log.rating) {
          dataMap[monthYear][`${type}RatingSum`] += log.rating;
          dataMap[monthYear][`${type}Count`] += 1;
        }
      }
    });

    // Calcula as médias finais e ordena por data
    return Object.values(dataMap).sort((a, b) => a.timestamp - b.timestamp).map(item => ({
      ...item,
      'Nota Filmes': item.movieCount ? parseFloat((item.movieRatingSum / item.movieCount).toFixed(1)) : null,
      'Nota Séries': item.tvCount ? parseFloat((item.tvRatingSum / item.tvCount).toFixed(1)) : null,
      'Nota Livros': item.bookCount ? parseFloat((item.bookRatingSum / item.bookCount).toFixed(1)) : null,
    }));
  };

  const chartData = processChartData();

  // Estilo customizado para os tooltips (caixinhas que aparecem ao passar o mouse)
  const customTooltipStyle = {
    backgroundColor: '#1b2228',
    borderColor: '#445566',
    color: '#fff',
    borderRadius: '4px'
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Suas Estatísticas</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total de itens</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--lb-green)' }}>{average}</span>
          <span className="stat-label">Nota Média</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Concluídos</span>
        </div>
      </div>

      {/* SEÇÃO 1: GRÁFICO DE VOLUME (Quantos itens por mês) */}
      <h3 className="chart-title">Consumo por Mês</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#445566" vertical={false} />
            <XAxis dataKey="name" stroke="#8bc" />
            <YAxis stroke="#8bc" allowDecimals={false} />
            <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fff' }} />
            <Legend />
            {/* Cores combinando com a estética */}
            <Bar dataKey="Filmes" stackId="a" fill="#00e054" /> 
            <Bar dataKey="Séries" stackId="a" fill="#40bcf4" />
            <Bar dataKey="Livros" stackId="a" fill="#ff8000" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SEÇÃO 2: GRÁFICO DE NOTAS (Evolução das avaliações) */}
      <h3 className="chart-title" style={{ marginTop: '40px' }}>Evolução das Notas Médias</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#445566" vertical={false} />
            <XAxis dataKey="name" stroke="#8bc" />
            <YAxis stroke="#8bc" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend />
            {/* Usamos connectNulls para a linha não quebrar se houver um mês sem nota */}
            <Line type="monotone" dataKey="Nota Filmes" stroke="#00e054" strokeWidth={3} connectNulls />
            <Line type="monotone" dataKey="Nota Séries" stroke="#40bcf4" strokeWidth={3} connectNulls />
            <Line type="monotone" dataKey="Nota Livros" stroke="#ff8000" strokeWidth={3} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
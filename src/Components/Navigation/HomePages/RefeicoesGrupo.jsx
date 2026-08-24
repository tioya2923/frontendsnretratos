import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const GruposList = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

  const fetchGrupos = useCallback(() => {
    axios.get(`${backendUrl}components/grupo_refeicao.php?_=${Date.now()}`)
      .then(response => {
        setGrupos(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar grupos:', error);
        setError('Erro ao buscar grupos');
        setLoading(false);
      });
  }, [backendUrl]);

  useEffect(() => {
    fetchGrupos();
    const interval = setInterval(() => {
      if (!document.hidden) fetchGrupos();
    }, 30000);
    const onVisible = () => { if (!document.hidden) fetchGrupos(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchGrupos]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Refeições em Grupo</h2>
      {grupos.length > 0 ? (
        grupos.map(grupo => (
          <div key={grupo.id}>
            <h3>{grupo.nome_grupo} ({grupo.total_membros} membros)</h3>
            {grupo.refeicoes.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Tipo de Refeição</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Local</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.refeicoes.map(refeicao => (
                    <tr key={refeicao.id}>
                      <td>{refeicao.tipo_refeicao}</td>
                      <td>{refeicao.data_refeicao}</td>
                      <td>{refeicao.hora_refeicao}</td>
                      <td>{refeicao.local_refeicao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Sem refeições cadastradas</p>
            )}
          </div>
        ))
      ) : (
        <p>Sem grupos cadastrados</p>
      )}
    </div>
  );
};

export default GruposList;

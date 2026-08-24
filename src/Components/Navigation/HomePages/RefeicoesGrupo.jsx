import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiUsers } from 'react-icons/fi';

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
    return (
      <div className="pagina">
        <div className="rodinha" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pagina">
        <div className="estadoVazio cartao">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina pagina--larga">
      <h1 className="paginaTitulo">Refeições em Grupo</h1>
      <p className="paginaSubtitulo">Grupos marcados para almoçar ou jantar, com as datas e horas previstas.</p>

      {grupos.length > 0 ? (
        <div style={{ display: 'grid', gap: 24 }}>
          {grupos.map(grupo => (
            <div className="cartao" key={grupo.id}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiUsers /> {grupo.nome_grupo}
                <span className="distintivo distintivo--neutro">{grupo.total_membros} membro{grupo.total_membros === 1 ? '' : 's'}</span>
              </h3>
              {grupo.refeicoes.length > 0 ? (
                <div className="tabelaContainer">
                  <table className="tabela">
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
                          <td style={{ textTransform: 'capitalize' }}>{refeicao.tipo_refeicao}</td>
                          <td>{refeicao.data_refeicao}</td>
                          <td>{refeicao.hora_refeicao}</td>
                          <td>{refeicao.local_refeicao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--cor-texto-suave)', margin: 0 }}>Sem refeições marcadas.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="estadoVazio cartao">
          <div className="estadoVazio__icone"><FiUsers /></div>
          <p>Ainda não há grupos cadastrados.</p>
        </div>
      )}
    </div>
  );
};

export default GruposList;

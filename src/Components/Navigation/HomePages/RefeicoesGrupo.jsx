import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GruposList = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios.get(`${backendUrl}components/grupo_refeicao.php`)
      .then(response => {
        console.log('Dados recebidos:', response.data); // Verifique os dados recebidos
        setGrupos(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar grupos:', error);
        setError('Erro ao buscar grupos');
        setLoading(false);
      });
  }, [backendUrl]);

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

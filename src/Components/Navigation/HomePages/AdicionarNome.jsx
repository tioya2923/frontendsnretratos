import React, { useState } from 'react';
import axios from 'axios';

const AdicionarNome = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataAniversario, setDataAniversario] = useState('');
  const [dataAniversarioSacerdotal, setDataAniversarioSacerdotal] = useState('');
  const [mensagem, setMensagem] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}components/adicionar_nome.php`, {
        nome_completo: nomeCompleto,
        data_aniversario: dataAniversario || null,
        data_aniversario_sacerdotal: dataAniversarioSacerdotal || null,
      });
      setMensagem(response.data.message);
    } catch (error) {
      setMensagem('Erro ao adicionar nome');
    }
  };

  return (
    <div>
      <h2>Adicionar Nome</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome Completo:</label>
          <input
            type="text"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Data de Aniversário:</label>
          <input
            type="date"
            value={dataAniversario}
            onChange={(e) => setDataAniversario(e.target.value)}
          />
        </div>
        <div>
          <label>Data de Aniversário Sacerdotal:</label>
          <input
            type="date"
            value={dataAniversarioSacerdotal}
            onChange={(e) => setDataAniversarioSacerdotal(e.target.value)}
          />
        </div>
        <button type="submit">Adicionar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
};

export default AdicionarNome;

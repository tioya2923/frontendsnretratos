import React, { useState } from 'react';
import axios from 'axios';
import '../../Styles/InscreverVisitas.css'; // Certifique-se de importar o arquivo CSS

const InscreverVisitas = () => {
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [levarRefeicao, setLevarRefeicao] = useState(false);
  const [almoco, setAlmoco] = useState(false);
  const [almocoMaisCedo, setAlmocoMaisCedo] = useState(false);
  const [almocoMaisTarde, setAlmocoMaisTarde] = useState(false);
  const [jantar, setJantar] = useState(false);
  const [jantarMaisCedo, setJantarMaisCedo] = useState(false);
  const [jantarMaisTarde, setJantarMaisTarde] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}components/visitas.php`, {
        nome,
        data,       
        almoco,
        almoco_mais_cedo: almocoMaisCedo,
        almoco_mais_tarde: almocoMaisTarde,
        levar_refeicao: levarRefeicao,
        jantar,
        jantar_mais_cedo: jantarMaisCedo,
        jantar_mais_tarde: jantarMaisTarde,
      });
      setMensagem(response.data.message);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message === "Já inscrito para esta refeição") {
        setMensagem('Já inscrito');
      } else {
        setMensagem('Erro ao adicionar refeição');
      }
    }
  };

  return (
    <div className="container-inscricao">
      <h1 className="titulo-inscricao">Inscrever Visitante</h1>
      <form className="formulario-inscricao" onSubmit={handleSubmit}>
        <div className="campo-inscricao">
          <label className="label-inscricao">Nome:</label>
          <input
            className="input-inscricao"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div className="campo-inscricao">
          <label className="label-inscricao">Data:</label>
          <input
            className="input-inscricao"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>
        <div className="checkbox-container">
          <label className="label-inscricao">
            <input
              className="checkbox-inscricao"
              type="checkbox"
              checked={levarRefeicao}
              onChange={(e) => setLevarRefeicao(e.target.checked)}
            />
            Takeaway
          </label>
          <label className="label-inscricao">
            <input
              className="checkbox-inscricao"
              type="checkbox"
              checked={almoco}
              onChange={(e) => setAlmoco(e.target.checked)}
            />
            Almoço
          </label>
          <label className="label-inscricao">
            <input
              className="checkbox-inscricao"
              type="checkbox"
              checked={almocoMaisCedo}
              onChange={(e) => setAlmocoMaisCedo(e.target.checked)}
            />
            Almoça mais cedo
          </label>
          <label className="label-inscricao">
            <input
              className="checkbox-inscricao"
              type="checkbox"
              checked={almocoMaisTarde}
              onChange={(e) => setAlmocoMaisTarde(e.target.checked)}
            />
            Almoço mais tarde
          </label>
          <label className="label-inscricao">
            <input
              className="checkbox-inscricao"
              type="checkbox"
              checked={jantar}
              onChange={(e) => setJantar(e.target.checked)}
            />
            Jantar
          </label>
          <label className="label-inscricao">
            <input
              className="checkbox-inscricao"
              type="checkbox"
              checked={jantarMaisCedo}
              onChange={(e) => setJantarMaisCedo(e.target.checked)}
            />
            Jantar mais cedo
          </label>
          <label className="label-inscricao">
            <input
              className="checkbox-inscricao"
              type="checkbox"
              checked={jantarMaisTarde}
              onChange={(e) => setJantarMaisTarde(e.target.checked)}
            />
            Jantar mais tarde
          </label>
        </div>
        <button className="botao-inscricao" type="submit">Inscrever</button>
      </form>
      {mensagem && <p className="mensagem-inscricao">{mensagem}</p>}
    </div>
  );
};

export default InscreverVisitas;

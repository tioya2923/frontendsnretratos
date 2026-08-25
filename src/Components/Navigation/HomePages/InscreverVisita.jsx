import React, { useState } from 'react';
import axios from 'axios';
import { FiUserPlus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
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
  const [mensagemErro, setMensagemErro] = useState(false);

  const envUrl = process.env.REACT_APP_BACKEND_URL;
  const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

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
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMensagem(response.data.message);
      setMensagemErro(false);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message === "Já inscrito para esta refeição") {
        setMensagem('Já inscrito');
      } else {
        setMensagem('Erro ao adicionar refeição');
      }
      setMensagemErro(true);
    }
  };

  return (
    <div className="pagina" style={{ maxWidth: 480 }}>
      <h1 className="paginaTitulo"><FiUserPlus style={{ verticalAlign: -3 }} /> Inscrever Visitante</h1>
      <p className="paginaSubtitulo">Registe a inscrição de alguém que não tem conta na app.</p>

      <div className="cartao cartao--destaque">
        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label className="campoRotulo" htmlFor="visita-nome">Nome</label>
            <input
              id="visita-nome"
              className="campoInput"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label className="campoRotulo" htmlFor="visita-data">Data</label>
            <input
              id="visita-data"
              className="campoInput"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>
          <div className="checkbox-container">
            <label className="label-inscricao">
              <input
                type="checkbox"
                checked={levarRefeicao}
                onChange={(e) => setLevarRefeicao(e.target.checked)}
              />
              Takeaway
            </label>
            <label className="label-inscricao">
              <input
                type="checkbox"
                checked={almoco}
                onChange={(e) => setAlmoco(e.target.checked)}
              />
              Almoço
            </label>
            <label className="label-inscricao">
              <input
                type="checkbox"
                checked={almocoMaisCedo}
                onChange={(e) => setAlmocoMaisCedo(e.target.checked)}
              />
              Almoço mais cedo
            </label>
            <label className="label-inscricao">
              <input
                type="checkbox"
                checked={almocoMaisTarde}
                onChange={(e) => setAlmocoMaisTarde(e.target.checked)}
              />
              Almoço mais tarde
            </label>
            <label className="label-inscricao">
              <input
                type="checkbox"
                checked={jantar}
                onChange={(e) => setJantar(e.target.checked)}
              />
              Jantar
            </label>
            <label className="label-inscricao">
              <input
                type="checkbox"
                checked={jantarMaisCedo}
                onChange={(e) => setJantarMaisCedo(e.target.checked)}
              />
              Jantar mais cedo
            </label>
            <label className="label-inscricao">
              <input
                type="checkbox"
                checked={jantarMaisTarde}
                onChange={(e) => setJantarMaisTarde(e.target.checked)}
              />
              Jantar mais tarde
            </label>
          </div>
          <button className="botao botao--primario" type="submit" style={{ width: '100%' }}>Inscrever</button>
        </form>
        {mensagem && (
          <p className={`distintivo distintivo--${mensagemErro ? 'erro' : 'sucesso'}`} style={{ marginTop: 16 }}>
            {mensagemErro ? <FiAlertCircle /> : <FiCheckCircle />} {mensagem}
          </p>
        )}
      </div>
    </div>
  );
};

export default InscreverVisitas;

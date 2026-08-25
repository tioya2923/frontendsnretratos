import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';

const AddGroupsToMeal = () => {
  const [grupos, setGrupos] = useState([]);
  // Ao vir da página de Grupos (link "Marcar para Refeição"), o grupo já
  // vem escolhido via ?grupo_id=, para não obrigar a procurá-lo de novo.
  const [searchParams] = useSearchParams();
  const grupoIdInicial = searchParams.get('grupo_id') || '';
  const [formData, setFormData] = useState({
    grupo_id: grupoIdInicial,
    tipo_refeicao: '',
    data_refeicao: '',
    hora_refeicao: '',
    local_refeicao: ''
  });

  const envUrl = process.env.REACT_APP_BACKEND_URL;
  const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

  useEffect(() => {
    // Buscar grupos ao carregar o componente
    axios.get(`${backendUrl}components/grupos.php`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(response => {
        setGrupos(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar grupos:', error);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${backendUrl}components/grupo_refeicao.php`, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(response => {
        // Limpar o formulário, mas manter o grupo selecionado — é comum
        // marcar o mesmo grupo para mais do que uma refeição de seguida.
        setFormData({
          grupo_id: formData.grupo_id,
          tipo_refeicao: '',
          data_refeicao: '',
          hora_refeicao: '',
          local_refeicao: ''
        });
      })
      .catch(error => {
        console.error('Erro ao adicionar refeição:', error);
        toast.error(error.response?.data?.message || 'Erro ao adicionar refeição.');
      });
  };

  return (
    <div className="pagina" style={{ maxWidth: 520 }}>
      <h1 className="paginaTitulo"><FiCalendar style={{ verticalAlign: -3 }} /> Adicionar Refeições em Grupos</h1>
      <p className="paginaSubtitulo">Marca um grupo já criado para almoçar ou jantar num dia específico.</p>

      <div className="cartao cartao--destaque">
        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label className="campoRotulo" htmlFor="grupo_id">Grupo</label>
            <select id="grupo_id" className="campoSelect" name="grupo_id" value={formData.grupo_id} onChange={handleChange} required>
              <option value="">Selecione um grupo</option>
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.id}>{grupo.nome_grupo}</option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label className="campoRotulo" htmlFor="tipo_refeicao">Tipo de Refeição</label>
            {/* Valores fixos (não texto livre): é isto que permite ao mapa de
                refeições (InscritosRefeicoes.jsx) somar o número de pessoas do
                grupo ao total certo (Almoço ou Jantar) do dia. */}
            <select id="tipo_refeicao" className="campoSelect" name="tipo_refeicao" value={formData.tipo_refeicao} onChange={handleChange} required>
              <option value="">Selecione</option>
              <option value="almoco">Almoço</option>
              <option value="jantar">Jantar</option>
            </select>
          </div>
          <div className="campo">
            <label className="campoRotulo" htmlFor="data_refeicao">Data da Refeição</label>
            <input id="data_refeicao" className="campoInput" type="date" name="data_refeicao" value={formData.data_refeicao} onChange={handleChange} required />
          </div>
          <div className="campo">
            <label className="campoRotulo" htmlFor="hora_refeicao">Hora da Refeição</label>
            <input id="hora_refeicao" className="campoInput" type="time" name="hora_refeicao" value={formData.hora_refeicao} onChange={handleChange} required />
          </div>
          <div className="campo">
            <label className="campoRotulo" htmlFor="local_refeicao">Local da Refeição</label>
            <input id="local_refeicao" className="campoInput" type="text" name="local_refeicao" placeholder="Ex.: Salão" value={formData.local_refeicao} onChange={handleChange} required />
          </div>
          <button type="submit" className="botao botao--primario" style={{ width: '100%' }}>Adicionar Refeição</button>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/gruposMembros" className="linkVoltar">
          <FiArrowLeft /> Voltar aos Grupos
        </Link>
      </p>
    </div>
  );
};

export default AddGroupsToMeal;




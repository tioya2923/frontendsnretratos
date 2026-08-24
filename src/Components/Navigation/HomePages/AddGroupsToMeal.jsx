import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    axios.get(`${backendUrl}components/grupos.php`)
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
        toast.success('Refeição adicionada com sucesso!');
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
    <form onSubmit={handleSubmit}>
      <h2>Adicionar Refeições em Grupos</h2>
      <div>
        <Link to="/gruposMembros">← Voltar aos Grupos</Link>
      </div>
      <div>
        <label>Grupo:</label>
        <select name="grupo_id" value={formData.grupo_id} onChange={handleChange} required>
          <option value="">Selecione um grupo</option>
          {grupos.map(grupo => (
            <option key={grupo.id} value={grupo.id}>{grupo.nome_grupo}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Tipo de Refeição:</label>
        {/* Valores fixos (não texto livre): é isto que permite ao mapa de
            refeições (InscritosRefeicoes.jsx) somar o número de pessoas do
            grupo ao total certo (Almoço ou Jantar) do dia. */}
        <select name="tipo_refeicao" value={formData.tipo_refeicao} onChange={handleChange} required>
          <option value="">Selecione</option>
          <option value="almoco">Almoço</option>
          <option value="jantar">Jantar</option>
        </select>
      </div>
      <div>
        <label>Data da Refeição:</label>
        <input type="date" name="data_refeicao" value={formData.data_refeicao} onChange={handleChange} required />
      </div>
      <div>
        <label>Hora da Refeição:</label>
        <input type="time" name="hora_refeicao" value={formData.hora_refeicao} onChange={handleChange} required />
      </div>
      <div>
        <label>Local da Refeição:</label>
        <input type="text" name="local_refeicao" value={formData.local_refeicao} onChange={handleChange} required />
      </div>
      <button type="submit">Adicionar Refeição</button>
    </form>
  );
};

export default AddGroupsToMeal;




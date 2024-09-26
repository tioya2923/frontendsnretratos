import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddGroupsToMeal = () => {
  const [grupos, setGrupos] = useState([]);
  const [formData, setFormData] = useState({
    grupo_id: '',
    tipo_refeicao: '',
    data_refeicao: '',
    hora_refeicao: '',
    local_refeicao: ''
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

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
    axios.post(`${backendUrl}components/grupo_refeicao.php`, formData)
      .then(response => {
        alert('Refeição adicionada com sucesso!');
        // Limpar o formulário
        setFormData({
          grupo_id: '',
          tipo_refeicao: '',
          data_refeicao: '',
          hora_refeicao: '',
          local_refeicao: ''
        });
      })
      .catch(error => {
        console.error('Erro ao adicionar refeição:', error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
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
        <input type="text" name="tipo_refeicao" value={formData.tipo_refeicao} onChange={handleChange} required />
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




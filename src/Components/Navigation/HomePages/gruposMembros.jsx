import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/Grupos.css'; // Importando o arquivo CSS

const Grupos = () => {
    const [grupos, setGrupos] = useState([]);
    const [nomeGrupo, setNomeGrupo] = useState('');
    const [id, setId] = useState(null);
    const [membros, setMembros] = useState({});
    const [selectedGrupo, setSelectedGrupo] = useState(null);
    const [novoMembro, setNovoMembro] = useState({});

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchGrupos();
    }, []);

    const fetchGrupos = async () => {
        try {
            const response = await axios.get(`${backendUrl}components/grupos.php`);
            setGrupos(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar grupos:', error);
        }
    };

    const fetchMembros = async (grupoId) => {
        try {
            const response = await axios.get(`${backendUrl}components/grupos.php?grupo_id=${grupoId}`);
            setMembros((prevMembros) => ({ ...prevMembros, [grupoId]: response.data }));
        } catch (error) {
            console.error('Erro ao buscar membros:', error);
        }
    };

    const createGrupo = async () => {
        try {
            await axios.post(`${backendUrl}components/grupos.php`, { nome_grupo: nomeGrupo });
            fetchGrupos();
            setNomeGrupo('');
        } catch (error) {
            console.error('Erro ao criar grupo:', error);
        }
    };

    const updateGrupo = async () => {
        try {
            await axios.put(`${backendUrl}components/grupos.php`, { id, nome_grupo: nomeGrupo });
            fetchGrupos();
            setNomeGrupo('');
            setId(null);
        } catch (error) {
            console.error('Erro ao atualizar grupo:', error);
        }
    };

    const deleteGrupo = async (id) => {
        try {
            await axios.delete(`${backendUrl}components/grupos.php`, { data: { id } });
            fetchGrupos();
        } catch (error) {
            console.error('Erro ao deletar grupo:', error);
        }
    };

    const createMembro = async (grupoId) => {
        try {
            const nomeMembro = novoMembro[grupoId];
            await axios.post(`${backendUrl}components/grupos.php`, { nome_membro: nomeMembro, grupo_id: grupoId });
            fetchMembros(grupoId); // Atualiza a lista de membros após adicionar um novo membro
            setNovoMembro((prevMembros) => ({ ...prevMembros, [grupoId]: '' }));
        } catch (error) {
            console.error('Erro ao criar membro:', error);
        }
    };

    const deleteMembro = async (membroId, grupoId) => {
        try {
            await axios.delete(`${backendUrl}components/grupos.php`, { data: { membro_id: membroId } });
            fetchMembros(grupoId); // Atualiza a lista de membros após deletar um membro
        } catch (error) {
            console.error('Erro ao deletar membro:', error);
        }
    };

    const handleMembroChange = (grupoId, value) => {
        setNovoMembro((prevMembros) => ({ ...prevMembros, [grupoId]: value }));
    };

    const handleGrupoClick = (grupoId) => {
        setSelectedGrupo(grupoId === selectedGrupo ? null : grupoId);
        fetchMembros(grupoId);
    };

    return (
        <div className="container">
            <div>
            <div className="header">Grupos</div>
            <div className="input-container">
                <input
                    className="input"
                    type="text"
                    value={nomeGrupo}
                    onChange={(e) => setNomeGrupo(e.target.value)}
                    placeholder="Novo Grupo"
                />
                <button className="button" onClick={id ? updateGrupo : createGrupo}>
                    {id ? 'Atualizar Grupo' : 'Criar Grupo'}
                </button>
            </div>
            <ul className="group-list">
                {grupos.map((grupo) => (
                    <li key={grupo.id} className={`group-item ${selectedGrupo === grupo.id ? 'active' : ''}`}>
                        <div className="group-name" onClick={() => handleGrupoClick(grupo.id)}>
                            {grupo.nome_grupo}: {grupo.total_membros}
                        </div>
                        <button className="button edit-button" onClick={() => {
                            setNomeGrupo(grupo.nome_grupo);
                            setId(grupo.id);
                        }}>Editar</button>
                        <button className="button delete-button" onClick={() => deleteGrupo(grupo.id)}>Apagar</button>
                        {selectedGrupo === grupo.id && (
                            <>
                                <div className="member-input-container">
                                    <input
                                        className="input"
                                        type="text"
                                        value={novoMembro[grupo.id] || ''}
                                        onChange={(e) => handleMembroChange(grupo.id, e.target.value)}
                                        placeholder="Novo Membro"
                                    />
                                    <button className="button add-button" onClick={() => createMembro(grupo.id)}>Adicionar Membro</button>
                                </div>
                                <ul className="member-list">
                                    {membros[grupo.id] && membros[grupo.id].map((membro) => (
                                        <li key={membro.id} className="member-item">
                                            <span className="member-name">{membro.nome_membro}</span>
                                            <button className="button delete-button" onClick={() => deleteMembro(membro.id, grupo.id)}>Apagar</button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            </div>
            
        </div>
    );
};

export default Grupos;

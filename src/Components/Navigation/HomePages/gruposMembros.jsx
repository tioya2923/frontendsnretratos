import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useConfirm } from '../../ConfirmDialog';
import { FiEdit2, FiTrash2, FiCalendar, FiUserPlus, FiUsers, FiPlusCircle } from 'react-icons/fi';
import '../../Styles/Grupos.css'; // Importando o arquivo CSS

const Grupos = () => {
    const [grupos, setGrupos] = useState([]);
    const [nomeGrupo, setNomeGrupo] = useState('');
    const [numeroPessoas, setNumeroPessoas] = useState('');
    const [id, setId] = useState(null);
    const [membros, setMembros] = useState({});
    const [refeicoesGrupo, setRefeicoesGrupo] = useState({});
    const [selectedGrupo, setSelectedGrupo] = useState(null);
    const [novoMembro, setNovoMembro] = useState({});
    const confirmar = useConfirm();

    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';
    const adminHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

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
    }, []);

    const fetchGrupos = async () => {
        try {
            const response = await axios.get(`${backendUrl}components/grupos.php?_=${Date.now()}`, adminHeaders());
            setGrupos(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar grupos:', error);
        }
    };

    const fetchMembros = async (grupoId) => {
        try {
            const response = await axios.get(`${backendUrl}components/grupos.php?grupo_id=${grupoId}&_=${Date.now()}`, adminHeaders());
            setMembros((prevMembros) => ({ ...prevMembros, [grupoId]: response.data }));
        } catch (error) {
            console.error('Erro ao buscar membros:', error);
        }
    };

    const fetchRefeicoesGrupo = async (grupoId) => {
        try {
            const response = await axios.get(`${backendUrl}components/grupo_refeicao.php?grupo_id=${grupoId}&_=${Date.now()}`, adminHeaders());
            setRefeicoesGrupo((prev) => ({ ...prev, [grupoId]: Array.isArray(response.data) ? response.data : [] }));
        } catch (error) {
            console.error('Erro ao buscar refeições do grupo:', error);
        }
    };

    // O backend passou a devolver códigos de erro HTTP reais (antes, um
    // nome de grupo duplicado ou dados incompletos vinham sempre com
    // 200 OK, e este try/catch nunca via a falha).
    const erroServidor = (error, fallback) => error.response?.data?.message || fallback;

    const createGrupo = async () => {
        try {
            await axios.post(
                `${backendUrl}components/grupos.php`,
                { nome_grupo: nomeGrupo, numero_pessoas: Number(numeroPessoas) || 0 },
                adminHeaders()
            );
            fetchGrupos();
            setNomeGrupo('');
            setNumeroPessoas('');
        } catch (error) {
            console.error('Erro ao criar grupo:', error);
            toast.error(erroServidor(error, 'Erro ao criar grupo.'));
        }
    };

    const updateGrupo = async () => {
        try {
            await axios.put(
                `${backendUrl}components/grupos.php`,
                { id, nome_grupo: nomeGrupo, numero_pessoas: Number(numeroPessoas) || 0 },
                adminHeaders()
            );
            fetchGrupos();
            setNomeGrupo('');
            setNumeroPessoas('');
            setId(null);
        } catch (error) {
            console.error('Erro ao atualizar grupo:', error);
            toast.error(erroServidor(error, 'Erro ao atualizar grupo.'));
        }
    };

    const deleteGrupo = async (id) => {
        if (!(await confirmar('Eliminar este grupo? Também remove as suas refeições marcadas.'))) return;
        try {
            await axios.delete(`${backendUrl}components/grupos.php`, { data: { id }, ...adminHeaders() });
            fetchGrupos();
        } catch (error) {
            console.error('Erro ao deletar grupo:', error);
            toast.error(erroServidor(error, 'Erro ao eliminar grupo.'));
        }
    };

    const createMembro = async (grupoId) => {
        try {
            const nomeMembro = novoMembro[grupoId];
            await axios.post(`${backendUrl}components/grupos.php`, { nome_membro: nomeMembro, grupo_id: grupoId }, adminHeaders());
            fetchMembros(grupoId); // Atualiza a lista de membros após adicionar um novo membro
            setNovoMembro((prevMembros) => ({ ...prevMembros, [grupoId]: '' }));
        } catch (error) {
            console.error('Erro ao criar membro:', error);
            toast.error(erroServidor(error, 'Erro ao adicionar membro.'));
        }
    };

    const deleteMembro = async (membroId, grupoId) => {
        if (!(await confirmar('Eliminar este membro?'))) return;
        try {
            await axios.delete(`${backendUrl}components/grupos.php`, { data: { membro_id: membroId }, ...adminHeaders() });
            fetchMembros(grupoId); // Atualiza a lista de membros após deletar um membro
        } catch (error) {
            console.error('Erro ao deletar membro:', error);
            toast.error(erroServidor(error, 'Erro ao eliminar membro.'));
        }
    };

    const removerRefeicaoGrupo = async (refeicaoGrupoId, grupoId) => {
        if (!(await confirmar('Remover este grupo dessa refeição? O grupo em si não é apagado.'))) return;
        try {
            await axios.delete(`${backendUrl}components/grupo_refeicao.php`, { data: { id: refeicaoGrupoId }, ...adminHeaders() });
            fetchRefeicoesGrupo(grupoId);
        } catch (error) {
            console.error('Erro ao remover refeição do grupo:', error);
            toast.error(erroServidor(error, 'Erro ao remover o grupo dessa refeição.'));
        }
    };

    const handleMembroChange = (grupoId, value) => {
        setNovoMembro((prevMembros) => ({ ...prevMembros, [grupoId]: value }));
    };

    const handleGrupoClick = (grupoId) => {
        setSelectedGrupo(grupoId === selectedGrupo ? null : grupoId);
        fetchMembros(grupoId);
        fetchRefeicoesGrupo(grupoId);
    };

    return (
        <div className="pagina">
            <h1 className="paginaTitulo">Grupos</h1>
            <p className="paginaSubtitulo">Crie grupos e marque-os para refeições — o número de pessoas soma ao total geral do dia.</p>

            <div className="cartao cartao--destaque" style={{ marginBottom: 32 }}>
                <div className="grupos-formLinha">
                    <div className="campo" style={{ flex: 2, marginBottom: 0 }}>
                        <label className="campoRotulo" htmlFor="nomeGrupo">Nome do grupo</label>
                        <input
                            id="nomeGrupo"
                            className="campoInput"
                            type="text"
                            value={nomeGrupo}
                            onChange={(e) => setNomeGrupo(e.target.value)}
                            placeholder="Ex.: Catequese"
                        />
                    </div>
                    <div className="campo" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="campoRotulo" htmlFor="numeroPessoas">Nº de pessoas</label>
                        <input
                            id="numeroPessoas"
                            className="campoInput"
                            type="number"
                            min="0"
                            value={numeroPessoas}
                            onChange={(e) => setNumeroPessoas(e.target.value)}
                            placeholder="0"
                            title="Quantas pessoas o grupo representa — soma ao total geral da refeição no dia em que o grupo estiver marcado"
                        />
                    </div>
                    <button className="botao botao--primario" onClick={id ? updateGrupo : createGrupo}>
                        <FiPlusCircle /> {id ? 'Atualizar' : 'Criar Grupo'}
                    </button>
                </div>
            </div>

            {grupos.length === 0 ? (
                <div className="estadoVazio cartao">
                    <div className="estadoVazio__icone"><FiUsers /></div>
                    <p>Ainda não existe nenhum grupo. Crie o primeiro acima.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                    {grupos.map((grupo) => (
                        <div key={grupo.id} className="cartao">
                            <div className="grupos-cabecalho" onClick={() => handleGrupoClick(grupo.id)}>
                                <div>
                                    <strong>{grupo.nome_grupo}</strong>{' '}
                                    <span className="distintivo distintivo--neutro">
                                        <FiUsers /> {grupo.numero_pessoas} pessoa{grupo.numero_pessoas === 1 ? '' : 's'}
                                    </span>
                                    {grupo.total_membros > 0 && (
                                        <span className="distintivo distintivo--neutro" style={{ marginLeft: 6 }}>
                                            {grupo.total_membros} nomeado{grupo.total_membros === 1 ? '' : 's'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="grupos-acoes">
                                <button className="botao botao--secundario botao--pequeno" onClick={() => {
                                    setNomeGrupo(grupo.nome_grupo);
                                    setNumeroPessoas(String(grupo.numero_pessoas ?? 0));
                                    setId(grupo.id);
                                }}><FiEdit2 /> Editar</button>
                                <button className="botao botao--perigo botao--pequeno" onClick={() => deleteGrupo(grupo.id)}>
                                    <FiTrash2 /> Apagar
                                </button>
                                <Link
                                    className="botao botao--azul botao--pequeno"
                                    to={`/AddGroupsToMeal?grupo_id=${grupo.id}`}
                                    title="Marcar este grupo para uma refeição (data, tipo e local)"
                                ><FiCalendar /> Marcar para Refeição</Link>
                            </div>

                            {selectedGrupo === grupo.id && (
                                <div className="grupos-membros">
                                    <div className="grupos-formLinha">
                                        <input
                                            className="campoInput"
                                            type="text"
                                            value={novoMembro[grupo.id] || ''}
                                            onChange={(e) => handleMembroChange(grupo.id, e.target.value)}
                                            placeholder="Nome do novo membro"
                                        />
                                        <button className="botao botao--secundario botao--pequeno" onClick={() => createMembro(grupo.id)}>
                                            <FiUserPlus /> Adicionar
                                        </button>
                                    </div>
                                    {membros[grupo.id]?.length > 0 && (
                                        <ul className="grupos-listaMembros">
                                            {membros[grupo.id].map((membro) => (
                                                <li key={membro.id}>
                                                    <span>{membro.nome_membro}</span>
                                                    <button className="botao botao--perigo botao--pequeno" onClick={() => deleteMembro(membro.id, grupo.id)}>
                                                        <FiTrash2 />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {refeicoesGrupo[grupo.id]?.length > 0 && (
                                        <>
                                            <p className="campoRotulo" style={{ marginTop: 16 }}>Marcado para estas refeições</p>
                                            <ul className="grupos-listaMembros">
                                                {refeicoesGrupo[grupo.id].map((rg) => (
                                                    <li key={rg.id}>
                                                        <span>
                                                            <FiCalendar style={{ verticalAlign: -2 }} /> {rg.tipo_refeicao} — {new Date(rg.data_refeicao + 'T00:00:00').toLocaleDateString('pt-PT')} às {String(rg.hora_refeicao).slice(0, 5)} · {rg.local_refeicao}
                                                        </span>
                                                        <button
                                                            className="botao botao--perigo botao--pequeno"
                                                            onClick={() => removerRefeicaoGrupo(rg.id, grupo.id)}
                                                            title="Remover o grupo desta refeição (o grupo em si mantém-se)"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Grupos;

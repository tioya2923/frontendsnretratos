import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import "../../Styles/updateUsuarios.css";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useConfirm } from '../../ConfirmDialog';
import {
    FiUserCheck, FiUsers, FiCalendar, FiShield, FiTrash2,
} from 'react-icons/fi';

const LINKS_GESTAO = [
    { to: '/InscreverVisita', label: 'Visitante', icon: <FiUserCheck /> },
    { to: '/gruposMembros', label: 'Adicionar Grupo', icon: <FiUsers /> },
    { to: '/AddGroupsToMeal', label: 'Refeições em Grupos', icon: <FiCalendar /> },
    { to: '/updateAdministradores', label: 'Administradores', icon: <FiShield /> },
];

const UpdateUsuarios = () => {
    const [users, setUsers] = useState([]);
    const [triggerUpdate, setTriggerUpdate] = useState(0);
    const confirmar = useConfirm();

    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

    const deleteUser = async (id) => {
        if (!(await confirmar('Tem a certeza de que deseja eliminar?'))) return;

        const adminToken = localStorage.getItem('adminToken');
        axios.delete(`${backendUrl}components/deleteUsuario.php?id=${id}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        })
            .then(response => {
                console.log(response);
                setTriggerUpdate(prevState => prevState + 1);
            })
            .catch(error => {
                console.error(`There was an error deleting the user: ${error}`);
                toast.error('Erro ao eliminar utilizador.');
            });
    }

    const getUsers = useCallback(() => {
        const adminToken = localStorage.getItem('adminToken');
        axios.get(`${backendUrl}components/updateUsuarios.php`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        })
            .then(response => {
                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    console.error('Data is not an array');
                }
            })
            .catch(error => {
                console.error(`There was an error retrieving the user list: ${error}`);
            });
    }, [backendUrl]); // Dependências do useCallback

    useEffect(() => {
        getUsers();
        const interval = setInterval(() => {
            if (!document.hidden) getUsers();
        }, 30000);
        const onVisible = () => { if (!document.hidden) getUsers(); };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [triggerUpdate, getUsers]);

    const distintivoEstado = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'aprovado') return <span className="distintivo distintivo--sucesso">Aprovado</span>;
        if (s === 'pendente') return <span className="distintivo distintivo--aviso">Pendente</span>;
        return <span className="distintivo distintivo--neutro">{status || '—'}</span>;
    };

    return (
        <div className="pagina pagina--larga">
            <h1 className="paginaTitulo">Painel de Gestão</h1>
            <p className="paginaSubtitulo">Acesso rápido às áreas de administração da app.</p>

            <nav className="gestaoGrid">
                {LINKS_GESTAO.map(({ to, label, icon }) => (
                    <Link to={to} key={to} className="gestaoCartao">
                        <span className="gestaoCartao__icone">{icon}</span>
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>

            <h2 style={{ marginTop: 48 }}>Participantes</h2>
            <p className="paginaSubtitulo" style={{ marginBottom: 20 }}>
                {users.length} pessoa{users.length === 1 ? '' : 's'} registada{users.length === 1 ? '' : 's'} na app.
            </p>

            {users.length === 0 ? (
                <div className="estadoVazio cartao">
                    <div className="estadoVazio__icone"><FiUsers /></div>
                    <p>Ainda não há participantes para mostrar.</p>
                </div>
            ) : (
                <div className="tabelaContainer">
                    <table className="tabela">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Estado</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{distintivoEstado(user.status)}</td>
                                    <td>
                                        <button className="botao botao--perigo botao--pequeno" onClick={() => deleteUser(user.id)}>
                                            <FiTrash2 /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UpdateUsuarios;

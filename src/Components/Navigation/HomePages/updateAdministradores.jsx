import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UpdateAdministradores = () => {
    const [users, setUsers] = useState([]);

    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

    // Memorize getUsers usando useCallback
    const getUsers = useCallback(() => {
        const adminToken = localStorage.getItem('adminToken');
        axios.get(`${backendUrl}components/updateAdministradores.php`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        })
            .then(response => {
                console.log(response.data);
                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    console.error('Data is not an array');
                }
            })
            .catch(error => {
                console.error(`Espere ou contacte o administrador: ${error}`);
            });
    }, [backendUrl]); // backendUrl é a dependência

    // Obter a lista de usuários quando o componente é montado
    useEffect(() => {
        getUsers();
        const interval = setInterval(() => {
            if (!document.hidden) getUsers();
        }, 60000);
        const onVisible = () => { if (!document.hidden) getUsers(); };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [getUsers]); // getUsers é agora uma dependência memorizada

    // A app só sabe se O PRÓPRIO admin é super a partir do login
    // (adminIsSuper em localStorage) — o backend continua a ser sempre a
    // autoridade real. Se ainda não existir nenhum super administrador,
    // mostra-se o link a qualquer admin, para não haver um beco sem saída
    // em que ninguém consegue criar o primeiro.
    const souSuper = localStorage.getItem('adminIsSuper') === '1';
    const nenhumSuperAinda = users.length > 0 && !users.some(u => Number(u.is_super) === 1);
    const podeCriarAdmin = souSuper || nenhumSuperAinda;

    return (
        <div>
            <h2>Administradores</h2>
            {podeCriarAdmin && (
                <p><Link to="/adPrivacidade">+ Adicionar Administrador</Link></p>
            )}
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Super</th>
                        <th>Data de Criação</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id_admin}>
                            <td>{user.name_admin}</td>
                            <td>{user.email_admin}</td>
                            <td>{Number(user.is_super) === 1 ? 'Sim' : 'Não'}</td>
                            <td>{user.created_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UpdateAdministradores;

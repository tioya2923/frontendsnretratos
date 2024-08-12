import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UpdateAdministradores = () => {
    const [users, setUsers] = useState([]);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // Memorize getUsers usando useCallback
    const getUsers = useCallback(() => {
        axios.get(`${backendUrl}components/updateAdministradores.php`)
            .then(response => {
                console.log(response.data);
                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    console.error('Data is not an array');
                }
            })
            .catch(error => {
                console.error(`Espere um pouco ou contacte o administrador: ${error}`);
            });
    }, [backendUrl]); // backendUrl é a dependência

    // Obter a lista de usuários quando o componente é montado
    useEffect(() => {
        getUsers();
    }, [getUsers]); // getUsers é agora uma dependência memorizada

    return (
        <div>
            <h2>Administradores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Data de Criação</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id_admin}>
                            <td>{user.name_admin}</td>
                            <td>{user.email_admin}</td>
                            <td>{user.created_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UpdateAdministradores;

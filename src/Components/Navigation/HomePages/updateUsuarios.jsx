import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import "../../Styles/updateUsuarios.css";
import { Link } from 'react-router-dom';

const UpdateUsuarios = () => {
    const [users, setUsers] = useState([]);
    const [triggerUpdate, setTriggerUpdate] = useState(0);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const deleteUser = (id) => {
        if (window.confirm('Tem a certeza de que deseja eliminar?')) {
            axios.delete(`${backendUrl}components/deleteUsuario.php?id=${id}`)
                .then(response => {
                    console.log(response);
                    alert('Usuário eliminado com sucesso');
                    setTriggerUpdate(prevState => prevState + 1);
                })
                .catch(error => {
                    console.error(`There was an error deleting the user: ${error}`);
                });
        }
    }

    const getUsers = useCallback(() => {
        axios.get(`${backendUrl}components/updateUsuarios.php`)
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
    }, [triggerUpdate, getUsers]);

    return (
        <div>
            <h2>Participantes</h2>
            <table>
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
                            <td>{user.status}</td>
                            <td><button className='button-delete' onClick={() => deleteUser(user.id)}>Eliminar</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <Link to="/adPrivacidade" style={{ textDecoration: 'none' }}><p>Área Privada</p></Link>
            </div>
        </div>
    );
};

export default UpdateUsuarios;
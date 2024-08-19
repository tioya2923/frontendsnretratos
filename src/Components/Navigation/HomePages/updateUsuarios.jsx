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
            <div>
                <div className="admini">
                    <div className="link-admini"><Link to="/insertImages" className='insert'>Inserir Ficheiros</Link></div>
                    <div className="link-admini"><Link to="/deletePhoto" className='insert'>Editar Ficheiros</Link></div>
                    <div className="link-admini"><Link to="/updateAdministradores" className='insert'>Administradores</Link></div>
                </div>
            </div>
            <h2>Participantes</h2>
            <div className='container-participantes'>
                <div className="user-grid">
                    {users.map(user => (
                        <div className="user-card" key={user.id}>
                            <div>
                                <h3>Nome:</h3>
                                <p>{user.name}</p>
                            </div>
                            <div>
                                <h3>E-mail:</h3>
                                <p>{user.email}</p>
                            </div>
                            <div>
                                <h3>Estado:</h3>
                                <p>{user.status}</p>
                            </div>
                            <div>
                                <h3>Ação:</h3>
                                <button className='button-delete' onClick={() => deleteUser(user.id)}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );





};

export default UpdateUsuarios;
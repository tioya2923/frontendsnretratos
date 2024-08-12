import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./AdPrivacidade.css";

const AdPrivacidade = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSuper, setIsSuper] = useState(false);


    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('is_super', isSuper ? 1 : 0);
        try {
            const response = await axios({
                method: 'post',
                url: `${backendUrl}components/regPrivacidade.php`,
                data: formData
            });

            const data = response.data;

            if (data === 'O email já está em uso') {
                alert('O email já está em uso');
            } else if (data === 'Registo bem-sucedido') {
                alert('Registo bem-sucedido');
            } else if (data === 'Apenas super administradores podem inserir outros administradores') {
                alert('Apenas super administradores podem inserir outros administradores');
            } else if (data === 'Usuário não encontrado') {
                alert('Usuário não encontrado');
            }

        } catch (error) {
            console.error('Erro ao registrar', error);
        }
    };


    return (
        <div className='titulo-ad'><h3>Adiconar novo Administrador</h3>

            <form onSubmit={handleSubmit} className='form-ad'>
                <label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder='Nome completo' />
                </label>
                <label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder='E-mail' />
                </label>
                <label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder='Palavra-passe' />
                </label>
                <label>
                    <div>
                        É super?
                        <input type="checkbox" checked={isSuper} onChange={(e) => setIsSuper(e.target.checked)} />
                    </div>
                </label>
                <button type="submit">Registar</button>
            </form>
            <Link to="/updateAdministradores" className="no-underline">
                <h3>Administradores</h3>
            </Link>


        </div>
    );
};

export default AdPrivacidade;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import "./AdPrivacidade.css";

const AdPrivacidade = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSuper, setIsSuper] = useState(false);


    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

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
                data: formData,
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });

            const data = response.data;

            // Casos de sucesso/validação — o backend devolve sempre 200 e
            // aqui só uma string simples (não {status, message}).
            if (data === 'Registo bem-sucedido') {
                toast.success('Registo bem-sucedido');
                setName('');
                setEmail('');
                setPassword('');
                setIsSuper(false);
            } else if (data === 'O email já está em uso') {
                toast.error('O email já está em uso');
            } else if (data === 'Dados inválidos') {
                toast.error('Preencha o nome e um email válido.');
            } else {
                toast.error('Erro no registo.');
            }

        } catch (error) {
            console.error('Erro ao registrar', error);
            // 401/403 (sem sessão de admin, ou sem ser super admin) vêm
            // por aqui — o backend devolve a mesma string simples.
            toast.error(error.response?.data || 'Erro ao registar administrador.');
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

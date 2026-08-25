import React, { useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify'; // ToastContainer é global (ver App.js)
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import './Login.css';



function Privacidade() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();


    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

    const handleSubmit = () => {
        const errors = validateInputs();
        if (errors.length > 0) {
            return;
        }
        const url = `${backendUrl}components/privacidade.php`;
        let fData = new FormData();
        fData.append('email', email);
        fData.append('password', password);
        axios.post(url, fData)
            .then(response => {
                const data = response.data;
                if (data && data.status === 'success') {
                    localStorage.setItem('adminToken', data.token);
                    localStorage.setItem('adminName', data.name);
                    // Usado para mostrar/esconder ações só de super admin
                    // (ex.: criar novos administradores) — o backend é
                    // sempre a autoridade real, isto é só para a UI.
                    localStorage.setItem('adminIsSuper', data.is_super ? '1' : '0');
                    setLoggedIn(true);
                } else if (data && data.message === 'área não permitida') {
                    toast.error('área não permitida');
                } else {
                    toast.error((data && data.message) || 'Email ou palavra passe incorretos');
                }
            })
            .catch(error => {
                // Nunca passar o objeto Error diretamente ao toast — o
                // react-toastify tenta renderizá-lo como filho React e
                // rebenta ("Objects are not valid as a React child"),
                // e como o ToastContainer é global (App.js), isso deixava
                // a app INTEIRA em branco, não só este formulário.
                if (error.response && error.response.data && error.response.data.message) {
                    toast.error('Erro: ' + error.response.data.message);
                } else {
                    toast.error('Erro de conexão. Tente novamente mais tarde.');
                }
            });
    }
    const validateInputs = () => {
        let errors = [];
        if (email.length === 0) {
            errors.push("Insira o seu email");
        } else if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
            errors.push("Insira um email válido");
        }
        if (password.length === 0) {
            errors.push("Insira a palavra passe");
        }
        document.getElementById("email-error").textContent = errors.find(e => e.includes("email")) || "";
        document.getElementById("password-error").textContent = errors.find(e => e.includes("palavra passe")) || "";
        return errors;
    }
    useEffect(() => {
        if (loggedIn) {
            navigate('/updateUsuarios'); // Use navigate para redirecionar
        }
    }, [loggedIn, navigate]); // Passa loggedIn como dependência do efeito
    return (
        <div className="container-form">
            <label htmlFor="email"></label>
            <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
            <span id="email-error" className="error"></span>
            <label htmlFor="password"></label>
            <div style={{ position: 'relative' }}>
                <input style={{ paddingRight: '130px' }} type={showPassword ? "text" : "password"} name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Palavra-passe" required />
                <i onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)' }}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </i>
            </div>
            <span id="password-error" className="error"></span>
            <button onClick={handleSubmit}>Entrar</button>
            <div className="login-form-register">
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FiArrowLeft /> Voltar ao login
                </Link>
            </div>
        </div>
    );
}
export default Privacidade;

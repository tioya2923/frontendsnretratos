import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [codigo, setCodigo] = useState('');
    const [message, setMessage] = useState('');


    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const handleSubmit = () => {
        const errors = validateInputs();
        if (errors.length > 0) {
            return;
        }

        if (message && !message.includes('Código correto')) { 
            toast.error('Por favor, verifique o código antes de entrar.'); 
            return; 
        }
        
        const url = `${backendUrl}components/login.php`;
        let fData = new FormData();
        fData.append('email', email);
        fData.append('password', password);
        axios.post(url, fData)
            .then(response => {
                if (response.data.message === 'Login bem-sucedido') {
                    toast.success('Login bem-sucedido');
                    setLoggedIn(true);
                } else if (response.data.message === 'A sua conta ainda não foi aprovada pelo administrador.') {
                    toast.error('A sua conta ainda não foi aprovada pelo administrador.');
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(error => {
                console.error(error.response.data);
                toast.error(error.response.data.message);
            });


    }
    const handleVerify = async (event) => {
        event.preventDefault();
        const data = JSON.stringify({ codigo });
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await axios.post(`${backendUrl}components/verifyCode.php`, data, config);
            setMessage(response.data.message);
        } catch (error) {
            console.error('Erro ao verificar o código:', error);
        }
    };
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
            navigate('/home'); // Use navigate para redirecionar
        }
    }, [loggedIn, navigate]); // Passa loggedIn como dependência do efeito
    return (
        <div className="container-login">
            <h1 className="login-form">Iniciar Sessão</h1>
            <div className="login-form">
                <div className="login-form-group">
                    <label htmlFor="email"></label>
                    <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className="form-field" />
                    <span id="email-error" className="form-error"></span>
                    <label htmlFor="password"></label>
                    <div style={{ position: 'relative' }} className="form-field">
                        <input type={showPassword ? "text" : "password"} name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Palavra-passe" required />
                        <i onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '15px' }}>
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </i>
                    </div>
                    <span id="password-error" className="form-error"></span>
                    <div className="form-field">
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)} placeholder="Código de verificação"
                        />
                        <button onClick={handleVerify} className="button-form">Verificar</button>
                        {message && <p>{message}</p>}
                    </div>
                    <button onClick={handleSubmit} className="button-form">Entrar</button>
                    <div className="login-form-register">
                        <Link to="/register">fazer registo</Link>
                    </div>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );

}
export default Login;

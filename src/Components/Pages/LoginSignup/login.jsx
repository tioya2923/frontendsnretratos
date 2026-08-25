import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify'; // ToastContainer é global (ver App.js)
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useUser } from '../../../UserContext';

function Login() {
    const { login } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();

    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

    const validateInputs = () => {
        let errors = [];
        let emailErr = "";
        let passwordErr = "";
        if (email.length === 0) {
            emailErr = "Insira o seu email";
            errors.push(emailErr);
        } else if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
            emailErr = "Insira um email válido";
            errors.push(emailErr);
        }
        if (password.length === 0) {
            passwordErr = "Insira a palavra passe";
            errors.push(passwordErr);
        }
        setEmailError(emailErr);
        setPasswordError(passwordErr);
        return errors;
    };

    const handleSubmit = () => {
        const errors = validateInputs();
        if (errors.length > 0) {
            return;
        }

        const url = `${backendUrl}components/login.php`;

        let fData = new FormData();
        fData.append('email', email);
        fData.append('password', password);
        axios.post(url, fData)
            .then(response => {
                if (response.data.message === 'Login bem-sucedido') {
                    // Atualiza o UserContext partilhado (estado + localStorage)
                    // em vez de escrever só no localStorage — sem isto, o resto
                    // da app (ex.: o botão de confirmar presença) continuava a
                    // ver o nome antigo/vazio até um recarregamento manual da
                    // página, porque o UserContext já estava montado antes do
                    // login e nunca era avisado da mudança.
                    login(response.data.name, response.data.token);
                    setLoggedIn(true);
                } else if (response.data.message === 'A sua conta ainda não foi aprovada pelo administrador.') {
                    toast.error('A sua conta ainda não foi aprovada pelo administrador.');
                } else {
                    toast.error('Falha no login. Verifique seus dados.');
                }
            })
            .catch(error => {
                if (error.response && error.response.data && error.response.data.message) {
                    toast.error('Erro: ' + error.response.data.message);
                } else {
                    toast.error('Erro de conexão. Tente novamente mais tarde.');
                }
            });
    };

    useEffect(() => {
        if (loggedIn) {
            navigate('/home');
        }
    }, [loggedIn, navigate]);

    return (
        <div className="container-login">
            <h1 className="login-title">Iniciar Sessão</h1>
            <div className="login-form">
                <div className="login-form-group">
                    <label htmlFor="email"></label>
                    <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className="form-field" />
                    <span className="form-error">{emailError}</span>
                    <label htmlFor="password"></label>
                    <div className="form-field">
                        <input type={showPassword ? "text" : "password"} name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Palavra-passe" required />
                        <i onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </i>
                    </div>
                    <span className="form-error">{passwordError}</span>
                    <button onClick={handleSubmit} className="button-form">Entrar</button>
                    <div className="login-form-register">
                        <Link to="/register">fazer registo</Link>
                    </div>
                    <div className="login-form-register">
                        <Link to="/esqueci-password">Esqueceu-se da palavra-passe?</Link>
                    </div>
                    <div className="unsubscribe-meals" style={{ marginTop: 12, textAlign: 'center' }}>
                        <span style={{ color: '#fff', fontSize: '0.98em' }}>
                            Deixarás de tomar as refeições connosco?{' '}
                            <p></p>
                            <Link to="/unsubscribe" style={{ color: '#ffd700', textDecoration: 'underline' }}>
                                Clique aqui.
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

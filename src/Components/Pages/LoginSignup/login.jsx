import React, { useState, useEffect } from "react";
import WhatsappForm from "./WhatsappForm";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showWhatsappForm, setShowWhatsappForm] = useState(false);
    const [pendingUserId, setPendingUserId] = useState(null);
    const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
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
                if (response.data.status === 'whatsapp_required') {
                    setPendingUserId(response.data.user_id);
                    setShowWhatsappForm(true);
                } else if (response.data.message === 'Login bem-sucedido') {
                    toast.success('Login bem-sucedido');
                    setUserName(response.data.name);
                    localStorage.setItem('userName', response.data.name);
                    localStorage.setItem('token', response.data.token);
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

    const handleWhatsappSubmit = (whatsappFull) => {
        setLoadingWhatsapp(true);
        // Enviar como FormData, pois o backend espera POST multipart/form-data
        let fData = new FormData();
        fData.append('id', pendingUserId);
        fData.append('whatsapp', whatsappFull);
        fData.append('action', 'updateWhatsapp');
        axios.post(`${backendUrl}components/updateUsuarios.php`, fData)
            .then(() => {
                toast.success('Número de WhatsApp atualizado! Fazendo login...');
                setShowWhatsappForm(false);
                // Tentar login automático após atualizar o WhatsApp
                const url = `${backendUrl}components/login.php`;
                let loginData = new FormData();
                loginData.append('email', email);
                loginData.append('password', password);
                axios.post(url, loginData)
                    .then(response => {
                        if (response.data.message === 'Login bem-sucedido') {
                            setUserName(response.data.name);
                            localStorage.setItem('userName', response.data.name);
                            localStorage.setItem('token', response.data.token);
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
            })
            .catch(() => {
                toast.error('Erro ao atualizar WhatsApp. Tente novamente.');
            })
            .finally(() => {
                setLoadingWhatsapp(false);
            });
    };

    useEffect(() => {
        if (loggedIn) {
            navigate('/home', { state: { userName } });
        }
    }, [loggedIn, navigate, userName]);

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
                    <div className="unsubscribe-meals" style={{ marginTop: 12, textAlign: 'center' }}>
                        <span style={{ color: '#fff', fontSize: '0.98em' }}>
                            Já não passará a tomar as refeições connosco?{' '}
                            <p></p>
                            <Link to="/unsubscribe" style={{ color: '#ffd700', textDecoration: 'underline' }}>
                                Clique aqui.
                            </Link>
                        </span>
                    </div>
                    {showWhatsappForm && (
                        <div style={{ background: 'rgba(0,0,0,0.7)', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px #0003', position: 'relative' }}>
                                <h3>Informe seu número de WhatsApp</h3>
                                <WhatsappForm onSubmit={handleWhatsappSubmit} loading={loadingWhatsapp} />
                                <button onClick={() => setShowWhatsappForm(false)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }} title="Fechar">×</button>
                            </div>
                        </div>
                    )}
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Login;

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function RedefinirPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            toast.error('A palavra-passe deve ter pelo menos 8 caracteres.');
            return;
        }
        if (password !== confirmar) {
            toast.error('As palavras-passe não coincidem.');
            return;
        }
        setEnviando(true);
        try {
            const { data } = await axios.post(`${backendUrl}components/redefinir_password.php`, { token, password });
            if (data.status === 'success') {
                setSucesso(true);
            } else {
                toast.error(data.message || 'Não foi possível redefinir a palavra-passe.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao processar o pedido. Tente novamente mais tarde.');
        } finally {
            setEnviando(false);
        }
    };

    if (!token) {
        return (
            <div className="pagina" style={{ maxWidth: 440 }}>
                <div className="estadoVazio cartao" style={{ borderTop: '4px solid var(--cor-erro)' }}>
                    <div className="estadoVazio__icone"><FiAlertCircle /></div>
                    <p>Este link é inválido. Peça um novo em "Esqueceu-se da palavra-passe?", na página de login.</p>
                </div>
                <p style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link to="/esqueci-password" className="linkVoltar">Pedir novo link</Link>
                </p>
            </div>
        );
    }

    return (
        <div className="pagina" style={{ maxWidth: 440 }}>
            <h1 className="paginaTitulo"><FiLock style={{ verticalAlign: -3 }} /> Nova Palavra-passe</h1>
            <p className="paginaSubtitulo">Escolha uma nova palavra-passe para a sua conta.</p>

            <div className="cartao cartao--destaque">
                {sucesso ? (
                    <>
                        <p className="distintivo distintivo--sucesso" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', padding: '10px 14px', marginBottom: 16 }}>
                            <FiCheckCircle /> Palavra-passe redefinida com sucesso.
                        </p>
                        <Link to="/login" className="botao botao--primario" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            Iniciar sessão
                        </Link>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="campo">
                            <label className="campoRotulo" htmlFor="password">Nova palavra-passe</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    className="campoInput"
                                    type={mostrar ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Mínimo 8 caracteres"
                                    style={{ paddingRight: 40 }}
                                />
                                <span
                                    onClick={() => setMostrar(!mostrar)}
                                    style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--cor-texto-suave)' }}
                                >
                                    {mostrar ? <FiEyeOff /> : <FiEye />}
                                </span>
                            </div>
                        </div>
                        <div className="campo">
                            <label className="campoRotulo" htmlFor="confirmar">Confirmar palavra-passe</label>
                            <input
                                id="confirmar"
                                className="campoInput"
                                type={mostrar ? 'text' : 'password'}
                                value={confirmar}
                                onChange={(e) => setConfirmar(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="botao botao--primario" disabled={enviando} style={{ width: '100%' }}>
                            {enviando ? 'A guardar…' : 'Redefinir palavra-passe'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

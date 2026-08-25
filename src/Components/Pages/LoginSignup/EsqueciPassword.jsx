import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function EsqueciPassword() {
    const [email, setEmail] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
            await axios.post(`${backendUrl}components/esqueci_password.php`, { email });
            // A resposta é sempre a mesma mensagem genérica, exista ou não a
            // conta — por isso não há nada a distinguir aqui, só mostrar o
            // ecrã de "verifique o seu email".
            setEnviado(true);
        } catch (err) {
            toast.error('Erro ao processar o pedido. Tente novamente mais tarde.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="pagina" style={{ maxWidth: 440 }}>
            <h1 className="paginaTitulo"><FiMail style={{ verticalAlign: -3 }} /> Recuperar Palavra-passe</h1>
            <p className="paginaSubtitulo">Indique o email da sua conta e enviamos um link para definir uma nova palavra-passe.</p>

            <div className="cartao cartao--destaque">
                {enviado ? (
                    <p className="distintivo distintivo--sucesso" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', padding: '10px 14px' }}>
                        <FiCheckCircle /> Se esse email estiver registado, vai receber um link para redefinir a palavra-passe. Verifique também a pasta de spam.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="campo">
                            <label className="campoRotulo" htmlFor="email">Email</label>
                            <input
                                id="email"
                                className="campoInput"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="nome@exemplo.com"
                            />
                        </div>
                        <button type="submit" className="botao botao--primario" disabled={enviando} style={{ width: '100%' }}>
                            {enviando ? 'A enviar…' : 'Enviar link de recuperação'}
                        </button>
                    </form>
                )}
            </div>

            <p style={{ textAlign: 'center', marginTop: 20 }}>
                <Link to="/login" className="linkVoltar">
                    <FiArrowLeft /> Voltar ao login
                </Link>
            </p>
        </div>
    );
}

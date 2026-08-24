import React, { useState } from "react";
import axios from "axios";
import { FiCoffee, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function Unsubscribe() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // URL do backend
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    setStatus(null);
    setEnviando(true);

    try {
      const url = `${backendUrl}components/unsubscribe.php`;

      const response = await axios.post(url, {
        email: email.trim(),
        password
      });

      if (response.data.status === "success") {
        setStatus("success");
      } else {
        setStatus("error");
      }

    } catch (err) {
      if (err.response && err.response.status === 404) {
        setStatus("notfound");
      } else {
        setStatus("error");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pagina" style={{ maxWidth: 440 }}>
      <h1 className="paginaTitulo">É sempre difícil dizer adeus!</h1>
      <p className="paginaSubtitulo">Vamos sentir a sua falta à mesa.</p>

      <div className="cartao cartao--destaque">
        <form onSubmit={handleUnsubscribe}>
          <div className="campo">
            <label className="campoRotulo" htmlFor="email">Email usado no registo</label>
            <input
              id="email"
              className="campoInput"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="nome@exemplo.com"
            />
          </div>
          <div className="campo">
            <label className="campoRotulo" htmlFor="password">Palavra-passe, para confirmar que és mesmo tu</label>
            <input
              id="password"
              className="campoInput"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Palavra-passe"
            />
          </div>
          <button type="submit" className="botao botao--perigo" disabled={enviando} style={{ width: '100%' }}>
            {enviando ? 'A processar…' : 'Deixar de receber mensagens'}
          </button>
        </form>

        {status === "success" && (
          <p className="distintivo distintivo--sucesso" style={{ marginTop: 16 }}>
            <FiCheckCircle /> Foi removido da lista de mensagens.
          </p>
        )}
        {status === "notfound" && (
          <p className="distintivo distintivo--erro" style={{ marginTop: 16 }}>
            <FiAlertCircle /> Email inválido.
          </p>
        )}
        {status === "error" && (
          <p className="distintivo distintivo--erro" style={{ marginTop: 16 }}>
            <FiAlertCircle /> Erro ao processar. Tente novamente.
          </p>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--cor-texto-suave)' }}>
        <FiCoffee style={{ verticalAlign: -2 }} /> Venha sempre que quiser tomar um café connosco!
      </p>
    </div>
  );
}

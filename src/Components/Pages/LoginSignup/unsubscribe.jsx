import React, { useState } from "react";
import axios from "axios";

export default function Unsubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  // URL do backend
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const url = `${backendUrl}components/unsubscribe.php`;

      const response = await axios.post(url, {
        email: email.trim()
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
    }
  };

  return (
    <div className="unsubscribe-wrapper" style={{ maxWidth: 400, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 8 }}>
      <h2>É sempre difícil dizer adeus!</h2>
      <form onSubmit={handleUnsubscribe}>
        <label htmlFor="email">Insira aqui o email usado no registo:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: "100%", margin: "12px 0", padding: 8 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10, background: "#a05c5c", color: "#fff", border: "none", borderRadius: 4 }}>
          Deixar de receber mensagens
        </button>
        <p>Venha sempre que quiseres tomar um café connosco!</p>
      </form>

      {status === "success" && <p style={{ color: "green" }}>Você foi removido da lista de mensagens.</p>}
      {status === "notfound" && <p style={{ color: "red" }}>Email inválido.</p>}
      {status === "error" && <p style={{ color: "red" }}>Erro ao processar. Tente novamente.</p>}
    </div>
  );
}

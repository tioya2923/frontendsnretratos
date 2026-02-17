import React, { useRef, useState } from "react";
import axios from "axios";
import '../Styles/InsertImages.css'

function InsertImages() {
  const fileInput = useRef(null);
  const [nome, setNome] = useState("");
  const [pasta, setPasta] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [dataCriacao, setDataCriacao] = useState(""); // Adicione este
  const [result, setResult] = useState("");

  const backendUrl = process.env.REACT_APP_BACKEND_URL.endsWith('/') ? process.env.REACT_APP_BACKEND_URL : process.env.REACT_APP_BACKEND_URL + '/';

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("pasta", pasta);
    formData.append("nomeUsuario", nomeUsuario);
    formData.append("dataCriacao", dataCriacao); // Adicione este
    for (let i = 0; i < fileInput.current.files.length; i++) {
      formData.append("file[]", fileInput.current.files[i]);
    }

    axios.post(`${backendUrl}components/insertFotografias.php`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      setResult(response.data);
      setNome("");
      setPasta("");
      setNomeUsuario("");
      setDataCriacao(""); // Adicione este
      fileInput.current.value = null;
    })
    .catch((error) => {
      if (error.response && error.response.data && error.response.data.message) {
        setResult('Erro: ' + error.response.data.message);
      } else {
        setResult('Erro de conexão. Tente novamente mais tarde.');
      }
    });
  };

  return (
    <div className="FotoForm">
      <h1>Selecione um ou mais arquivos</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" id="nomeUsuario" name="nomeUsuario" placeholder="Seu nome" value={nomeUsuario} onChange={e => setNomeUsuario(e.target.value)} />
        <br />
        <input type="text" id="pasta" name="pasta" placeholder="Nome da pasta" value={pasta} onChange={e => setPasta(e.target.value)} />
        <br />
        <input type="date" id="dataCriacao" name="dataCriacao" value={dataCriacao} onChange={e => setDataCriacao(e.target.value)} /> {/* Adicione este */}
        <br />
        <input type="file" id="file" name="file" accept="image/*,video/*" ref={fileInput} multiple />
        <br />
        <button type="submit">Enviar</button>
      </form>
      <h3>{result}</h3>
    </div>
  );
}

export default InsertImages;

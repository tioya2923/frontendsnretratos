import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/InserirNomeConf.css'; // Importar o arquivo CSS

const InserirNomeConf = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [nomes, setNomes] = useState([]);
    const [mensagem, setMensagem] = useState('');

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        axios.get(`${backendUrl}components/nomes_predefinidos.php`)
            .then(response => {
                setNomes(response.data.sort((a, b) => a.nome.localeCompare(b.nome)));
            })
            .catch(error => console.error('Erro ao buscar nomes predefinidos:', error));
    }, [backendUrl]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { nome, email };
        console.log('Dados enviados:', data); // Adicione este log
        if (!nomes.some(n => n.nome === nome)) {
            axios.post(`${backendUrl}components/nomes_predefinidos.php`, data)
                .then(response => {
                    setMensagem(response.data.message);
                    const novosNomes = [...nomes, data].sort((a, b) => a.nome.localeCompare(b.nome));
                    setNomes(novosNomes);
                    setNome('');
                    setEmail('');
                })
                .catch(error => console.error('Erro ao adicionar nome:', error));
        } else {
            setMensagem('Este nome já está na lista.');
        }
    };

    return (
        <div className="insert-nome-conf-container">
            <h4>Adicionar Sacerdote para Missas e Confissões</h4>
            <form onSubmit={handleSubmit} className="insert-form">
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome"
                    required
                    className="insert-input"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="insert-input"
                />
                <button type="submit" className="insert-button">Adicionar</button>
            </form>
            {mensagem && <p className="insert-mensagem">{mensagem}</p>}
            <h4>Nomes dos Sacerdotes</h4>
            <ul className="insert-nomes-lista">
                {nomes.map((item, index) => (
                    <li key={index} className="insert-nome-item">
                        <strong>Nome:</strong> {item.nome}<br />
                        <strong>Email:</strong> {item.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InserirNomeConf;

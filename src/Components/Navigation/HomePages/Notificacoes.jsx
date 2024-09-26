import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../Styles/Notificacoes.css'; // Certifique-se de importar o arquivo CSS

const Notificacoes = () => {
    const [notificacoes, setNotificacoes] = useState([]);
    const [refeicoes, setRefeicoes] = useState([]);
    const [error, setError] = useState(null);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchNotificacoes = async () => {
            try {
                const response = await axios.get(`${backendUrl}components/notificar_refeicoes.php`);
                console.log('Notificações carregadas:', response.data);
                setNotificacoes(response.data);
            } catch (err) {
                setError(err.message);
            }
        };

        const mockRefeicoes = [
            { data: '2024-09-23', hora: '12:00', tipo_refeicao: 'Almoço', local_refeicao: 'Restaurante A' },
            { data: '2024-09-24', hora: '19:00', tipo_refeicao: 'Jantar', local_refeicao: 'Restaurante B' }
        ];
        setRefeicoes(mockRefeicoes);

        fetchNotificacoes();
    }, [backendUrl]);

    useEffect(() => {
        const verificarNotificacoes = () => {
            const agora = new Date();
            console.log('Hora atual:', agora);
            const notificacoesTemp = refeicoes.filter(refeicao => {
                const dataRefeicao = new Date(`${refeicao.data}T${refeicao.hora}:00`);
                console.log('Data da refeição:', dataRefeicao);
                const diferencaHoras = (dataRefeicao - agora) / (1000 * 60 * 60);
                console.log('Diferença em horas:', diferencaHoras);
                return diferencaHoras <= 24 && diferencaHoras >= 0;
            }).map(refeicao => ({
                tipo: refeicao.tipo_refeicao,
                data: refeicao.data,
                hora: refeicao.hora,
                local: refeicao.local_refeicao,
                nome_grupo: refeicao.nome_grupo,
                total_membros: refeicao.total_membros
            }));
            setNotificacoes(notificacoesTemp);
        };

        verificarNotificacoes();

        const intervalId = setInterval(verificarNotificacoes, 60000);

        return () => clearInterval(intervalId);
    }, [refeicoes]);

    return (
        <div className="notificacoes-container">          
            {error && <p className="erro">Erro: {error}</p>}
            {notificacoes.length > 0 && (
                <table className="tabela-notificacoes">
                    <thead>
                        <tr>
                            <th>Refeição</th>
                            <th>Data</th>
                            <th>Hora</th>
                            <th>Local</th>
                            <th>Grupo</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notificacoes.map((notificacao, index) => (
                            <tr key={index}>
                                <td>{notificacao.tipo}</td>
                                <td>{notificacao.data}</td>
                                <td>{notificacao.hora}</td>
                                <td>{notificacao.local}</td>
                                <td>{notificacao.nome_grupo}</td>
                                <td>{notificacao.total_membros}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Notificacoes;

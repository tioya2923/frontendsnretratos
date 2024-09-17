import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../Styles/InscritosRefeicoes.css'; // Importar o arquivo CSS

const InscritosRefeicoes = () => {
    const [refeicoes, setRefeicoes] = useState([]);
    const [semana, setSemana] = useState('');

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        // Buscar refeições
        axios.get(`${backendUrl}components/refeicoes.php`)
            .then(response => {
                if (Array.isArray(response.data)) {
                    setRefeicoes(response.data);
                } else {
                    console.error('A resposta não é um array:', response.data);
                }
            })
            .catch(error => console.error('Erro ao buscar refeições:', error));

        // Calcular o intervalo de datas dos próximos 7 dias
        const hoje = new Date();
        const primeiroDia = new Date(hoje);
        const ultimoDia = new Date(hoje);
        ultimoDia.setDate(hoje.getDate() + 6);
        const formatoData = { day: 'numeric', month: 'long' };

        const intervaloSemana = `${capitalizeFirstLetter(primeiroDia.toLocaleDateString('pt-PT', formatoData))} a ${capitalizeFirstLetter(ultimoDia.toLocaleDateString('pt-PT', formatoData))}`;
        setSemana(intervaloSemana);
    }, [backendUrl]);

    const handleDelete = (id, dataRefeicao) => {
        const hoje = new Date().toDateString();
        const dataRefeicaoStr = new Date(dataRefeicao).toDateString();

        if (hoje !== dataRefeicaoStr) {
            axios.delete(`${backendUrl}components/refeicoes.php`, { data: { id } })
                .then(response => {
                    console.log(response.data);
                    setRefeicoes(prevRefeicoes => prevRefeicoes.filter(refeicao => refeicao.id !== id));
                })
                .catch(error => console.error('Erro ao excluir refeição:', error));
        }
    };

    const getHoraRefeicao = (data, tipo) => {
        const diaSemana = new Date(data).getDay();
        if (tipo === 'almoco') {
            return '13h30';
        } else if (tipo === 'jantar') {
            return diaSemana === 0 ? '20h30' : '20h00'; // 0 representa Domingo
        }
        return '';
    };

    const organizarPorDiaDaSemana = (refeicoes) => {
        const hoje = new Date();
        const diasFuturos = Array.from({ length: 7 }, (_, i) => {
            const dia = new Date(hoje);
            dia.setDate(hoje.getDate() + i);
            return dia;
        });

        const refeicoesOrganizadas = diasFuturos.map(dia => ({
            dia,
            refeicoes: refeicoes.filter(refeicao => {
                const dataRefeicao = new Date(refeicao.data);
                return dataRefeicao.toDateString() === dia.toDateString();
            })
        }));

        return refeicoesOrganizadas;
    };

    const capitalizeFirstLetter = (string) => {
        return string.split(' ').map(word => {
            if (word.toLowerCase() === 'de') {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };

    const formatarData = (data) => {
        const formatoData = { weekday: 'long', day: 'numeric', month: 'long' };
        const dataFormatada = new Date(data).toLocaleDateString('pt-PT', formatoData);
        return capitalizeFirstLetter(dataFormatada);
    };

    const refeicoesOrganizadas = organizarPorDiaDaSemana(refeicoes);

    return (
        <div className="inscritos-container">
            <h4>Lista de Inscritos para Refeições para {semana}</h4>
            {refeicoesOrganizadas.map((dia, index) => (
                <div key={index}>
                    <h5>{formatarData(dia.dia)}</h5>
                    <div className="refeicao-tipo almoco">
                        <h6>Almoço: 13h30</h6>
                        <ul>
                            {dia.refeicoes.filter(refeicao => refeicao.tipo_refeicao === 'almoco')
                                .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo))
                                .map((refeicao, i) => (
                                    <li key={i}>
                                       {refeicao.nome_completo}
                                        <button onClick={() => handleDelete(refeicao.id, refeicao.data)}>Não vem</button>
                                    </li>
                                ))}
                        </ul>
                        <p>Total de inscritos: {dia.refeicoes.filter(refeicao => refeicao.tipo_refeicao === 'almoco').length}</p>
                    </div>
                    <div className="refeicao-tipo jantar">
                        <h6>Jantar: {getHoraRefeicao(dia.dia, 'jantar')}</h6>
                        <ul>
                            {dia.refeicoes.filter(refeicao => refeicao.tipo_refeicao === 'jantar')
                                .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo))
                                .map((refeicao, i) => (
                                    <li key={i}>
                                        {refeicao.nome_completo}
                                        <button onClick={() => handleDelete(refeicao.id, refeicao.data)}>Não vem</button>
                                    </li>
                                ))}
                        </ul>
                        <p>Total de inscritos: {dia.refeicoes.filter(refeicao => refeicao.tipo_refeicao === 'jantar').length}</p>
                    </div>
                </div>
            ))}
            <Link to="/refeicoes" className="inscricao-link">Fazer inscrição</Link>
        </div>
    );
};

export default InscritosRefeicoes;

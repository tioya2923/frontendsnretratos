import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../Styles/InserirNome.css'; // Importar o arquivo CSS

const InserirRefeicao = () => {
    const [novaRefeicao, setNovaRefeicao] = useState({ nome: '', horario_inicio: '', horario_fim: '', dia_semana: '', data: '' });
    const [refeicoes, setRefeicoes] = useState([]);
    const [erroNome, setErroNome] = useState({});
    const [nomesPredefinidos, setNomesPredefinidos] = useState([]);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        axios.get(`${backendUrl}components/nomes_predefinidos.php`)
            .then(response => {
                const nomesOrdenados = response.data.sort((a, b) => a.nome.localeCompare(b.nome));
                setNomesPredefinidos(nomesOrdenados);
            })
            .catch(error => error('Erro ao buscar nomes predefinidos:', error));
    }, [backendUrl]);

    const handleSubmit = (e, horario_inicio, horario_fim, dia_semana, data) => {
        e.preventDefault();
        const novaRefeicaoTemp = { ...novaRefeicao, horario_inicio, horario_fim, dia_semana, data };
        if (validarNome(novaRefeicao.nome)) {
            if (!nomeRepetido(novaRefeicaoTemp)) {
                axios.post(`${backendUrl}components/confissoes.php`, novaRefeicaoTemp)
                    .then(response => {
                        
                        setRefeicoes([...refeicoes, novaRefeicaoTemp]);
                        setNovaRefeicao({ nome: '', horario_inicio: '', horario_fim: '', dia_semana: '', data: '' });
                        setErroNome({});
                    })
                    .catch(error => error('Erro ao adicionar refeição:', error));
            } else {
                setErroNome({ ...erroNome, [`${horario_inicio}-${horario_fim}-${dia_semana}-${data}`]: 'Sacerdote já inserido para este horário.' });
            }
        } else {
            setErroNome({ ...erroNome, [`${horario_inicio}-${horario_fim}-${dia_semana}-${data}`]: 'Por favor, insira um nome válido da lista predefinida.' });
        }
    };

    const handleInputChange = (e, horario_inicio, horario_fim, dia_semana, data) => {
        setNovaRefeicao({ ...novaRefeicao, [e.target.name]: e.target.value, horario_inicio, horario_fim, dia_semana, data });
        setErroNome({ ...erroNome, [`${horario_inicio}-${horario_fim}-${dia_semana}-${data}`]: '' });
    };

    const validarNome = (nome) => {
        return nomesPredefinidos.some(n => n.nome === nome);
    };

    const nomeRepetido = (novaRefeicao) => {
        return refeicoes.some(refeicao =>
            refeicao.nome === novaRefeicao.nome &&
            refeicao.horario_inicio === novaRefeicao.horario_inicio &&
            refeicao.horario_fim === novaRefeicao.horario_fim &&
            refeicao.dia_semana === novaRefeicao.dia_semana &&
            refeicao.data === novaRefeicao.data
        );
    };

    const horarios = [
        { inicio: '10:30', fim: '12:00' }, { inicio: '12:00', fim: '13:30' },
        { inicio: '13:30', fim: '15:30' }, { inicio: '15:30', fim: '17:00' },
        { inicio: '17:00', fim: '18:30' }, { inicio: '18:30', fim: '20:00' },
        { inicio: '20:00', fim: '21:30' }, { inicio: '21:30', fim: '23:00' },
        { inicio: '23:00', fim: '01:30' }
    ];

    const hoje = new Date();
    const primeiroDiaSemana = hoje.getDate() - hoje.getDay(); // Obter o primeiro dia da semana (domingo)
    const datasSemana = Array.from({ length: 14 }, (_, i) => {
        const dia = new Date(hoje);
        dia.setDate(primeiroDiaSemana + i);
        return {
            diaSemana: dia.toLocaleDateString('pt-PT', { weekday: 'long' }),
            data: dia.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
        };
    });

    const primeiraSemana = datasSemana.slice(0, 7);
    const segundaSemana = datasSemana.slice(7);

    const formatarData = (data) => {
        const partes = data.split(' de ');
        partes[1] = partes[1].charAt(0).toUpperCase() + partes[1].slice(1);
        return partes.join(' de ');
    };

    return (
        <div className="insert-inserir-refeicao-container">
            {[primeiraSemana, segundaSemana].map((semana, index) => (
                <div key={index}>
                    <h4>Adicionar Confissões para {formatarData(semana[0].data)} a {formatarData(semana[6].data)}</h4>
                    <form className="insert-form" onSubmit={(e) => handleSubmit(e, novaRefeicao.horario_inicio, novaRefeicao.horario_fim, novaRefeicao.dia_semana, novaRefeicao.data)}>
                        <table className="insert-tabela-refeicoes">
                            <thead>
                                <tr>
                                    <th>Horário</th>
                                    {semana.map((data, index) => (
                                        <th key={index}>
                                            {data.diaSemana.charAt(0).toUpperCase() + data.diaSemana.slice(1)}
                                            <br />
                                            <span className="insert-data-dia">{formatarData(data.data)}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {horarios.map((horario, i) => (
                                    <tr key={i}>
                                        <td>{`${horario.inicio}/${horario.fim}`}</td>
                                        {semana.map((data, j) => (
                                            <td key={j}>
                                                <select
                                                    name="nome"
                                                    value={novaRefeicao.horario_inicio === horario.inicio && novaRefeicao.horario_fim === horario.fim && novaRefeicao.dia_semana === data.diaSemana && novaRefeicao.data === data.data ? novaRefeicao.nome : ''}
                                                    onChange={(e) => handleInputChange(e, horario.inicio, horario.fim, data.diaSemana, data.data)}
                                                    className="insert-input"
                                                >
                                                    <option value="">Selecione um nome</option>
                                                    {nomesPredefinidos.map((nome, index) => (
                                                        <option key={index} value={nome.nome}>{nome.nome}</option>
                                                    ))}
                                                </select>
                                                <button type="submit" className="insert-button">Inserir</button>
                                                {erroNome[`${horario.inicio}-${horario.fim}-${data.diaSemana}-${data.data}`] && (
                                                    <p className="insert-erro">{erroNome[`${horario.inicio}-${horario.fim}-${data.diaSemana}-${data.data}`]}</p>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </form>
                </div>
            ))}
            <Link to="/InserirNomeConf" className="insert-inscricao-link">Inserir Sacerdote</Link>
        </div>
    );
};

export default InserirRefeicao;

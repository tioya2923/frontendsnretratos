import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../Styles/InscritosRefeicoes.css'; // Importar o arquivo CSS

const InscritosRefeicoes = () => {
    const [refeicoes, setRefeicoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null); // Estado para controlar o nome selecionado
    const [nomes, setNomes] = useState([]); // Estado para armazenar os nomes e datas de aniversário
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchRefeicoes = async () => {
            try {
                const response = await axios.get(`${backendUrl}components/refeicoes.php`);
                setRefeicoes(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchNomes = async () => {
            try {
                const response = await axios.get(`${backendUrl}components/nomes.php`);
                console.log('Nomes:', response.data); // Verificar se os dados estão corretos
                setNomes(response.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchRefeicoes();
        fetchNomes();
    }, [backendUrl]);

    const handleDelete = async (id) => {
        const refeicao = refeicoes.find(refeicao => refeicao.id === id);
        const dataRefeicao = new Date(refeicao.data);
        const agora = new Date();
        const diferencaHoras = (dataRefeicao - agora) / (1000 * 60 * 60);
    
        if (diferencaHoras > 24) {
            try {
                await axios.delete(`${backendUrl}components/refeicoes.php`, { data: { id } });
                setRefeicoes(refeicoes.filter(refeicao => refeicao.id !== id));
            } catch (err) {
                setError(err.message);
            }
        } else {
            alert('Não é possível eliminar o nome 24 horas antes da refeição.');
        }
    };

    const handleClick = (event, id) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedId(id);
    };

    const isBirthday = (data, aniversario) => {
        const dataAtual = new Date(data);
        const dataAniversario = new Date(aniversario);
        dataAniversario.setFullYear(dataAtual.getFullYear());
    
        const umDiaAntes = new Date(dataAniversario);
        umDiaAntes.setDate(dataAniversario.getDate() - 1);
    
        const dataAtualStr = dataAtual.toISOString().split('T')[0];
        const dataAniversarioStr = dataAniversario.toISOString().split('T')[0];
        const umDiaAntesStr = umDiaAntes.toISOString().split('T')[0];
    
        const isBirthday = dataAtualStr >= umDiaAntesStr && dataAtualStr <= dataAniversarioStr;
        
        return isBirthday;
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return <p>Erro: {error}</p>;
    }

    const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    const tiposRefeicoesAlmoco = [
        { tipo: 'Almoço', filtro: refeicao => refeicao.almoco },
        { tipo: 'Mais Cedo', filtro: refeicao => refeicao.almoco_mais_cedo },
        { tipo: 'Mais Tarde', filtro: refeicao => refeicao.almoco_mais_tarde }
    ];

    const tiposRefeicoesJantar = [
        { tipo: 'Jantar', filtro: refeicao => refeicao.jantar },
        { tipo: 'Mais Cedo', filtro: refeicao => refeicao.jantar_mais_cedo },
        { tipo: 'Mais Tarde', filtro: refeicao => refeicao.jantar_mais_tarde },
        { tipo: 'Takeaway', filtro: refeicao => refeicao.levar_refeicao }
    ];

    const feriadosFixos = {
        '01/01': 'Ano Novo',
        '25/04': 'Dia da Liberdade',
        '01/05': 'Dia do Trabalhador',
        '10/06': 'Dia de Portugal',
        '13/06': 'Dia de Santo António',
        '15/08': 'Assunção de Nossa Senhora',
        '05/10': 'Implantação da República',
        '01/11': 'Dia de Todos os Santos',
        '01/12': 'Restauração da Independência',
        '08/12': 'Imaculada Conceição',
        '25/12': 'Natal do Senhor'
    };

    const feriadosVariaveis = (ano) => {
        // Função para calcular a data do Carnaval e da Sexta-feira Santa
        const calcularFeriados = (ano) => {
            const pascoa = new Date(ano, 2, 31);
            pascoa.setDate(pascoa.getDate() + (7 - pascoa.getDay()));
            const carnaval = new Date(pascoa);
            carnaval.setDate(pascoa.getDate() - 47);
            const sextaFeiraSanta = new Date(pascoa);
            sextaFeiraSanta.setDate(pascoa.getDate() - 2);
            return {
                carnaval: carnaval.toLocaleDateString(),
                sextaFeiraSanta: sextaFeiraSanta.toLocaleDateString()
            };
        };
        return calcularFeriados(ano);
    };

    const organizarPorDia = (refeicoes) => {
        const hoje = new Date();
        const seteDias = Array.from({ length: 7 }, (_, i) => {
            const data = new Date();
            data.setDate(hoje.getDate() + i);
            return data;
        });

        const refeicoesPorDia = seteDias.map(data => {
            const dataFormatada = data.toLocaleDateString();
            const feriado = feriadosFixos[dataFormatada] || Object.values(feriadosVariaveis(data.getFullYear())).find(f => f === dataFormatada);

            const aniversariantesNatalicio = nomes.filter(nome => isBirthday(data, nome.data_aniversario));
            const aniversariantesSacerdotal = nomes.filter(nome => isBirthday(data, nome.data_aniversario_sacerdotal));

            return {
                dia: diasDaSemana[data.getDay()],
                data: dataFormatada,
                feriado: feriado || '',
                aniversariantesNatalicio: aniversariantesNatalicio.map(nome => nome.nome_completo),
                aniversariantesSacerdotal: aniversariantesSacerdotal.map(nome => nome.nome_completo),
                refeicoes: refeicoes.filter(refeicao => {
                    const dataRefeicao = new Date(refeicao.data);
                    if (refeicao.levar_refeicao) {
                        dataRefeicao.setDate(dataRefeicao.getDate() - 1);
                    }
                    return dataRefeicao.toDateString() === data.toDateString();
                }),
                horarioJantar: (data.getDay() === 0 || feriado) ? '20h30' : '20h00'
            };
        });

        return refeicoesPorDia;
    };

    const refeicoesOrganizadas = organizarPorDia(refeicoes);

    return (
        <div className='calendarioContainer'>
            <h1 className='calendarioTitulo'>Mapa para as Refeições</h1>
            {refeicoesOrganizadas.map(({ dia, data, feriado, aniversariantesNatalicio, aniversariantesSacerdotal, refeicoes, horarioJantar }) => (
                <div className='calendarioData' key={data}>
                    <h2 className='calendarioDiaData'>{dia}: {data}</h2>
                    {feriado && <p><strong>{feriado}</strong></p>}
                    {aniversariantesNatalicio.length > 0 && (
                        <p className='calenderAniversario'> <strong>Aniversariante do dia: {aniversariantesNatalicio.join(', ')}</strong></p>
                    )}
                    {aniversariantesSacerdotal.length > 0 && (
                        <p className='calenderAniversario'><strong>Aniversário Sacerdotal: {aniversariantesSacerdotal.join(', ')}</strong></p>
                    )}
                    
                    <h3 className='calendarioDiaData'>Almoço: 13h30</h3>
                    <table className='calendarioTipo'>
                        <thead>
                            <tr>
                                {tiposRefeicoesAlmoco.map(({ tipo, filtro }) => {
                                    const total = refeicoes.filter(filtro).length;
                                    return total > 0 && <th key={tipo}>{tipo}</th>;
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {tiposRefeicoesAlmoco.map(({ tipo, filtro }) => {
                                    const inscritos = refeicoes.filter(filtro);
                                    return inscritos.length > 0 && (
                                        <td key={tipo}>
                                            <ul>
                                                {inscritos.map((refeicao) => (
                                                    <li key={refeicao.id} className="nomeContainer" onClick={(event) => handleClick(event, refeicao.id)}>
                                                        {refeicao.nome_completo}
                                                        {selectedId === refeicao.id && (
                                                            <button className="calendarioButton" onClick={() => handleDelete(refeicao.id)}>Não vem</button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                {tiposRefeicoesAlmoco.map(({ tipo, filtro }) => {
                                    const total = refeicoes.filter(filtro).length;
                                    return total > 0 && (
                                        <td key={tipo}>
                                            <p>Total: {total}</p>
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td colSpan={tiposRefeicoesAlmoco.length}>
                                    <p><strong>Total Geral para o Almoço: {refeicoes.filter(refeicao => refeicao.almoco || refeicao.almoco_mais_cedo || refeicao.almoco_mais_tarde).length}</strong></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <h3>Jantar: {horarioJantar}</h3>
                    <table>
                        <thead>
                            <tr>
                                {tiposRefeicoesJantar.map(({ tipo, filtro }) => {
                                    const total = refeicoes.filter(filtro).length;
                                    return total > 0 && <th key={tipo}>{tipo}</th>;
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {tiposRefeicoesJantar.map(({ tipo, filtro }) => {
                                    const inscritos = refeicoes.filter(filtro);
                                    return inscritos.length > 0 && (
                                        <td key={tipo}>
                                            <ul>
                                                {inscritos.map((refeicao) => (
                                                    <li key={refeicao.id} className="nomeContainer" onClick={(event) => handleClick(event, refeicao.id)}>
                                                        {refeicao.nome_completo}
                                                        {selectedId === refeicao.id && (
                                                            <button className="calendarioButton" onClick={() => handleDelete(refeicao.id)}>Não vem</button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                {tiposRefeicoesJantar.map(({ tipo, filtro }) => {
                                    const total = refeicoes.filter(filtro).length;
                                    return total > 0 && (
                                        <td key={tipo}>
                                            <p>Total: {total}</p>
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td colSpan={tiposRefeicoesJantar.length}>
                                    <p><strong>Total Geral para o Jantar: {refeicoes.filter(refeicao => refeicao.jantar || refeicao.jantar_mais_cedo || refeicao.jantar_mais_tarde || refeicao.levar_refeicao).length}</strong></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
            <Link to="/refeicoes" className="inscricao-link">Fazer inscrição</Link>
        </div>
    );
};

export default InscritosRefeicoes;

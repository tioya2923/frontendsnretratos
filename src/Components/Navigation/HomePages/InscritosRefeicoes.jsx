import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../UserContext';
import '../../Styles/InscritosRefeicoes.css';

const InscritosRefeicoes = ({ mostrarAniversarios = true }) => {
    const { userName } = useUser();
    const [refeicoes, setRefeicoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [nomes, setNomes] = useState([]);
    const [confirmacoes, setConfirmacoes] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

    // Data de hoje em Lisboa, no mesmo formato YYYY-MM-DD que o backend
    // devolve em refeicao.data — só se oferece o botão de confirmar no
    // próprio dia da refeição.
    const hojeStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Lisbon' }).format(new Date());

    const toArray = d => Array.isArray(d) ? d : (d && typeof d === 'object') ? [d] : [];
    const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    const fetchAll = useCallback(async () => {
        const t = Date.now();
        try {
            const [refRes, nomesRes, confRes, gruposRes] = await Promise.all([
                axios.get(`${backendUrl}components/refeicoes.php?_=${t}`, authHeaders()),
                axios.get(`${backendUrl}components/aniversarios_usuarios.php?_=${t}`, authHeaders()),
                axios.get(`${backendUrl}components/confirmar_presenca.php?_=${t}`, authHeaders()),
                axios.get(`${backendUrl}components/grupo_refeicao.php?_=${t}`, authHeaders())
            ]);
            setRefeicoes(toArray(refRes.data));
            setNomes(toArray(nomesRes.data));
            setConfirmacoes(toArray(confRes.data));
            setGrupos(toArray(gruposRes.data));
            setError(null);
        } catch (err) {
            setError('Erro ao carregar dados. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    const isConfirmado = (refeicaoId, tipoBase) =>
        confirmacoes.some(c => c.refeicao_id === refeicaoId && c.tipo === tipoBase);

    const handleConfirmarPresenca = async (event, refeicaoId, tipoBase) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            await axios.post(
                `${backendUrl}components/confirmar_presenca.php`,
                { refeicao_id: refeicaoId, tipo: tipoBase },
                authHeaders()
            );
            setConfirmacoes(prev => [...prev, { refeicao_id: refeicaoId, tipo: tipoBase }]);
        } catch (err) {
            alert(err.response?.data?.message || 'Não foi possível confirmar a presença.');
        }
    };

    // Nome + "visto" de quem já confirmou + botão de confirmar para o
    // próprio utilizador, no próprio dia da refeição (a janela horária
    // exata é sempre validada — e reforçada — no backend). tipoBase a
    // null (ex.: coluna de Takeaway) desliga a confirmação — não faz
    // sentido "confirmar presença" em quem vai levar a refeição para casa.
    const renderNome = (refeicao, tipoBase) => {
        if (!tipoBase) return refeicao.nome_completo;

        const confirmado = isConfirmado(refeicao.id, tipoBase);
        const ehHoje = refeicao.data === hojeStr;
        const ehOProprio = !!userName &&
            refeicao.nome_completo?.trim().toLowerCase() === userName.trim().toLowerCase();

        return (
            <>
                {refeicao.nome_completo}
                {confirmado && (
                    <span className="presencaConfirmada" title="Presença confirmada">✓</span>
                )}
                {!confirmado && ehHoje && ehOProprio && (
                    <button
                        className="confirmarPresencaButton"
                        onClick={(e) => handleConfirmarPresenca(e, refeicao.id, tipoBase)}
                    >
                        Confirmar presença
                    </button>
                )}
            </>
        );
    };

    useEffect(() => {
        fetchAll();

        const interval = setInterval(() => {
            if (!document.hidden) fetchAll();
        }, 60000);

        const onVisible = () => { if (!document.hidden) fetchAll(); };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [fetchAll]);

    const handleDelete = async (id) => {
        const refeicao = refeicoes.find(refeicao => refeicao.id === id);
        const dataRefeicao = new Date(refeicao.data);
        const agora = new Date();
        const diferencaHoras = (dataRefeicao - agora) / (1000 * 60 * 60);

        if (diferencaHoras > 24) {
            try {
                await axios.delete(`${backendUrl}components/refeicoes.php`, { data: { id }, ...authHeaders() });
                setRefeicoes(refeicoes.filter(refeicao => refeicao.id !== id));
            } catch (err) {
                setError('Erro ao eliminar inscrição.');
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
        if (!aniversario) return false;

        // Extrai mês/dia diretamente da string (evita usar objetos Date para
        // o ano de nascimento: para anos muito antigos, anteriores à
        // padronização dos fusos horários, o motor de datas do browser pode
        // aplicar um deslocamento histórico e "empurrar" o dia para o dia
        // anterior — não interessa o ano, só precisamos do mês/dia).
        const match = String(aniversario).match(/^\d{4}-(\d{2})-(\d{2})/);
        if (!match) return false;
        const [, mesAniversario, diaAniversario] = match;

        const mesDataAlvo = (data.getMonth() + 1).toString().padStart(2, '0');
        const diaDataAlvo = data.getDate().toString().padStart(2, '0');

        return mesDataAlvo === mesAniversario && diaDataAlvo === diaAniversario;
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
        const calcularFeriados = (ano) => {
            const pascoa = new Date(ano, 2, 31);
            pascoa.setDate(pascoa.getDate() + (7 - pascoa.getDay()));
            const carnaval = new Date(pascoa);
            carnaval.setDate(pascoa.getDate() - 47);
            const sextaFeiraSanta = new Date(pascoa);
            sextaFeiraSanta.setDate(pascoa.getDate() - 2);
            return {
                carnaval: carnaval.toLocaleDateString('pt-PT'),
                sextaFeiraSanta: sextaFeiraSanta.toLocaleDateString('pt-PT')
            };
        };
        return calcularFeriados(ano);
    };

    // Todas as refeições de grupo (data + tipo + número de pessoas), já
    // achatadas numa lista simples — mais fácil de cruzar por dia a seguir.
    // O tipo aceita tanto os valores novos ('almoco'/'jantar', escolhidos
    // num <select>) como texto livre antigo ('Almoço', 'ALMOÇO', ...),
    // por isso a comparação é por sub-string, não por igualdade exata.
    const refeicoesDeGrupo = grupos.flatMap(grupo =>
        (grupo.refeicoes || []).map(r => ({
            data: r.data_refeicao,
            tipo: r.tipo_refeicao,
            numeroPessoas: grupo.numero_pessoas || 0,
            nomeGrupo: grupo.nome_grupo
        }))
    );
    const ehTipoAlmoco = (tipo) => /almo/i.test(tipo || '');
    const ehTipoJantar = (tipo) => /jant/i.test(tipo || '');

    const organizarPorDia = (refeicoes) => {

        const hoje = new Date();
        const seteDias = Array.from({ length: 7 }, (_, i) => {
            const data = new Date();
            data.setDate(hoje.getDate() + i);
            return data;
        });

        const refeicoesPorDia = seteDias.map(data => {
            const dataFormatada = data.toLocaleDateString('pt-PT', { timeZone: 'Europe/Lisbon' }); // Certificando-se que o fuso horário está correto
            const mesDia = dataFormatada.substring(0, 5);
            const feriado = feriadosFixos[mesDia] || Object.values(feriadosVariaveis(data.getFullYear())).find(f => f === dataFormatada);

            const aniversariantesNatalicio = nomes.filter(nome => isBirthday(data, nome.data_aniversario));
            const aniversariantesSacerdotal = nomes
                .filter(nome => nome.data_aniversario_sacerdotal) // Filtrar apenas os que têm data válida
                .filter(nome => isBirthday(data, nome.data_aniversario_sacerdotal));

            const horarioJantar = data.getDay() === 0 ? '20h30' : (feriado || Object.keys(feriadosFixos).includes(dataFormatada.substring(0, 5))) ? '20h30' : '20h00';

            // Grupos marcados para este dia — separados por tipo, para
            // somar ao total certo (Almoço ou Jantar) mais abaixo.
            const gruposDoDia = refeicoesDeGrupo.filter(
                g => new Date(g.data).toDateString() === data.toDateString()
            );
            const gruposAlmoco = gruposDoDia.filter(g => ehTipoAlmoco(g.tipo));
            const gruposJantar = gruposDoDia.filter(g => ehTipoJantar(g.tipo));
            const totalPessoasGruposAlmoco = gruposAlmoco.reduce((soma, g) => soma + g.numeroPessoas, 0);
            const totalPessoasGruposJantar = gruposJantar.reduce((soma, g) => soma + g.numeroPessoas, 0);

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
                horarioJantar,
                gruposAlmoco,
                gruposJantar,
                totalPessoasGruposAlmoco,
                totalPessoasGruposJantar
            };
        });
        return refeicoesPorDia;
    };

    const refeicoesOrganizadas = organizarPorDia(refeicoes);

    

    return (
        <div className='calendarioContainer'>
         
            <h1 className='calendarioTitulo'>Mapa para as Refeições</h1>
            {refeicoesOrganizadas.map(({ dia, data, feriado, aniversariantesNatalicio, aniversariantesSacerdotal, refeicoes, horarioJantar, gruposAlmoco, gruposJantar, totalPessoasGruposAlmoco, totalPessoasGruposJantar }) => (
                <div className='calendarioData' key={data}>
                    <h2 className='calendarioDiaData'>{dia}: {data}</h2>

                    {feriado && <p className='calenderAniversario'><strong>{feriado}</strong></p>}


                    {mostrarAniversarios && aniversariantesNatalicio.length > 0 && (
                        <p className='calenderAniversario'> <strong>Aniversariante do Dia: {aniversariantesNatalicio.join(', ')}</strong></p>
                    )}


                    {mostrarAniversarios && aniversariantesSacerdotal.length > 0 && (
                        <p className='calenderAniversario'><strong>Aniversariante Sacerdotal do Dia: {aniversariantesSacerdotal.join(', ')}</strong></p>
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
                                                        {renderNome(refeicao, 'almoco')}
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
                                    <p>Lugares à mesa: {refeicoes.filter(refeicao => refeicao.almoco).length}</p>
                                </td>
                            </tr>
                            {gruposAlmoco.length > 0 && (
                                <tr>
                                    <td colSpan={tiposRefeicoesAlmoco.length}>
                                        <p>Grupos: {gruposAlmoco.map(g => `${g.nomeGrupo} (${g.numeroPessoas})`).join(', ')}</p>
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <td colSpan={tiposRefeicoesAlmoco.length}>
                                    <p><strong>Total Geral para o Almoço: {
                                        refeicoes.filter(refeicao => refeicao.almoco || refeicao.almoco_mais_cedo || refeicao.almoco_mais_tarde).length
                                        + totalPessoasGruposAlmoco
                                    }</strong></p>
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
                                                        {renderNome(refeicao, tipo === 'Takeaway' ? null : 'jantar')}
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
                                    <p>Lugares à mesa: {refeicoes.filter(refeicao => refeicao.jantar).length}</p>
                                </td>
                            </tr>
                            {gruposJantar.length > 0 && (
                                <tr>
                                    <td colSpan={tiposRefeicoesJantar.length}>
                                        <p>Grupos: {gruposJantar.map(g => `${g.nomeGrupo} (${g.numeroPessoas})`).join(', ')}</p>
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <td colSpan={tiposRefeicoesJantar.length}>
                                    <p><strong>Total Geral para o Jantar: {
                                        refeicoes.filter(refeicao => refeicao.jantar).length +
                                        refeicoes.filter(refeicao => refeicao.jantar_mais_cedo).length +
                                        refeicoes.filter(refeicao => refeicao.jantar_mais_tarde).length +
                                        refeicoes.filter(refeicao => refeicao.levar_refeicao).length +
                                        totalPessoasGruposJantar
                                    }</strong></p>
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

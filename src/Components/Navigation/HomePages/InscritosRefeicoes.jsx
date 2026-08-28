import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiAlertCircle, FiSun, FiMoon, FiPlusCircle } from 'react-icons/fi';
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

    // Dia anterior (calendário local, sem passar por UTC) — usado para o
    // Takeaway, que se confirma na véspera da data da refeição.
    const diaAnterior = (dataStr) => {
        const [ano, mes, dia] = dataStr.split('-').map(Number);
        const d = new Date(ano, mes - 1, dia);
        d.setDate(d.getDate() - 1);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const toArray = d => Array.isArray(d) ? d : (d && typeof d === 'object') ? [d] : [];
    const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    // Só o próprio utilizador pode ver/usar o "Não vem" na sua linha — o
    // backend também valida isto (refeicoes.php, DELETE), esta verificação
    // aqui só evita que o botão sequer apareça para os outros.
    const ehMeuNome = (refeicao) =>
        !!userName && refeicao.nome_completo?.trim().toLowerCase() === userName.trim().toLowerCase();

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
            // Junta com o que já estava (não substitui) — uma confirmação
            // nunca se desfaz, por isso isto é sempre uma união. Sem isto,
            // um polling que tivesse começado mesmo antes de confirmar a
            // presença podia responder depois da atualização otimista e
            // "desfazer" visualmente o visto que acabou de aparecer,
            // mesmo tendo a confirmação ficado gravada no servidor.
            setConfirmacoes(prev => {
                const chave = c => `${c.refeicao_id}-${c.tipo}`;
                const mapa = new Map(prev.map(c => [chave(c), c]));
                toArray(confRes.data).forEach(c => mapa.set(chave(c), c));
                return Array.from(mapa.values());
            });
            setGrupos(toArray(gruposRes.data));
            setError(null);
        } catch (err) {
            setError('Erro ao carregar dados. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    // String(...) dos dois lados porque refeicoes.php devolve o id como
    // texto ("17") e confirmar_presenca.php devolve-o como número (17) —
    // sem servidor com mysqlnd, o mysqli só dá tipos nativos onde o PHP
    // faz cast explícito, e cada endpoint fê-lo de forma diferente. Uma
    // comparação por === direta nunca dava match (exceto logo a seguir a
    // confirmar, por coincidência de tipos nesse instante só).
    const isConfirmado = (refeicaoId, tipoBase) =>
        confirmacoes.some(c => String(c.refeicao_id) === String(refeicaoId) && c.tipo === tipoBase);

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
            toast.error(err.response?.data?.message || 'Não foi possível confirmar a presença.');
        }
    };

    // Nome + "visto" de quem já confirmou + botão de confirmar para o
    // próprio utilizador (a janela horária exata é sempre validada — e
    // reforçada — no backend). tipoBase a null desliga a confirmação.
    const renderNome = (refeicao, tipoBase) => {
        if (!tipoBase) return refeicao.nome_completo;

        const confirmado = isConfirmado(refeicao.id, tipoBase);

        // Takeaway é levantado na véspera da data da refeição — por isso
        // o botão de confirmar aparece nesse dia, não no dia da refeição.
        const diaConfirmacaoStr = tipoBase === 'levar_refeicao'
            ? diaAnterior(refeicao.data)
            : refeicao.data;
        const ehHoje = diaConfirmacaoStr === hojeStr;
        const ehOProprio = ehMeuNome(refeicao);

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
            toast.warn('Não é possível eliminar o nome 24 horas antes da refeição.');
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
        return <div className="pagina"><div className="rodinha" /></div>;
    }

    if (error) {
        return (
            <div className="pagina">
                <div className="estadoVazio cartao">
                    <div className="estadoVazio__icone"><FiAlertCircle /></div>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    // tipoConfirmacao é sempre o nome exato da coluna correspondente em
    // `refeicoes` — é o mesmo valor que o backend espera em
    // confirmar_presenca.php (ver TIPOS_CONFIRMACAO_VALIDOS). Cada
    // variante (incluindo Mais Cedo/Mais Tarde e Takeaway) confirma-se
    // à parte, com a sua própria janela de horário.
    const tiposRefeicoesAlmoco = [
        { tipo: 'Almoço', filtro: refeicao => refeicao.almoco, tipoConfirmacao: 'almoco' },
        { tipo: 'Mais Cedo', filtro: refeicao => refeicao.almoco_mais_cedo, tipoConfirmacao: 'almoco_mais_cedo' },
        { tipo: 'Mais Tarde', filtro: refeicao => refeicao.almoco_mais_tarde, tipoConfirmacao: 'almoco_mais_tarde' }
    ];

    const tiposRefeicoesJantar = [
        { tipo: 'Jantar', filtro: refeicao => refeicao.jantar, tipoConfirmacao: 'jantar' },
        { tipo: 'Mais Cedo', filtro: refeicao => refeicao.jantar_mais_cedo, tipoConfirmacao: 'jantar_mais_cedo' },
        { tipo: 'Mais Tarde', filtro: refeicao => refeicao.jantar_mais_tarde, tipoConfirmacao: 'jantar_mais_tarde' },
        // Takeaway é levantado na véspera da data da refeição — ver o
        // desvio de -1 dia usado tanto aqui (ehHoje) como no agrupamento
        // por dia mais abaixo, e diaConfirmacao() no backend.
        { tipo: 'Takeaway', filtro: refeicao => refeicao.levar_refeicao, tipoConfirmacao: 'levar_refeicao' }
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
        <div className='calendarioContainer pagina pagina--larga'>

            <h1 className='paginaTitulo'>Mapa para as Refeições</h1>
            <p className="paginaSubtitulo">Quem se inscreveu para cada refeição, dia a dia.</p>
            {refeicoesOrganizadas.map(({ dia, data, feriado, aniversariantesNatalicio, aniversariantesSacerdotal, refeicoes, horarioJantar, gruposAlmoco, gruposJantar, totalPessoasGruposAlmoco, totalPessoasGruposJantar }) => (
                <div className='calendarioData cartao' key={data}>
                    <h2 className='calendarioDiaData'>{dia} <span className="calendarioDiaNum">{data}</span></h2>

                    {feriado && <p className='calenderAniversario distintivo distintivo--aviso'>{feriado}</p>}


                    {mostrarAniversarios && aniversariantesNatalicio.length > 0 && (
                        <p className='calenderAniversario'>🎂 Aniversariante do Dia: <strong>{aniversariantesNatalicio.join(', ')}</strong></p>
                    )}


                    {mostrarAniversarios && aniversariantesSacerdotal.length > 0 && (
                        <p className='calenderAniversario'>✝️ Aniversariante Sacerdotal: <strong>{aniversariantesSacerdotal.join(', ')}</strong></p>
                    )}

                    <h3 className='calendarioSeccao'><FiSun /> Almoço: 13h30</h3>
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
                                {tiposRefeicoesAlmoco.map(({ tipo, filtro, tipoConfirmacao }) => {
                                    const inscritos = refeicoes.filter(filtro);
                                    return inscritos.length > 0 && (
                                        <td key={tipo}>
                                            <ul>
                                                {inscritos.map((refeicao) => (
                                                    <li
                                                        key={refeicao.id}
                                                        className={`nomeContainer${ehMeuNome(refeicao) ? ' nomeContainer--proprio' : ''}`}
                                                        onClick={(event) => ehMeuNome(refeicao) && handleClick(event, refeicao.id)}
                                                    >
                                                        {renderNome(refeicao, tipoConfirmacao)}
                                                        {selectedId === refeicao.id && ehMeuNome(refeicao) && (
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
                                <td className="calendarioResumo" colSpan={tiposRefeicoesAlmoco.length}>
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
                                <td className="calendarioResumo" colSpan={tiposRefeicoesAlmoco.length}>
                                    <p><strong>Total Geral para o Almoço: {
                                        refeicoes.filter(refeicao => refeicao.almoco || refeicao.almoco_mais_cedo || refeicao.almoco_mais_tarde).length
                                        + totalPessoasGruposAlmoco
                                    }</strong></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className='calendarioSeccao'><FiMoon /> Jantar: {horarioJantar}</h3>
                    <table className='calendarioTipo'>
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
                                {tiposRefeicoesJantar.map(({ tipo, filtro, tipoConfirmacao }) => {
                                    const inscritos = refeicoes.filter(filtro);
                                    return inscritos.length > 0 && (
                                        <td key={tipo}>
                                            <ul>
                                                {inscritos.map((refeicao) => (
                                                    <li
                                                        key={refeicao.id}
                                                        className={`nomeContainer${ehMeuNome(refeicao) ? ' nomeContainer--proprio' : ''}`}
                                                        onClick={(event) => ehMeuNome(refeicao) && handleClick(event, refeicao.id)}
                                                    >
                                                        {renderNome(refeicao, tipoConfirmacao)}
                                                        {selectedId === refeicao.id && ehMeuNome(refeicao) && (
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
                                <td className="calendarioResumo" colSpan={tiposRefeicoesJantar.length}>
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
                                <td className="calendarioResumo" colSpan={tiposRefeicoesJantar.length}>
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
            <p style={{ textAlign: 'center' }}>
                <Link to="/refeicoes" className="botao botao--primario">
                    <FiPlusCircle /> Fazer inscrição
                </Link>
            </p>
        </div>
    );
};

export default InscritosRefeicoes;

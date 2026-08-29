import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone'; // Importar a biblioteca moment-timezone
import 'moment/locale/pt'; // Importar o idioma português
import '../../Styles/CalendarioRefeicoes.css'; // Importar o arquivo CSS
import { useUser } from '../../../UserContext'; // Importar o contexto do usuário
import { FiSun, FiMoon, FiAlertCircle } from 'react-icons/fi';

const CalendarioRefeicoes = () => {
    const { userName } = useUser(); // Obter o nome do usuário do contexto
    const [semana, setSemana] = useState([]);
    const [erros, setErros] = useState({}); // Estado para as mensagens de erro
    const [levarRefeicao, setLevarRefeicao] = useState({}); // Estado para levar refeição
    const [almoco, setAlmoco] = useState({}); // Estado para almoçar
    const [almocoMaisCedo, setAlmocoMaisCedo] = useState({}); // Estado para almoçar mais cedo
    const [almocoMaisTarde, setAlmocoMaisTarde] = useState({}); // Estado para almoçar mais tarde
    const [jantar, setJantar] = useState({}); // Estado para jantar
    const [jantarMaisCedo, setJantarMaisCedo] = useState({}); // Estado para jantar mais cedo
    const [jantarMaisTarde, setJantarMaisTarde] = useState({}); // Estado para jantar mais tarde

    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const backendUrl = envUrl ? (envUrl.endsWith('/') ? envUrl : envUrl + '/') : '/';

    useEffect(() => {
        // Função para calcular a próxima sexta-feira a partir da data atual
        const calcularProximaSexta = () => {
            const hoje = moment.tz('Europe/Lisbon'); // Usar o fuso horário de Portugal Continental
            const proximaSexta = hoje.clone().day(5); // Definir o dia como sexta-feira
            if (proximaSexta.isBefore(hoje, 'day')) {
                proximaSexta.add(1, 'week'); // Se a sexta-feira já passou, adicionar uma semana
            }
            return proximaSexta;
        };

        const proximaSexta = calcularProximaSexta();
        const diasDaSemana = Array.from({ length: 8 }, (_, i) => {
            const dia = proximaSexta.clone().add(i, 'days');
            return dia.format('YYYY-MM-DD'); // Formato YYYY-MM-DD
        });
        setSemana(diasDaSemana);
    }, []);


    const handleInscricao = (data, tipo) => {
        if (!userName.trim()) return; // Ignorar se o nome do usuário não estiver disponível

        const token = localStorage.getItem('token') || sessionStorage.getItem('token'); // Obter o token de autenticação

        if (!token) {
            console.error('Token de autenticação não encontrado');
            return;
        }

        // Cada botão "Inscrever" só submete as opções da sua própria
        // secção — antes, clicar em qualquer um dos dois enviava sempre o
        // dia inteiro (almoço + jantar juntos), ignorando qual tinha sido
        // clicado, o que confundia quem preenchesse as duas secções antes
        // de clicar. O Takeaway aparece visualmente dentro da secção do
        // Almoço (é lá que tem a checkbox), por isso segue com esse botão.
        const ehAlmoco = tipo === 'almoco';
        const payload = {
            nomes_completos: [userName], // Utilizar o nome do usuário autenticado
            data: data,
            levar_refeicao: ehAlmoco ? (levarRefeicao[data] || false) : false,
            almoco: ehAlmoco ? (almoco[data] || false) : false,
            almoco_mais_cedo: ehAlmoco ? (almocoMaisCedo[data] || false) : false,
            almoco_mais_tarde: ehAlmoco ? (almocoMaisTarde[data] || false) : false,
            jantar: ehAlmoco ? false : (jantar[data] || false),
            jantar_mais_cedo: ehAlmoco ? false : (jantarMaisCedo[data] || false),
            jantar_mais_tarde: ehAlmoco ? false : (jantarMaisTarde[data] || false)
        };

        const algumaOpcaoMarcada = ehAlmoco
            ? (payload.almoco || payload.almoco_mais_cedo || payload.almoco_mais_tarde || payload.levar_refeicao)
            : (payload.jantar || payload.jantar_mais_cedo || payload.jantar_mais_tarde);

        // Chave por dia+secção, não só por dia — com um botão "Inscrever"
        // por secção, um erro do Jantar não pode aparecer (nem ser
        // apagado por um sucesso) na secção do Almoço, e vice-versa.
        const chaveErro = `${data}-${tipo}`;

        if (!algumaOpcaoMarcada) {
            setErros(prev => ({ ...prev, [chaveErro]: 'Selecione pelo menos uma opção antes de inscrever.' }));
            return;
        }

        console.log('Payload:', payload); // Adicionar log para depuração

        axios.post(`${backendUrl}components/refeicoes.php`, payload, {
            headers: {
                'Authorization': `Bearer ${token}` // Adicionar o token de autenticação no cabeçalho
            }
        })
            .then(response => {
                console.log('Response:', response.data); // Adicionar log para depuração
                setErros(prev => ({ ...prev, [chaveErro]: '' })); // Limpar mensagem de erro
                // Limpar só as checkboxes da secção submetida — a outra
                // secção pode ainda ter opções por inscrever.
                if (ehAlmoco) {
                    setLevarRefeicao(prev => ({ ...prev, [data]: false }));
                    setAlmoco(prev => ({ ...prev, [data]: false }));
                    setAlmocoMaisCedo(prev => ({ ...prev, [data]: false }));
                    setAlmocoMaisTarde(prev => ({ ...prev, [data]: false }));
                } else {
                    setJantar(prev => ({ ...prev, [data]: false }));
                    setJantarMaisCedo(prev => ({ ...prev, [data]: false }));
                    setJantarMaisTarde(prev => ({ ...prev, [data]: false }));
                }
            })
            .catch(error => {
                console.error('Erro ao inscrever-se:', error);
                // O backend passou a devolver 409 (com a mesma mensagem) para
                // inscrições duplicadas, em vez de 200 — por isso este caso
                // específico já chega aqui, não ao .then() de sucesso.
                if (error.response?.data?.message === "Já inscrito para esta refeição") {
                    setErros(prev => ({ ...prev, [chaveErro]: "Já inscrito." }));
                } else {
                    setErros(prev => ({ ...prev, [chaveErro]: error.response?.data?.message || 'Erro ao inscrever-se.' }));
                }
            });
    };

    const handleCheckboxChange = (dia, tipo, value) => {
        switch (tipo) {
            case 'levarRefeicao':
                // Takeaway é independente — nunca compromete as outras opções.
                setLevarRefeicao(prev => ({ ...prev, [dia]: value }));
                break;
            case 'almoco':
            case 'almocoMaisCedo':
            case 'almocoMaisTarde':
                // Só pode estar marcada uma destas três ao mesmo tempo —
                // marcar uma desmarca sempre as outras duas do mesmo dia.
                setAlmoco(prev => ({ ...prev, [dia]: tipo === 'almoco' ? value : false }));
                setAlmocoMaisCedo(prev => ({ ...prev, [dia]: tipo === 'almocoMaisCedo' ? value : false }));
                setAlmocoMaisTarde(prev => ({ ...prev, [dia]: tipo === 'almocoMaisTarde' ? value : false }));
                break;
            case 'jantar':
            case 'jantarMaisCedo':
            case 'jantarMaisTarde':
                setJantar(prev => ({ ...prev, [dia]: tipo === 'jantar' ? value : false }));
                setJantarMaisCedo(prev => ({ ...prev, [dia]: tipo === 'jantarMaisCedo' ? value : false }));
                setJantarMaisTarde(prev => ({ ...prev, [dia]: tipo === 'jantarMaisTarde' ? value : false }));
                break;
            default:
                break;
        }
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const calcularTotalGeralJantar = () => {
        const totalJantar = Object.values(jantar).filter(Boolean).length;
        const totalJantarMaisCedo = Object.values(jantarMaisCedo).filter(Boolean).length;
        const totalJantarMaisTarde = Object.values(jantarMaisTarde).filter(Boolean).length;
        const totalLevarRefeicao = Object.values(levarRefeicao).filter(Boolean).length;
        return totalJantar + totalJantarMaisCedo + totalJantarMaisTarde + totalLevarRefeicao;
    };

    const formatarIntervaloDatas = () => {
        if (semana.length > 0) {
            const inicio = moment.tz(semana[0], 'Europe/Lisbon').format('D [de] MMMM');
            const fim = moment.tz(semana[semana.length - 1], 'Europe/Lisbon').format('D [de] MMMM');
            return `${inicio} a ${fim}`;
        }
        return '';
    };

    return (
        <div className="pagina pagina--larga">
            <h1 className="paginaTitulo">Calendário para as Refeições</h1>
            <p className="paginaSubtitulo">{formatarIntervaloDatas()}</p>
            <div className="calendario-semana">
                {semana.map((dia, index) => (
                    <div key={index} className="calendario-dia cartao">
                        <h3>
                            {capitalizeFirstLetter(moment.tz(dia, 'Europe/Lisbon').format('dddd, D [de] MMMM'))}
                        </h3>

                        <p className="calendario-seccaoLabel"><FiSun /> Almoço</p>
                        <div className="refeicao-container">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={almoco[dia] || false}
                                    onChange={(e) => handleCheckboxChange(dia, 'almoco', e.target.checked)}
                                />
                                Almoço
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={almocoMaisCedo[dia] || false}
                                    onChange={(e) => handleCheckboxChange(dia, 'almocoMaisCedo', e.target.checked)}
                                />
                                Almoço mais cedo
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={almocoMaisTarde[dia] || false}
                                    onChange={(e) => handleCheckboxChange(dia, 'almocoMaisTarde', e.target.checked)}
                                />
                                Almoço mais tarde
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={levarRefeicao[dia] || false}
                                    onChange={(e) => handleCheckboxChange(dia, 'levarRefeicao', e.target.checked)}
                                />
                                Takeaway
                            </label>
                        </div>
                        <button className="botao botao--primario botao--pequeno" onClick={() => handleInscricao(dia, 'almoco')}>Inscrever</button>
                        {erros[`${dia}-almoco`] && <p className="erro-mensagem"><FiAlertCircle /> {erros[`${dia}-almoco`]}</p>}

                        <p className="calendario-seccaoLabel"><FiMoon /> Jantar</p>
                        <div className="refeicao-container">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={jantar[dia] || false}
                                    onChange={(e) => handleCheckboxChange(dia, 'jantar', e.target.checked)}
                                />
                                Jantar
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={jantarMaisCedo[dia] || false}
                                    onChange={(e) => handleCheckboxChange(dia, 'jantarMaisCedo', e.target.checked)}
                                />
                                Jantar mais cedo
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={jantarMaisTarde[dia] || false}
                                    onChange={(e) => handleCheckboxChange(dia, 'jantarMaisTarde', e.target.checked)}
                                />
                                Jantar mais tarde
                            </label>
                        </div>
                        <button className="botao botao--primario botao--pequeno" onClick={() => handleInscricao(dia, 'jantar')}>Inscrever</button>
                        {erros[`${dia}-jantar`] && <p className="erro-mensagem"><FiAlertCircle /> {erros[`${dia}-jantar`]}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarioRefeicoes;

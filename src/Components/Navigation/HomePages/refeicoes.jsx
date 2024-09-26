import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone'; // Importar a biblioteca moment-timezone
import '../../Styles/CalendarioRefeicoes.css'; // Importar o arquivo CSS
import { useUser } from '../../../UserContext'; // Importar o contexto do usuário

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

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        // Função para calcular a próxima sexta-feira a partir de uma data específica
        const calcularProximaSexta = (data) => {
            const dia = moment.tz(data, 'Europe/Lisbon'); // Usar o fuso horário de Portugal Continental
            const proximaSexta = dia.day(5); // Definir o dia como sexta-feira
            if (proximaSexta.isBefore(dia, 'day')) {
                proximaSexta.add(1, 'week'); // Se a sexta-feira já passou, adicionar uma semana
            }
            return proximaSexta;
        };

        // Definir a data inicial como 4 de outubro de 2024
        const dataInicial = moment.tz('2024-10-04', 'Europe/Lisbon');
        const proximaSexta = calcularProximaSexta(dataInicial);
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

        const payload = {
            nomes_completos: [userName], // Utilizar o nome do usuário autenticado
            data: data,
            levar_refeicao: levarRefeicao[data] || false,
            almoco: almoco[data] || false,
            almoco_mais_cedo: almocoMaisCedo[data] || false,
            almoco_mais_tarde: almocoMaisTarde[data] || false,
            jantar: jantar[data] || false,
            jantar_mais_cedo: jantarMaisCedo[data] || false,
            jantar_mais_tarde: jantarMaisTarde[data] || false
        };

        console.log('Payload:', payload); // Adicionar log para depuração

        axios.post(`${backendUrl}components/refeicoes.php`, payload, {
            headers: {
                'Authorization': `Bearer ${token}` // Adicionar o token de autenticação no cabeçalho
            }
        })
            .then(response => {
                console.log('Response:', response.data); // Adicionar log para depuração
                if (response.data.message === "Já inscrito para esta refeição" && !payload.levar_refeicao) {
                    setErros(prev => ({ ...prev, [data]: `O ${response.data.nome} já está inscrito para esta refeição.` }));
                } else {
                    setErros(prev => ({ ...prev, [data]: '' })); // Limpar mensagem de erro
                    // Limpar checkboxes
                    setLevarRefeicao(prev => ({ ...prev, [data]: false }));
                    setAlmoco(prev => ({ ...prev, [data]: false }));
                    setAlmocoMaisCedo(prev => ({ ...prev, [data]: false }));
                    setAlmocoMaisTarde(prev => ({ ...prev, [data]: false }));
                    setJantar(prev => ({ ...prev, [data]: false }));
                    setJantarMaisCedo(prev => ({ ...prev, [data]: false }));
                    setJantarMaisTarde(prev => ({ ...prev, [data]: false }));
                }
            })
            .catch(error => {
                console.error('Erro ao inscrever-se:', error);
                if (error.response && error.response.data) {
                    console.error('Erro no servidor:', error.response.data);
                }
            });
    };

    const handleCheckboxChange = (dia, tipo, value) => {
        switch (tipo) {
            case 'levarRefeicao':
                setLevarRefeicao(prev => ({ ...prev, [dia]: value }));
                break;
            case 'almoco':
                setAlmoco(prev => ({ ...prev, [dia]: value }));
                break;
            case 'almocoMaisCedo':
                setAlmocoMaisCedo(prev => ({ ...prev, [dia]: value }));
                break;
            case 'almocoMaisTarde':
                setAlmocoMaisTarde(prev => ({ ...prev, [dia]: value }));
                break;
            case 'jantar':
                setJantar(prev => ({ ...prev, [dia]: value }));
                break;
            case 'jantarMaisCedo':
                setJantarMaisCedo(prev => ({ ...prev, [dia]: value }));
                break;
            case 'jantarMaisTarde':
                setJantarMaisTarde(prev => ({ ...prev, [dia]: value }));
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
        <div className="calendario-container">
            <h2>Calendário para as Refeições</h2>
            <p>{formatarIntervaloDatas()}</p>
            <div className="calendario-semana">
                {semana.map((dia, index) => (
                    <div key={index} className="calendario-dia">
                        <h3>
                            {capitalizeFirstLetter(moment.tz(dia, 'Europe/Lisbon').format('dddd, D [de] MMMM'))}
                        </h3>
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
                        <button onClick={() => handleInscricao(dia, 'almoco')}>Inscrever</button>
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
                        <button onClick={() => handleInscricao(dia, 'jantar')}>Inscrever</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarioRefeicoes;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/CalendarioRefeicoes.css'; // Importar o arquivo CSS

const CalendarioRefeicoes = () => {
    const [semana, setSemana] = useState([]);
    const [nomes, setNomes] = useState([]); // Estado para armazenar os nomes
    const [nomesAlmoco, setNomesAlmoco] = useState({}); // Estado para os nomes no almoço
    const [nomesJantar, setNomesJantar] = useState({}); // Estado para os nomes no jantar
    const [erro, setErro] = useState(''); // Estado para a mensagem de erro
    const [levarRefeicao, setLevarRefeicao] = useState({}); // Estado para levar refeição
    const [almoco, setAlmoco] = useState({}); // Estado para almoçar
    const [almocoMaisCedo, setAlmocoMaisCedo] = useState({}); // Estado para almoçar mais cedo
    const [almocoMaisTarde, setAlmocoMaisTarde] = useState({}); // Estado para almoçar mais tarde
    const [jantar, setJantar] = useState({}); // Estado para jantar
    const [jantarMaisCedo, setJantarMaisCedo] = useState({}); // Estado para jantar mais cedo
    const [jantarMaisTarde, setJantarMaisTarde] = useState({}); // Estado para jantar mais tarde

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        // Gerar um calendário de 12 dias começando hoje
        const hoje = new Date();
        const diasDoCalendario = Array.from({ length: 12 }, (_, i) => {
            const dia = new Date(hoje);
            dia.setDate(hoje.getDate() + i + 4);
            return dia.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        });
        setSemana(diasDoCalendario);

        // Buscar nomes do backend
        axios.get(`${backendUrl}/components/nomes.php`)
            .then(response => {
                if (Array.isArray(response.data)) {
                    setNomes(response.data);
                } else {
                    console.error('Erro: dados recebidos não são um array:', response.data);
                }
            })
            .catch(error => console.error('Erro ao buscar nomes:', error));
    }, [backendUrl]);

    const handleInscricao = (data, tipo, nome) => {
        if (!nome.trim()) return; // Ignorar nomes vazios

        const payload = {
            nomes_completos: [nome], // Enviar o nome atual na solicitação
            data: data,
            levar_refeicao: levarRefeicao[data] || false,
            almoco: almoco[data] || false,
            almoco_mais_cedo: almocoMaisCedo[data] || false,
            almoco_mais_tarde: almocoMaisTarde[data] || false,
            jantar: jantar[data] || false,
            jantar_mais_cedo: jantarMaisCedo[data] || false,
            jantar_mais_tarde: jantarMaisTarde[data] || false
        };

        axios.post(`${backendUrl}/components/refeicoes.php`, payload)
            .then(response => {
                if (response.data.message === "Já inscrito para esta refeição" && !payload.levar_refeicao) {
                    setErro(`O nome ${response.data.nome} já está inscrito para esta refeição.`);
                } else {
                    console.log(response.data);
                    setErro(''); // Limpar mensagem de erro
                    if (tipo.includes('almoco')) {
                        setNomesAlmoco(prev => ({ ...prev, [data]: '' })); // Limpar o campo de nome do almoço
                    } else {
                        setNomesJantar(prev => ({ ...prev, [data]: '' })); // Limpar o campo de nome do jantar
                    }
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
            .catch(error => console.error('Erro ao inscrever-se:', error));
    };

    const handleNomeChange = (dia, tipo, value) => {
        if (tipo.includes('almoco')) {
            const newNomes = { ...nomesAlmoco };
            newNomes[dia] = value;
            setNomesAlmoco(newNomes);
        } else {
            const newNomes = { ...nomesJantar };
            newNomes[dia] = value;
            setNomesJantar(newNomes);
        }
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

    return (
        <div className="calendario-container">
            <h2>Calendário para as Refeições</h2>
            {erro && <p className="erro">{erro}</p>}
            <div className="calendario-semana">
                {semana.map((dia, index) => (
                    <div key={index} className="calendario-dia">
                        <h3>
                            {capitalizeFirstLetter(new Date(dia).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }))}
                        </h3>
                        <div className="refeicao-container">
                            <div className="nomeContainer">
                                <select
                                    value={nomesAlmoco[dia] || ''}
                                    onChange={(e) => handleNomeChange(dia, 'almoco', e.target.value)}
                                    onClick={() => document.querySelectorAll('.nomeContainer').forEach(el => el.classList.remove('active'))}
                                    onFocus={(e) => e.target.parentElement.classList.add('active')}
                                >
                                    <option value="">Selecione um nome para o almoço</option>
                                    {Array.isArray(nomes) && nomes.map((nome, index) => (
                                        <option key={index} value={nome.nome_completo}>{nome.nome_completo}</option>
                                    ))}
                                </select>
                            </div>

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
                        <button onClick={() => handleInscricao(dia, 'almoco', nomesAlmoco[dia] || '')}>Inscrever</button>
                        <div className="refeicao-container">
                            <div className="nomeContainer">
                                <select
                                    value={nomesJantar[dia] || ''}
                                    onChange={(e) => handleNomeChange(dia, 'jantar', e.target.value)}
                                    onClick={() => document.querySelectorAll('.nomeContainer').forEach(el => el.classList.remove('active'))}
                                    onFocus={(e) => e.target.parentElement.classList.add('active')}
                                >
                                    <option value="">Selecione um nome para o jantar</option>
                                    {Array.isArray(nomes) && nomes.map((nome, index) => (
                                        <option key={index} value={nome.nome_completo}>{nome.nome_completo}</option>
                                    ))}
                                </select>
                            </div>
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
                        <button onClick={() => handleInscricao(dia, 'jantar', nomesJantar[dia] || '')}>Inscrever</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarioRefeicoes;

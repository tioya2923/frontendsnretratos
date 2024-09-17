import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/CalendarioRefeicoes.css'; // Importar o arquivo CSS

const CalendarioRefeicoes = () => {
    const [semana, setSemana] = useState([]);
    const [nomesAlmoco, setNomesAlmoco] = useState({}); // Estado para os nomes no almoço
    const [nomesJantar, setNomesJantar] = useState({}); // Estado para os nomes no jantar
    const [erro, setErro] = useState(''); // Estado para a mensagem de erro

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
    }, []);

    const handleInscricao = (data, tipo, nome) => {
        if (!nome.trim()) return; // Ignorar nomes vazios

        axios.post(`${backendUrl}components/refeicoes.php`, {
            nomes_completos: [nome], // Enviar o nome atual na solicitação
            data: data,
            tipo_refeicao: tipo
        })
            .then(response => {
                if (response.data.message === "Já inscrito para esta refeição") {
                    setErro(`O nome ${response.data.nome} já está inscrito para esta refeição.`);
                } else {
                    console.log(response.data);
                    setErro(''); // Limpar mensagem de erro
                    if (tipo === 'almoco') {
                        setNomesAlmoco(prev => ({ ...prev, [data]: '' })); // Limpar o campo de nome do almoço
                    } else {
                        setNomesJantar(prev => ({ ...prev, [data]: '' })); // Limpar o campo de nome do jantar
                    }
                }
            })
            .catch(error => console.error('Erro ao inscrever-se:', error));
    };

    const handleNomeChange = (dia, tipo, value) => {
        if (tipo === 'almoco') {
            const newNomes = { ...nomesAlmoco };
            newNomes[dia] = value;
            setNomesAlmoco(newNomes);
        } else {
            const newNomes = { ...nomesJantar };
            newNomes[dia] = value;
            setNomesJantar(newNomes);
        }
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
        <div className="calendario-container">
            <h2>Calendário para as Refeições</h2>
            <h6>Coloque, se necessário, entre parênteses ( ) ‘mais cedo’ ou ‘mais tarde’ depois do nome.</h6>
            <h6>Para refeições com grupos coleque o número exacto de pessoas e o nome do grupo.</h6>
            {erro && <p className="erro">{erro}</p>}
            <div className="calendario-semana">
                {semana.map((dia, index) => (
                    <div key={index} className="calendario-dia">
                        <h3>
                            {capitalizeFirstLetter(new Date(dia).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }))}
                        </h3>
                        <input
                            type="text"
                            placeholder="Almoço: Nome Completo"
                            value={nomesAlmoco[dia] || ''}
                            onChange={(e) => handleNomeChange(dia, 'almoco', e.target.value)}
                        />
                        <button onClick={() => handleInscricao(dia, 'almoco', nomesAlmoco[dia] || '')}>Inscrever</button>
                        <input
                            type="text"
                            placeholder="Jantar: Nome Completo"
                            value={nomesJantar[dia] || ''}
                            onChange={(e) => handleNomeChange(dia, 'jantar', e.target.value)}
                        />
                        <button onClick={() => handleInscricao(dia, 'jantar', nomesJantar[dia] || '')}>Inscrever</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarioRefeicoes;

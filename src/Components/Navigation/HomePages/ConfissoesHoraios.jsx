import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/ConfissoesHorarios.css'; // Importar o arquivo CSS

const ExibirRefeicoes = () => {
  const [refeicoes, setRefeicoes] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios.get(`${backendUrl}components/confissoes.php`)
      .then(response => {
        setRefeicoes(response.data);
      })
      .catch(error => console.error('Erro ao buscar refeições:', error));
  }, []);

  const agruparPorDiaEHorario = (refeicoes) => {
    return refeicoes.reduce((acc, refeicao) => {
      const { dia_semana, horario_inicio, horario_fim, data } = refeicao;
      const chave = `${horario_inicio}-${horario_fim}`;
      if (!acc[chave]) {
        acc[chave] = { horario_inicio, horario_fim, dias: {} };
      }
      if (!acc[chave].dias[dia_semana]) {
        acc[chave].dias[dia_semana] = { data, nomes: [] };
      }
      acc[chave].dias[dia_semana].nomes.push(refeicao.nome);
      return acc;
    }, {});
  };

  const formatarHorario = (horario) => {
    return horario.slice(0, 5); // Remove os segundos
  };

  const capitalizarDiaSemana = (dia) => {
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  };

  const ordenarDiasSemana = (dias) => {
    const ordem = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dias.sort((a, b) => ordem.indexOf(a) - ordem.indexOf(b));
  };

  const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-');
    const dataFormatada = new Date(ano, mes - 1, dia);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dataFormatadaString = dataFormatada.toLocaleDateString('pt-PT', options);
    return dataFormatadaString.replace(/^\w/, (c) => c.toUpperCase());
  };

  const obterDatasSemana = () => {
    const hoje = new Date();
    const primeiroDiaSemana = hoje.getDate() - hoje.getDay(); // Obter o primeiro dia da semana (domingo)
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(hoje);
      dia.setDate(primeiroDiaSemana + i);
      return {
        diaSemana: dia.toLocaleDateString('pt-PT', { weekday: 'long' }),
        data: dia.getDate(), // Apenas o dia
        mesAno: dia.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase()) // Mês e ano com inicial maiúscula
      };
    });
  };

  const refeicoesAgrupadas = agruparPorDiaEHorario(refeicoes);

  const diasSemana = ordenarDiasSemana([...new Set(refeicoes.map(refeicao => capitalizarDiaSemana(refeicao.dia_semana)))]);

  const datasSemana = obterDatasSemana();

  const horariosOrdenados = Object.keys(refeicoesAgrupadas).sort((a, b) => {
    const [inicioA] = a.split('-');
    const [inicioB] = b.split('-');
    return inicioA.localeCompare(inicioB);
  });

  const primeiroDia = `${datasSemana[0].data}`;
  const ultimoDia = `${datasSemana[datasSemana.length - 1].data}`;
  const primeiroMesAno = `${datasSemana[0].mesAno}`;
  const ultimoMesAno = `${datasSemana[datasSemana.length - 1].mesAno}`;

  const titulo = primeiroMesAno === ultimoMesAno
    ? `Confissões de ${primeiroDia} a ${ultimoDia} de ${primeiroMesAno}`
    : `Confissões de ${primeiroDia} de ${primeiroMesAno} a ${ultimoDia} de ${ultimoMesAno}`;

  return (
    <div className="exibir-refeicoes-container">
      <h4>{titulo}</h4>
      <table className="tabela-refeicoes">
        <thead>
          <tr>
            <th colSpan="2">Horário</th>
            {datasSemana.map((data, index) => (
              <th key={index}>
                {data.diaSemana.charAt(0).toUpperCase() + data.diaSemana.slice(1)}
                <br />
                <span className="data-dia">{data.data}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horariosOrdenados.map((chave, index) => {
            const { horario_inicio, horario_fim, dias } = refeicoesAgrupadas[chave];
            return (
              <tr key={index}>
                <td>{formatarHorario(horario_inicio)}</td>
                <td>{formatarHorario(horario_fim)}</td>
                {datasSemana.map((data, diaIndex) => (
                  <td key={diaIndex}>
                    {dias[data.diaSemana.toLowerCase()] && (
                      <div className="nomes-verticais">
                        {dias[data.diaSemana.toLowerCase()].nomes.map((nome, nomeIndex) => (
                          <div key={nomeIndex}>{nome}</div>
                        ))}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExibirRefeicoes;

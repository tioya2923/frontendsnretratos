import React, { useState } from 'react';
import Horarios from './ConfissoesHoraios';
import InserirRefeicao from './InserirNome';

const GerenciamentoRefeicoes = () => {
  const [refeicoes, setRefeicoes] = useState([]);

  const handleAddRefeicao = (novaRefeicao) => {
    setRefeicoes([...refeicoes, novaRefeicao]);
  };

  return (
    <div>
      <h1>Gerenciamento de Refeições</h1>
      <InserirRefeicao onAddRefeicao={handleAddRefeicao} />
      <Horarios refeicoes={refeicoes} />
    </div>
  );
};

export default GerenciamentoRefeicoes;

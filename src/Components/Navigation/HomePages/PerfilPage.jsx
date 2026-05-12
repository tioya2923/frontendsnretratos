import React from 'react';
import styled from 'styled-components';
import AtividadesPage from './AtividadesPage';

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
  font-family: sans-serif;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  color: #4b0303;
  font-weight: 700;
  margin-bottom: 4px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4b030320;
`;

export default function PerfilPage() {
  return (
    <Page>
      <SectionTitle>As Minhas Atividades</SectionTitle>
      <AtividadesPage />
    </Page>
  );
}

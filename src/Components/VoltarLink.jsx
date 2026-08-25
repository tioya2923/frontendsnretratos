import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

/**
 * Link "Voltar" colocado no fim de uma página — mesmo padrão já usado em
 * AddGroupsToMeal/AdPrivacidade/EsqueciPassword, agora reutilizável.
 *
 * Fica ao nível da rota (App.js), não dentro de cada página, porque
 * algumas páginas (InscritosRefeicoes, AtividadesPage) também são
 * embutidas noutras (Home, PerfilPage) — pôr o link lá dentro apareceria
 * também nesses sítios, onde não faz sentido.
 */
export default function VoltarLink({ to, label }) {
    return (
        <p style={{ textAlign: 'center', margin: '24px 0' }}>
            <Link to={to} className="linkVoltar">
                <FiArrowLeft /> {label}
            </Link>
        </p>
    );
}

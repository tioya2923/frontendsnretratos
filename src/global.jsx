import { createGlobalStyle } from "styled-components";

// A maior parte do sistema de design vive em Styles/tokens.css (variáveis
// CSS, cartões, botões, tabelas, formulários — partilhados por toda a
// app). Isto trata só do reset base e do fundo/tipografia do <body>.
export const GlobalStyles = createGlobalStyle`
    html, body {
        margin: 0;
        padding: 0;
    }

    *, *::after, *::before {
        box-sizing: border-box;
    }

    html {
        scroll-behavior: smooth;
    }

    body {
        background: var(--cor-fundo);
        color: var(--cor-texto);
        font-family: var(--fonte-corpo);
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
`;

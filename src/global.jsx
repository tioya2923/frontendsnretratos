import { createGlobalStyle } from "styled-components";
import "flag-icons/css/flag-icons.min.css";

export const GlobalStyles = createGlobalStyle`
    html, body {
        margin: 0;
        padding: 0;
    }

    *, *::after, *::before {
        box-sizing: border-box;
    }

    body {
        align-items: center;
        background: ${({ theme }) => theme.primaryDark};
        color: ${({ theme }) => theme.primaryLight};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        text-rendering: optimizeLegibility;
    }

    /* Estilos para telemóveis */
    @media (max-width: 600px) {
        body {
            font-size: 0.75rem;
            text-align: center;
            color: black;
            background: ${({ theme }) => theme.primaryPhones};
        }
    }

    /* Estilos para tablets */
    @media (min-width: 601px) and (max-width: 1024px) {
        body {
            font-size: 1rem;
            text-align: center;
            color: black;
            background: ${({ theme }) => theme.primaryTablets};
        }
    }

    /* Estilos para laptops */
    @media (min-width: 1025px) and (max-width: 1440px) {
        body {
            font-size: 1.2rem;
            text-align: center;
            color: black;
            background: ${({ theme }) => theme.primaryLaptops};
        }
    }

    /* Estilos para computadores de secretária */
    @media (min-width: 1441px) {
        body {
            font-size: 1.5rem;
            text-align: center;
            color: black;
            background: ${({ theme }) => theme.primaryLargeLaptops};
        }
    }
`;

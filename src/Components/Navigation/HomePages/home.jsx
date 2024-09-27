import React from 'react';
import { useUser } from '../../../UserContext';
import logo from '../Logo/sn.png';
import Refeicoes from './InscritosRefeicoes';
import Calendario from './refeicoes';
import Fotografias from './fotografias';
import '../../Styles/home.css'; // Importar o arquivo CSS

function Home() {
    const { userName } = useUser();

    return (
        <div className="home-container">
            <h1 className="home-title">{userName}, Seja Bem-vindo!</h1>
            <img src={logo} alt="Logo" className="snImage" />
            <div className="home-content">
                <Refeicoes />
                <Calendario />
                <Fotografias />
            </div>
        </div>
    );
}

export default Home;

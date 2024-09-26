import React, { useState } from "react";
import "./Navbar.css";
import logo from './Logo/logopsn.png';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const navigation = [
        { link: '#/programa', text: '' },
        { link: '#/missas', text: '' },
        { link: '#/ConfissoesHorarios', text: '' },
        { link: '#/cantores', text: '' },
        { link: '#/acolitos', text: '' },
        { link: "/refeicoes", text: "Inscrição para as refeições" },
        { link: '/InscritosRefeicoes', text: 'Refeições' },
        { link: '/fotografias', text: 'Retratos' },
        { link: "/Privacidade", text: "Admin" },
       
    ];

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar-init">
            <div className="navbar-content">
                <a href="/home" className="logo-container">
                    <img src={logo} alt="Logo" className="logo" />
                </a>
                <div className="hamburger-menu" onClick={toggleMenu}>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <ul className={`menu-links ${menuOpen ? 'show' : ''}`}>
                    {navigation.map((nav) => (
                        <li key={nav.text} className="nav-item">
                            <a href={nav.link} className="nav-link">
                                {nav.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;

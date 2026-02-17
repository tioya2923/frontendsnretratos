import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from './Logo/logopsn.png';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const navigation = [
    
        { link: "/refeicoes", text: "Inscrição para as refeições" },
        { link: '/InscritosRefeicoes', text: 'Refeições' },
        { link: "/Privacidade", text: "Admin" },
    ];

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar-init">
            <div className="navbar-content">
                <Link to="/home" className="logo-container">
                    <img src={logo} alt="Logo" className="logo" />
                </Link>
                <div className="hamburger-menu" onClick={toggleMenu}>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <ul className={`menu-links ${menuOpen ? 'show' : ''}`}>
                    {navigation.map((nav) => (
                        <li key={nav.text} className="nav-item">
                            <Link to={nav.link} className="nav-link">
                                {nav.text}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;

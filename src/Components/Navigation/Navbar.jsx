import React from "react";
import "./Navbar.css";
import logo from './Logo/logopsn.png';

const Navbar = () => {

    const navigation = [
        { link: '/fotografias', text: 'Fotografias' },
        { link: '/videos', text: 'Vídeos' },
        { link: '/areaPessoal', text: 'Admin' },
    ];


    return (
        <nav className="navbar-init">
            <div className="navbar-content">
                <a href="/home" className="logo-container">
                    <img src={logo} alt="Logo" className="logo" />
                </a>
                <ul className="menu-links">
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

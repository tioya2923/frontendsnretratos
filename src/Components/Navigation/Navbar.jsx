import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from './Logo/logopsn.png';
import InstallPwaButton from "../InstallPwaButton";
import NotificationToggle from "../NotificationToggle";
import { useUser } from "../../UserContext";

function initials(name = '') {
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

const navigation = [
    { link: "/refeicoes",          text: "Inscrição" },
    { link: '/InscritosRefeicoes', text: 'Refeições' },
    { link: "/mensagens",          text: "Mensagens" },
    { link: "/Privacidade",        text: "Admin" },
];

const Navbar = () => {
    const { userName, unreadMessages } = useUser();

    return (
        <nav className="navbar-init">
            <div className="navbar-content">

                {/* Logo */}
                <Link to="/home" className="logo-container">
                    <img src={logo} alt="Logo" className="logo" />
                </Link>

                {/* Links — sempre visíveis */}
                <ul className="menu-links">
                    {navigation.map((nav) => (
                        <li key={nav.link}>
                            <Link to={nav.link} className="nav-link">
                                {nav.text}
                                {nav.link === '/mensagens' && unreadMessages > 0 && (
                                    <span className="nav-badge">
                                        {unreadMessages > 99 ? '99+' : unreadMessages}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Ações */}
                <div className="navbar-actions">
                    <NotificationToggle />
                    <InstallPwaButton />
                    <Link to="/perfil" className="avatar-link" title="O meu perfil">
                        <div className="avatar-circle">{initials(userName)}</div>
                    </Link>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;

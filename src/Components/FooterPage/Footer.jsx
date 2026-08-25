import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const navigation = [
    { link: "/refeicoes", text: "Inscrição para as refeições" },
    { link: "/Privacidade", text: "Admin" },
];

const Footer = () => {
    return (
        <div className="container-footer">
            <nav>
                <ul className="footer-nav">
                    {navigation.map((nav) => (
                        <li key={nav.link}>
                            <Link to={nav.link}>{nav.text}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Footer;

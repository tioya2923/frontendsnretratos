import React from "react";
import "./Footer.css";

const Footer = () => {
    const navigation = [
        { link: "/fotografias", text: "Retratos" },          
        { link: "/Privacidade", text: "Admin" },
    ];
    

    return (
        <div className="container-footer">
            <nav>
                <ul className="footer-nav">
                    {navigation.map((nav) => (
                        <li key={nav.text}>
                            <a href={nav.link}>{nav.text}</a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}; 

export default Footer;

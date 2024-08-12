import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../Styles/AreaPessoal.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

function AreaPessoal() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    const handleSubmit = () => {
        const errors = validateInputs();
        if (errors.length > 0) {
            return;
        }

        const backendUrl = process.env.REACT_APP_BACKEND_URL;

        const url = `${backendUrl}components/areaPessoal.php`
        
        let fData = new FormData();
        fData.append("email", email);
        fData.append("password", password);
        axios.post(url, fData)
            .then(response => {
                if (response.data.message === "Login bem-sucedido") {
                    toast.success("Login bem-sucedido");
                    setLoggedIn(true);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(error => toast.error(error.response.data.message));
    };

  
    const validateInputs = () => {
        let errors = [];
        if (email.length === 0) {
            errors.push("Insira o seu email");
        } else if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
            errors.push("Insira um email válido");
        }
        if (password.length === 0) {
            errors.push("Insira a palavra passe");
        }
        document.getElementById("email-error").textContent = errors.find(e => e.includes("email")) || "";
        document.getElementById("password-error").textContent = errors.find(e => e.includes("palavra passe")) || "";
        return errors;
    };
    useEffect(() => {
        if (loggedIn) {
            setEmail("");
            setPassword("");
            setLoggedIn(false);
        }
    }, [loggedIn]); // Passa loggedIn como dependência do efeito
    return (
        <div className="container-form">
            <label htmlFor="email"></label>
            <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
            <span id="email-error" className="error"></span>
            <label htmlFor="password"></label>
            <div className="input-wrapper">
                <input type={showPassword ? "text" : "password"} name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Palavra-passe" required />
                <i onClick={() => setShowPassword(!showPassword)} className="toggle-password">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </i>
            </div>

            <span id="password-error" className="error"></span>
            <button onClick={handleSubmit}>Entrar</button>
            {loggedIn && <Navigate to="/administracao" replace />}
            <ToastContainer />
        </div>
    );
}
export default AreaPessoal;

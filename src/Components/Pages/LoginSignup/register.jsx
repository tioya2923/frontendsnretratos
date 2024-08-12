import React, { useState, useEffect } from "react";
import "./Register.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [registered, setRegistered] = useState(false);


  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleSubmit = () => {
    const errors = validateInputs();
    if (errors.length > 0) {
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("As palavras passe não coincidem");
      return;
    }

    const url = `${backendUrl}components/registar.php`
    let fData = new FormData();
    fData.append("name", name);
    fData.append("email", email);
    fData.append("password", password);
    fData.append("newRegistration", true);
    axios
      .post(url, fData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((response) => {
        if (response.data === "error=email_exists") {
          toast.error("O e-mail já existe");
        } else if (response.data === "success") {
          // O usuário foi registrado com sucesso e o administrador foi notificado
          toast.success("Registro bem-sucedido! Aguarde a aprovação do administrador.");
          setRegistered(true);
        } else {
          // Trate outros erros aqui
          toast.error(response.data);
        }
      })
      .catch((error) => toast.error(error));
  };
  const validateInputs = () => {
    let errors = [];
    if (name.length === 0) {
      errors.push("Insira o seu nome");
    }
    if (email.length === 0) {
      errors.push("Insira o seu email");
    } else if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
      errors.push("Insira um email válido");
    }
    if (password.length === 0) {
      errors.push("Insira a palavra passe");
    } else if (password.length < 8) {
      errors.push("A palavra passe deve ter pelo menos 8 caracteres");
    }
    document.getElementById("name-error").textContent =
      errors.find((e) => e.includes("nome")) || "";
    document.getElementById("email-error").textContent =
      errors.find((e) => e.includes("email")) || "";
    document.getElementById("password-error").textContent =
      errors.find((e) => e.includes("palavra passe")) || "";
    return errors;
  };
  useEffect(() => {
    if (registered) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRegistered(false);
    }
  }, [registered]);
  return (
    <div>
      <div className="container-form">

        <label htmlFor="name"></label>
        <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required />
        <span id="name-error" className="error"></span>
        <label htmlFor="email"></label>
        <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
        <span id="email-error" className="error"></span>
        <label htmlFor="password"></label>
        <input type={showPassword ? "text" : "password"} name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Palavra-passe" required />
        <span id="password-error" className="error"></span>
        <label htmlFor="confirm-password"></label>
        <input type={showPassword ? "text" : "password"} name="confirm-password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar palavra-passe" required />
        <span id="confirm-error" className="error">{confirmError}</span>
        <label htmlFor="show-password">Ver palavra-passe</label>
        <input type="checkbox" name="show-password" id="show-password" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
        <input type="button" name="send" id="send" value="Submeter" onClick={handleSubmit} />

      </div >
      <ToastContainer />
    </div>
  );
}
export default Register;
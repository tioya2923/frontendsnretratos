import React, { useState } from "react";
import Select from "react-select";
import "flag-icons/css/flag-icons.min.css";
import "./Register.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { allCountries } from "./countryCodes";

// Ordenação dos países
const sortedCountries = [...allCountries].sort((a, b) => {
  if (a.code === "+1") return -1;
  if (b.code === "+1") return 1;
  return parseInt(a.code.replace(/\D/g, "")) - parseInt(b.code.replace(/\D/g, ""));
});

export default function Register() {
  const [selectedCountry, setSelectedCountry] = useState(sortedCountries[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dataAniversario, setDataAniversario] = useState("");
  const [dataAniversarioSacerdotal, setDataAniversarioSacerdotal] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [dataAniversarioError, setDataAniversarioError] = useState("");

  const hoje = new Date().toISOString().split("T")[0];

  const backendEnv = process.env.REACT_APP_BACKEND_URL;
  const backendUrl = backendEnv.endsWith("/") ? backendEnv : backendEnv + "/";

  // ---------------- VALIDAR CAMPOS ----------------
  const validateInputs = () => {
    let errors = [];

    let nameErr = "";
    let emailErr = "";
    let passwordErr = "";
    let whatsappErr = "";
    let dataAniversarioErr = "";

    if (!name.trim()) {
      nameErr = "Insira o seu nome";
      errors.push(nameErr);
    }

    if (!email.trim()) {
      emailErr = "Insira o seu email";
      errors.push(emailErr);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailErr = "Insira um email válido";
      errors.push(emailErr);
    }

    if (!password) {
      passwordErr = "Insira a palavra passe";
      errors.push(passwordErr);
    } else if (password.length < 8) {
      passwordErr = "A palavra passe deve ter pelo menos 8 caracteres";
      errors.push(passwordErr);
    }

    if (!whatsapp.trim()) {
      whatsappErr = "Insira o número do WhatsApp";
      errors.push(whatsappErr);
    } else if (!/^\d{8,12}$/.test(whatsapp)) {
      whatsappErr = "Número inválido. Insira apenas o número, sem o código do país.";
      errors.push(whatsappErr);
    }

    if (!dataAniversario) {
      dataAniversarioErr = "Insira a data de aniversário natalício";
      errors.push(dataAniversarioErr);
    } else if (dataAniversario > hoje) {
      dataAniversarioErr = "A data de aniversário não pode ser no futuro";
      errors.push(dataAniversarioErr);
    }

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setWhatsappError(whatsappErr);
    setDataAniversarioError(dataAniversarioErr);

    return errors;
  };

  // ---------------- SUBMETER FORM ----------------
  const handleSubmit = async () => {
    const errors = validateInputs();
    if (errors.length > 0) return;

    if (password !== confirmPassword) {
      setConfirmError("As palavras passe não coincidem");
      return;
    }
    setConfirmError("");

    const url = `${backendUrl}components/registar.php`;

    const payload = {
      name,
      email,
      password,
      whatsapp: selectedCountry.code.replace("+", "") + whatsapp,
      dataAniversario,
      dataAniversarioSacerdotal: dataAniversarioSacerdotal || null,
      newRegistration: true
    };

    try {
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" }
      });

      if (response.data.status === "email_exists") {
        toast.error("O e-mail já existe");
      } else if (response.data.status === "success") {
        toast.success("Registo bem-sucedido! Aguarde a aprovação do administrador.");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setWhatsapp("");
        setDataAniversario("");
        setDataAniversarioSacerdotal("");
      } else {
        toast.error(response.data.message || "Erro ao registrar. Tente novamente.");
      }

    } catch (error) {
      toast.error("Erro de conexão. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="register-center-wrapper">
      <div className="container-form">
        <h2>Registar</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Nome */}
          <div className="form-group">
            <label>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
            {nameError && <span className="error">{nameError}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
            {emailError && <span className="error">{emailError}</span>}
          </div>

          {/* WhatsApp */}
          <div className="form-group">
            <label>WhatsApp</label>
            <div className="form-group-row">
              <Select
                className="whatsapp-select"
                classNamePrefix="react-select"
                value={{
                  value: selectedCountry.code,
                  label: (
                    <span>
                      <span className={`fi fi-${selectedCountry.iso}`} style={{ marginRight: 8 }}></span>
                      {selectedCountry.code}
                    </span>
                  ),
                }}
                onChange={(option) => {
                  const found = sortedCountries.find((c) => c.code === option.value);
                  setSelectedCountry(found || sortedCountries[0]);
                }}
                options={sortedCountries.map((country) => ({
                  value: country.code,
                  label: (
                    <span>
                      <span className={`fi fi-${country.iso}`} style={{ marginRight: 8 }}></span>
                      {country.code}
                    </span>
                  ),
                }))}
                isSearchable
              />

              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="Número sem código"
                className="whatsapp-input"
              />
            </div>
            {whatsappError && <span className="error">{whatsappError}</span>}
          </div>

          {/* Datas de aniversário */}
          <div className="form-group">
            <div className="form-group-row dates-row">
              <div className="date-field">
                <label>Aniversário Natalício</label>
                <input
                  type="date"
                  value={dataAniversario}
                  max={hoje}
                  onChange={(e) => setDataAniversario(e.target.value)}
                  required
                />
              </div>
              <div className="date-field">
                <label>Aniversário Sacerdotal <span className="optional-tag">(opcional)</span></label>
                <input
                  type="date"
                  value={dataAniversarioSacerdotal}
                  max={hoje}
                  onChange={(e) => setDataAniversarioSacerdotal(e.target.value)}
                />
              </div>
            </div>
            {dataAniversarioError && <span className="error">{dataAniversarioError}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Palavra Passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordError && <span className="error">{passwordError}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirmar Palavra Passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmError && <span className="error">{confirmError}</span>}
          </div>

          <button type="submit">Registar</button>
        </form>

        <div className="register-form-login" style={{ marginTop: 16, textAlign: "center" }}>
          <span style={{ color: "#ece0d4", fontSize: "0.98em" }}>
            Já tem conta?
            <a href="/login" style={{ color: "#16e135", fontWeight: 600, marginLeft: 6, textDecoration: "none" }}>
              Faça Login
            </a>
          </span>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}

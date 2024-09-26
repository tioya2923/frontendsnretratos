import React, { useState, useEffect } from "react";
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from "prop-types";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./global";
import { theme } from "./theme";
import Navbar from "./Components/Navigation/Navbar";
import Footer from "./Components/FooterPage/Footer";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Components/Navigation/HomePages/home";
import Fotografias from "./Components/Navigation/HomePages/fotografias";
import InsertImages from "./Components/Store/insertImages";
import Login from "./Components/Pages/LoginSignup/login";
import Register from "./Components/Pages/LoginSignup/register";
import AreaPessoal from "./Components/Navigation/HomePages/areaPessoal";
import DeletePhoto from "./Components/delete/DeletePhoto";
import Administracao from "./Components/Navigation/HomePages/Administracao";
import Privacidade from "./Components/Pages/LoginSignup/Privacidade";
import UpdateUsuarios from "./Components/Navigation/HomePages/updateUsuarios";
import AdPrivacidade from "./Components/Pages/LoginSignup/AdPrivacidade";
import UpdateAdministradores from "./Components/Navigation/HomePages/updateAdministradores";
import CalendarioRefeicoes from "./Components/Navigation/HomePages/refeicoes";
import InscritosRefeicoes from "./Components/Navigation/HomePages/InscritosRefeicoes";
import ConfissoesHorarios from "./Components/Navigation/HomePages/ConfissoesHoraios";
import InserirNome from "./Components/Navigation/HomePages/InserirNome";
import InserirNomeConf from "./Components/Navigation/HomePages/InserirNomeConf";
import GerenciamentoRefeicoes from "./Components/Navigation/HomePages/GerenciamentoRefeicoes";
import AdicionarNome from "./Components/Navigation/HomePages/AdicionarNome";
import MembrosGrupos from "./Components/Navigation/HomePages/gruposMembros";
import AddGroupsToMeal from "./Components/Navigation/HomePages/AddGroupsToMeal";
import RefeicoesList from "./Components/Navigation/HomePages/RefeicoesGrupo";
import Notificacoes from "./Components/Navigation/HomePages/Notificacoes";
import GruposList from "./Components/Navigation/HomePages/RefeicoesGrupo";
import ProtectedRoute from "./Components/Pages/LoginSignup/ProtectedRoute";
import { UserProvider } from './UserContext'; // Import the UserProvider

function PrivateRoute({ children, isAuthenticated }) {
  if (isAuthenticated) {
    return children;
  }
  return <Navigate to="/login" />;
}
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyles />
        <Router>
          <UserProvider> {/* Wrap your app with UserProvider */}
            <Routes>
              <Route path="/" element={<><Navbar /><PrivateRoute isAuthenticated={isAuthenticated}><Home /></PrivateRoute><Footer /></>} />
              <Route path="/home" element={<><Navbar /><Home /><Footer /></>} />
              <Route path="/fotografias" element={<><Navbar /><Fotografias /><Footer /></>} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/insertImages" element={<><Navbar /><InsertImages /><Footer /></>} />
              <Route path="/areaPessoal" element={<><Navbar /><AreaPessoal /><Footer /></>} />
              <Route path="/deletePhoto" element={<><Navbar /><DeletePhoto /><Footer /></>} />
              <Route path="/administracao" element={<><Navbar /><Administracao /><Footer /></>} />
              <Route path="/privacidade" element={<><Navbar /><Privacidade /><Footer /></>} />
              <Route path="/updateUsuarios" element={<><Navbar /><UpdateUsuarios /><Footer /></>} />
              <Route path="/adPrivacidade" element={<><Navbar /><AdPrivacidade /><Footer /></>} />
              <Route path="/updateAdministradores" element={<><Navbar /><UpdateAdministradores /><Footer /></>} />
              <Route path="/refeicoes" element={<><Navbar /><CalendarioRefeicoes /><Footer /></>} />
              <Route path="/InscritosRefeicoes" element={<><Navbar /><InscritosRefeicoes /><Footer /></>} />
              <Route path="/ConfissoesHorarios" element={<><Navbar /><ConfissoesHorarios /><Footer /></>} />
              <Route path="/InserirNome" element={<><Navbar /><InserirNome /><Footer /></>} />
              <Route path="/InserirNomeConf" element={<><Navbar /><InserirNomeConf /><Footer /></>} />
              <Route path="/GerenciamentoRefeicoes" element={<><Navbar /><GerenciamentoRefeicoes  /><Footer /></>} />
              <Route path="/AdicionarNome" element={<><Navbar /><AdicionarNome  /><Footer /></>} />
              <Route path="/gruposMembros" element={<><Navbar /><MembrosGrupos  /><Footer /></>} />
              <Route path="/AddGroupsToMeal" element={<><Navbar /><AddGroupsToMeal   /><Footer /></>} />
              <Route path="/RefeicoesList" element={<><Navbar /><RefeicoesList   /><Footer /></>} />
              <Route path="/Notificacoes" element={<><Navbar /><Notificacoes  /><Footer /></>} />
              <Route path="/GruposList" element={<><Navbar /><GruposList  /><Footer /></>} />
              <Route path="/ProtectedRoute" element={<><Navbar /><ProtectedRoute  /><Footer /></>} />
            </Routes>
          </UserProvider>
        </Router>
      </>
    </ThemeProvider>
  );
}
export default App;

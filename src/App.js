import React from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./global";
import { theme } from "./theme";
import Navbar from "./Components/Navigation/Navbar";
import Footer from "./Components/FooterPage/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Navigation/HomePages/home";
import Fotografias from "./Components/Navigation/HomePages/fotografias";
import InsertImages from "./Components/Store/insertImages";
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyles />
        <Router>
          <Routes>
            <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
            <Route path="/home" element={<><Navbar /><Home /><Footer /></>} />
            <Route path="/fotografias" element={<><Navbar /><Fotografias /><Footer /></>} />
            <Route path="/refeicoes" element={<><Navbar /><CalendarioRefeicoes /><Footer /></>} />
            <Route path="/InscritosRefeicoes" element={<><Navbar /><InscritosRefeicoes /><Footer /></>} />
            <Route path="/ConfissoesHorarios" element={<><Navbar /><ConfissoesHorarios /><Footer /></>} />
            <Route path="/InserirNome" element={<><Navbar /><InserirNome /><Footer /></>} />
            <Route path="/InserirNomeConf" element={<><Navbar /><InserirNomeConf /><Footer /></>} />
            <Route path="/GerenciamentoRefeicoes" element={<><Navbar /><GerenciamentoRefeicoes /><Footer /></>} />
            <Route path="/AdicionarNome" element={<><Navbar /><AdicionarNome /><Footer /></>} />
            <Route path="/insertImages" element={<><Navbar /><InsertImages /><Footer /></>} />
            <Route path="/areaPessoal" element={<><Navbar /><AreaPessoal /><Footer /></>} />
            <Route path="/deletePhoto" element={<><Navbar /><DeletePhoto /><Footer /></>} />
            <Route path="/administracao" element={<><Navbar /><Administracao /><Footer /></>} />
            <Route path="/privacidade" element={<><Navbar /><Privacidade /><Footer /></>} />
            <Route path="/updateUsuarios" element={<><Navbar /><UpdateUsuarios /><Footer /></>} />
            <Route path="/adPrivacidade" element={<><Navbar /><AdPrivacidade /><Footer /></>} />
            <Route path="/updateAdministradores" element={<><Navbar /><UpdateAdministradores /><Footer /></>} />
          </Routes>
        </Router>
      </>
    </ThemeProvider>
  );
}

export default App;
